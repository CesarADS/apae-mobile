import { CapturedPage, EntityType } from '@/types';
import * as FileSystem from 'expo-file-system/legacy';
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
    // Converter cada imagem para base64
    const imagesBase64 = await Promise.all(
      pages.map(async (page) => {
        const base64 = await FileSystem.readAsStringAsync(page.uri, {
          encoding: 'base64',
        });
        return `data:image/jpeg;base64,${base64}`;
      })
    );

    // Criar HTML com as imagens em base64
    const imagesHtml = imagesBase64
      .map(
        (base64Image) => `
        <div style="page-break-after: always;">
          <img src="${base64Image}" style="width: 100%; height: auto;" />
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
      // Passo 1: Converter imagens para base64 e gerar PDF (50% do progresso)
      setProgress(10);
      const pdfUri = await generatePDFFromImages(pages);
      setProgress(50);

      // Passo 2: Verificar se PDF foi gerado
      const pdfInfo = await FileSystem.getInfoAsync(pdfUri);
      if (!pdfInfo.exists) {
        throw new Error('PDF não foi gerado corretamente');
      }
      
      setProgress(60);

      // Passo 3: Preparar FormData conforme o tipo de entidade
      let endpoint: string;
      const uploadFormData = new FormData();

      if (entityType === 'instituicao') {
        // Documento institucional: POST /institucional/upload
        endpoint = '/institucional/upload';
        uploadFormData.append('titulo', formData.titulo);
        uploadFormData.append('tipoDocumento', formData.tipoDocumento);
        uploadFormData.append('dataDocumento', formData.dataDocumento.split('T')[0]); // Formato YYYY-MM-DD
        
        // Adicionar arquivo PDF - Formato React Native
        uploadFormData.append('file', {
          uri: pdfUri,
          type: 'application/pdf',
          name: `documento_${Date.now()}.pdf`,
        } as any);
      } else {
        // Documento de pessoa (aluno ou colaborador): POST /documentos/create/{pessoaId}
        const pessoaId = entityType === 'aluno' ? formData.alunoId : formData.colaboradorId;
        endpoint = `/documentos/create/${pessoaId}`;
        
        uploadFormData.append('tipoDocumento', formData.tipoDocumento);
        uploadFormData.append('dataDocumento', formData.dataDocumento.split('T')[0]); // Formato YYYY-MM-DD
        
        // Adicionar arquivo PDF - Formato React Native
        uploadFormData.append('file', {
          uri: pdfUri,
          type: 'application/pdf',
          name: `documento_${Date.now()}.pdf`,
        } as any);
      }

      setProgress(65);

      // Passo 4: Fazer upload
      console.log('[Upload] Endpoint:', endpoint);
      console.log('[Upload] PDF Uri:', pdfUri);
      console.log('[Upload] tipoDocumento:', formData.tipoDocumento);
      console.log('[Upload] dataDocumento:', formData.dataDocumento.split('T')[0]);
      
      const response = await request<{ id: number; message?: string }>(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: uploadFormData as any,
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
