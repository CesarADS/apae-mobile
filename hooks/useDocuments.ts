import { useCallback, useState } from 'react';
import { Document, DocumentDTO, InstitucionalDTO } from '../types';
import { useApiClient } from './useApiClient';

export const useDocuments = () => {
  const { get } = useApiClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchRecentDocuments = useCallback(async (): Promise<Document[]> => {
    try {
      setLoading(true);
      setError(null);

      // Buscar documentos normais e institucionais em paralelo
      const [normalDocs, institucionalDocs] = await Promise.all([
        get<DocumentDTO[]>('/documents/meus'),
        get<InstitucionalDTO[]>('/institucional/meus')
      ]);

      // Converter para formato unificado
      const normalDocuments: Document[] = normalDocs.map((doc: DocumentDTO) => ({
        id: doc.id,
        titulo: doc.titulo,
        tipoDocumento: doc.tipoDocumento,
        dataUpload: doc.dataUpload,
        type: 'normal' as const
      }));

      const institucionalDocuments: Document[] = institucionalDocs.map((doc: InstitucionalDTO) => ({
        id: doc.id,
        titulo: doc.titulo,
        tipoDocumento: doc.tipoDocumento,
        dataUpload: doc.dataUpload,
        type: 'institucional' as const
      }));

      // Combinar e ordenar por data de upload (mais recente primeiro)
      const allDocuments = [...normalDocuments, ...institucionalDocuments];
      allDocuments.sort((a, b) => new Date(b.dataUpload).getTime() - new Date(a.dataUpload).getTime());

      // Retornar apenas os 5 mais recentes
      return allDocuments.slice(0, 5);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar documentos';
      setError(errorMessage);
      console.error('Erro ao buscar documentos:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [get]);

  return {
    loading,
    error,
    clearError,
    fetchRecentDocuments
  };
};