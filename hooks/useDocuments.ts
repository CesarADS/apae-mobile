import { useCallback, useState } from 'react';
import { Document, DocumentDTO, InstitucionalDTO } from '../types';
import { useApiClient } from './useApiClient';

export const useDocuments = () => {
  const { get } = useApiClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchRecentDocuments = useCallback(async (): Promise<Document[]> => {
    try {
      setLoading(true);
      setError(null);

      // Buscar documentos normais e institucionais em paralelo
      // NOTA: A API retorna ARRAY direto, não objeto com paginação
      const [normalDocs, institucionalDocs] = await Promise.all([
        get<DocumentDTO[]>('/documentos/meus'),
        get<InstitucionalDTO[]>('/institucional/meus')
      ]);

      // Converter para formato unificado
      const normalDocuments: Document[] = (normalDocs || []).map((doc: DocumentDTO) => ({
        id: doc.id,
        titulo: doc.titulo,
        tipoDocumento: doc.tipoDocumento,
        dataUpload: doc.dataUpload,
        type: 'normal' as const
      }));

      const institucionalDocuments: Document[] = (institucionalDocs || []).map((doc: InstitucionalDTO) => ({
        id: doc.id,
        titulo: doc.titulo,
        tipoDocumento: doc.tipoDocumento,
        dataUpload: doc.dataUpload,
        type: 'institucional' as const
      }));

      // Combinar e ordenar por data de upload (mais recente primeiro)
      const allDocuments = [...normalDocuments, ...institucionalDocuments];
      allDocuments.sort((a, b) => new Date(b.dataUpload).getTime() - new Date(a.dataUpload).getTime());

      // Retornar apenas os 3 mais recentes
      return allDocuments.slice(0, 3);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar documentos';
      if (errorMessage.includes('Usuário ou senha inválidos')) {
        console.warn('[useDocuments] 401/403 recebido. Verifique token nos headers.');
      }
      setError(errorMessage);
      console.error('Erro ao buscar documentos:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [get]);

  const fetchAllDocuments = useCallback(async (page: number = 0): Promise<Document[]> => {
    try {
      if (page === 0) {
        setLoading(true);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      console.log(`[fetchAllDocuments] Buscando página ${page}...`);

      // Buscar documentos normais e institucionais em paralelo
      // NOTA: Rota /meus agora retorna Page<T> do Spring Boot
      const [normalResponse, institucionalResponse] = await Promise.all([
        get<{ content: DocumentDTO[], totalPages: number, totalElements: number }>(`/documentos/meus?page=${page}&size=20`),
        get<{ content: InstitucionalDTO[], totalPages: number, totalElements: number }>(`/institucional/meus?page=${page}&size=20`)
      ]);

      console.log('[fetchAllDocuments] Resposta documentos normais:', normalResponse);
      console.log('[fetchAllDocuments] Resposta documentos institucionais:', institucionalResponse);

      // Converter para formato unificado
      const normalDocuments: Document[] = (normalResponse.content || []).map((doc: DocumentDTO) => ({
        id: doc.id,
        titulo: doc.titulo,
        tipoDocumento: doc.tipoDocumento,
        dataUpload: doc.dataUpload,
        type: 'normal' as const
      }));

      const institucionalDocuments: Document[] = (institucionalResponse.content || []).map((doc: InstitucionalDTO) => ({
        id: doc.id,
        titulo: doc.titulo,
        tipoDocumento: doc.tipoDocumento,
        dataUpload: doc.dataUpload,
        type: 'institucional' as const
      }));

      console.log('[fetchAllDocuments] Documentos normais processados:', normalDocuments.length);
      console.log('[fetchAllDocuments] Documentos institucionais processados:', institucionalDocuments.length);

      // Combinar e ordenar por data de upload (mais recente primeiro)
      const allDocuments = [...normalDocuments, ...institucionalDocuments];
      allDocuments.sort((a, b) => new Date(b.dataUpload).getTime() - new Date(a.dataUpload).getTime());

      console.log('[fetchAllDocuments] Total de documentos:', allDocuments.length);
      console.log('[fetchAllDocuments] Total pages - Normal:', normalResponse.totalPages, 'Institucional:', institucionalResponse.totalPages);

      // Verificar se há mais páginas usando totalPages do Spring
      const hasMoreNormal = page < (normalResponse.totalPages || 0) - 1;
      const hasMoreInstitucional = page < (institucionalResponse.totalPages || 0) - 1;
      setHasMore(hasMoreNormal || hasMoreInstitucional);

      return allDocuments;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar documentos';
      console.error('[fetchAllDocuments] ERRO:', err);
      console.error('[fetchAllDocuments] Mensagem:', errorMessage);
      if (errorMessage.includes('Usuário ou senha inválidos')) {
        console.warn('[useDocuments] 401/403 recebido. Verifique token nos headers.');
      }
      setError(errorMessage);
      console.error('Erro ao buscar documentos:', err);
      return [];
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [get]);

  return {
    loading,
    loadingMore,
    hasMore,
    error,
    clearError,
    fetchRecentDocuments,
    fetchAllDocuments
  };
};