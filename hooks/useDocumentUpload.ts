import { CapturedPage, EntityType } from '@/types';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { useState } from 'react';
import { useApiClient } from './useApiClient';

interface UploadDocumentParams {
  entityType: EntityType;
  formData: any;
  pages: CapturedPage[];
}

interface UploadDocumentResponse {
  success: boolean;
  message?: string;
  documentId?: number;
}

export const useDocumentUpload = () => {
  const { request } = useApiClient();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const generatePDFFromImages = async (pages: CapturedPage[]): Promise<string> => {
    // Criar HTML com as imagens
    const imagesHtml = pages
      .map(
        (page) => `
        <div style="page-break-after: always;">
          <img src="${page.uri}" style="width: 100%; height: auto;" />
        </div>
      `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; padding: 0; }
            img { display: block; }
          </style>
        </head>
        <body>
          ${imagesHtml}
        </body>
      </html>
    `;

    // Gerar PDF
    const { uri } = await Print.printToFileAsync({ html });
    return uri;
  };

  const convertFileToBase64 = async (uri: string): Promise<string> => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });
    return base64;
  };

  const uploadDocument = async ({
    entityType,
    formData,
    pages,
  }: UploadDocumentParams): Promise<UploadDocumentResponse> => {
    setUploading(true);
    setProgress(0);

    try {
      // Passo 1: Gerar PDF (30% do progresso)
      setProgress(10);
      const pdfUri = await generatePDFFromImages(pages);
      setProgress(30);

      // Passo 2: Converter para base64 (50% do progresso)
      const pdfBase64 = await convertFileToBase64(pdfUri);
      setProgress(50);

      // Passo 3: Preparar payload conforme o tipo de entidade
      let endpoint: string;
      let payload: any;

      if (entityType === 'instituicao') {
        // Documento institucional
        endpoint = '/institucional/upload';
        payload = {
          titulo: formData.titulo,
          tipoDocumento: formData.tipoDocumento,
          dataDocumento: formData.dataDocumento,
          fileBase64: pdfBase64,
          fileName: `documento_${Date.now()}.pdf`,
        };
      } else {
        // Documento de pessoa (aluno ou colaborador)
        const pessoaId = entityType === 'aluno' ? formData.alunoId : formData.colaboradorId;
        endpoint = `/documentos/create/${pessoaId}`;
        payload = {
          tipoDocumento: formData.tipoDocumento,
          dataDocumento: formData.dataDocumento,
          fileBase64: pdfBase64,
          fileName: `documento_${Date.now()}.pdf`,
        };
      }

      setProgress(70);

      // Passo 4: Fazer upload (90% do progresso)
      const response = await request<{ id: number; message?: string }>(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      setProgress(100);

      // Limpar arquivo temporário
      await FileSystem.deleteAsync(pdfUri, { idempotent: true });

      return {
        success: true,
        documentId: response.id,
        message: response.message || 'Documento enviado com sucesso!',
      };
    } catch (error: any) {
      console.error('Erro no upload:', error);
      return {
        success: false,
        message: error.message || 'Erro ao enviar documento',
      };
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return {
    uploadDocument,
    uploading,
    progress,
  };
};
