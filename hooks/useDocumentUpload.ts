import { CapturedPage, EntityType } from '@/types';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
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
  const [progressMessage, setProgressMessage] = useState('');

  const generatePDFFromImages = async (pages: CapturedPage[]): Promise<string> => {
    setProgressMessage('Processando imagens...');
    
    const compressedImages = await Promise.all(
      pages.map(async (page, index) => {
        setProgressMessage(`Comprimindo imagem ${index + 1}/${pages.length}...`);
        
        const compressed = await ImageManipulator.manipulateAsync(
          page.uri,
          [{ resize: { width: 1200 } }],
          {
            compress: 0.6,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        
        return compressed.uri;
      })
    );

    setProgressMessage('Convertendo para PDF...');
    
    const imagesBase64 = await Promise.all(
      compressedImages.map(async (uri) => {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64',
        });
        return `data:image/jpeg;base64,${base64}`;
      })
    );

    setProgressMessage('Gerando PDF...');
    
    const imagesHtml = imagesBase64
      .map(
        (base64Image, index) => `
        <div class="page">
          <img src="${base64Image}" alt="Página ${index + 1}" />
        </div>
      `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @page {
              size: A4;
              margin: 0;
            }
            
            body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
            }
            
            .page {
              width: 100%;
              height: 100vh;
              page-break-after: always;
              page-break-inside: avoid;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              position: relative;
            }
            
            .page:last-child {
              page-break-after: auto;
            }
            
            img {
              max-width: 100%;
              max-height: 100%;
              width: auto;
              height: auto;
              object-fit: contain;
              display: block;
            }
          </style>
        </head>
        <body>
          ${imagesHtml}
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    
    await Promise.all(
      compressedImages.map((uri) =>
        FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {})
      )
    );
    
    return uri;
  };

  const uploadDocument = async ({
    entityType,
    formData,
    pages,
  }: UploadDocumentParams): Promise<UploadDocumentResponse> => {
    setUploading(true);
    setProgress(0);
    setProgressMessage('Iniciando processo...');

    try {
      setProgress(10);
      const pdfUri = await generatePDFFromImages(pages);
      setProgress(60);

      setProgressMessage('Verificando PDF gerado...');
      const pdfInfo = await FileSystem.getInfoAsync(pdfUri);
      if (!pdfInfo.exists) {
        throw new Error('PDF não foi gerado corretamente');
      }
      
      const sizeInMB = pdfInfo.size ? (pdfInfo.size / (1024 * 1024)).toFixed(2) : '0';
      console.log(`[Upload] Tamanho do PDF: ${sizeInMB} MB`);
      
      if (pdfInfo.size && pdfInfo.size > 40 * 1024 * 1024) {
        throw new Error(`PDF muito grande (${sizeInMB} MB). Reduza o número de páginas.`);
      }
      
      setProgress(65);
      setProgressMessage('Preparando envio...');

      let endpoint: string;
      const uploadFormData = new FormData();

      if (entityType === 'instituicao') {
        endpoint = '/institucional/upload';
        uploadFormData.append('titulo', formData.titulo);
        uploadFormData.append('tipoDocumento', formData.tipoDocumento);
        uploadFormData.append('dataDocumento', formData.dataDocumento.split('T')[0]);
        uploadFormData.append('localizacao', formData.localizacao);
        
        uploadFormData.append('file', {
          uri: pdfUri,
          type: 'application/pdf',
          name: `documento_${Date.now()}.pdf`,
        } as any);
      } else {
        const pessoaId = entityType === 'aluno' ? formData.alunoId : formData.colaboradorId;
        endpoint = `/documentos/create/${pessoaId}`;
        
        uploadFormData.append('tipoDocumento', formData.tipoDocumento);
        uploadFormData.append('dataDocumento', formData.dataDocumento.split('T')[0]);
        uploadFormData.append('localizacao', formData.localizacao);
        
        uploadFormData.append('file', {
          uri: pdfUri,
          type: 'application/pdf',
          name: `documento_${Date.now()}.pdf`,
        } as any);
      }

      setProgress(70);
      setProgressMessage('Enviando documento ao servidor...');
      console.log('[Upload] Endpoint:', endpoint);
      console.log('[Upload] Tamanho do PDF:', sizeInMB, 'MB');

      const response = await request<{ id: number; message?: string }>(endpoint, {
        method: 'POST',
        body: uploadFormData as any,
      });

      setProgress(100);
      setProgressMessage('Concluído!');

      await FileSystem.deleteAsync(pdfUri, { idempotent: true });

      return {
        success: true,
        documentId: response.id,
        message: response.message || 'Documento enviado com sucesso!',
      };
    } catch (error: any) {
      console.error('[Upload] Erro:', error);
      return {
        success: false,
        message: error.message || 'Erro ao enviar documento',
      };
    } finally {
      setUploading(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  return {
    uploadDocument,
    uploading,
    progress,
    progressMessage,
  };
};
