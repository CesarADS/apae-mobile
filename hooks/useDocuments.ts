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

      // Buscar documentos normais e institucionais separadamente para tratar 403 individualmente
      // NOTA: A API retorna ARRAY direto, não objeto com paginação
      let normalDocs: DocumentDTO[] | null = null;
      let institucionalDocs: InstitucionalDTO[] | null = null;
      let normalError403 = false;
      let institucionalError403 = false;

      // Buscar documentos normais
      try {
        normalDocs = await get<DocumentDTO[]>('/documentos/meus');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '';
        if (errorMessage.includes('não tem permissão') || errorMessage.includes('403')) {
          console.log('[fetchRecentDocuments] Sem permissão para documentos normais (403) - continuando...');
          normalError403 = true;
        } else {
          throw err; // Re-lançar se não for 403
        }
      }

      // Buscar documentos institucionais
      try {
        institucionalDocs = await get<InstitucionalDTO[]>('/institucional/meus');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '';
        if (errorMessage.includes('não tem permissão') || errorMessage.includes('403')) {
          console.log('[fetchRecentDocuments] Sem permissão para documentos institucionais (403) - continuando...');
          institucionalError403 = true;
        } else {
          throw err; // Re-lançar se não for 403
        }
      }

      // Se ambas retornaram 403, mostrar erro de permissão
      if (normalError403 && institucionalError403) {
        setError('Você não tem permissão para realizar esta ação. Contate o administrador.');
        return [];
      }

      // Converter para formato unificado
      const normalDocuments: Document[] = normalDocs ? (normalDocs || []).map((doc: DocumentDTO) => ({
        id: doc.id,
        titulo: doc.titulo,
        tipoDocumento: doc.tipoDocumento,
        dataUpload: doc.dataUpload,
        type: 'normal' as const
      })) : [];

      const institucionalDocuments: Document[] = institucionalDocs ? (institucionalDocs || []).map((doc: InstitucionalDTO) => ({
        id: doc.id,
        titulo: doc.titulo,
        tipoDocumento: doc.tipoDocumento,
        dataUpload: doc.dataUpload,
        type: 'institucional' as const
      })) : [];

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

      // Buscar documentos normais e institucionais separadamente para tratar 403 individualmente
      // NOTA: Rota /meus agora retorna Page<T> do Spring Boot
      let normalResponse: { content: DocumentDTO[], totalPages: number, totalElements: number } | null = null;
      let institucionalResponse: { content: InstitucionalDTO[], totalPages: number, totalElements: number } | null = null;
      let normalError403 = false;
      let institucionalError403 = false;

      // Buscar documentos normais
      try {
        normalResponse = await get<{ content: DocumentDTO[], totalPages: number, totalElements: number }>(`/documentos/meus?page=${page}&size=20`);
        console.log('[fetchAllDocuments] Resposta documentos normais:', normalResponse);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '';
        if (errorMessage.includes('não tem permissão') || errorMessage.includes('403')) {
          console.log('[fetchAllDocuments] Sem permissão para documentos normais (403) - continuando...');
          normalError403 = true;
        } else {
          throw err; // Re-lançar se não for 403
        }
      }

      // Buscar documentos institucionais
      try {
        institucionalResponse = await get<{ content: InstitucionalDTO[], totalPages: number, totalElements: number }>(`/institucional/meus?page=${page}&size=20`);
        console.log('[fetchAllDocuments] Resposta documentos institucionais:', institucionalResponse);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '';
        if (errorMessage.includes('não tem permissão') || errorMessage.includes('403')) {
          console.log('[fetchAllDocuments] Sem permissão para documentos institucionais (403) - continuando...');
          institucionalError403 = true;
        } else {
          throw err; // Re-lançar se não for 403
        }
      }

      // Se ambas retornaram 403, mostrar erro de permissão
      if (normalError403 && institucionalError403) {
        setError('Você não tem permissão para realizar esta ação. Contate o administrador.');
        return [];
      }

      // Converter para formato unificado
      const normalDocuments: Document[] = normalResponse ? (normalResponse.content || []).map((doc: DocumentDTO) => ({
        id: doc.id,
        titulo: doc.titulo,
        tipoDocumento: doc.tipoDocumento,
        dataUpload: doc.dataUpload,
        type: 'normal' as const
      })) : [];

      const institucionalDocuments: Document[] = institucionalResponse ? (institucionalResponse.content || []).map((doc: InstitucionalDTO) => ({
        id: doc.id,
        titulo: doc.titulo,
        tipoDocumento: doc.tipoDocumento,
        dataUpload: doc.dataUpload,
        type: 'institucional' as const
      })) : [];

      console.log('[fetchAllDocuments] Documentos normais processados:', normalDocuments.length);
      console.log('[fetchAllDocuments] Documentos institucionais processados:', institucionalDocuments.length);

      // Combinar e ordenar por data de upload (mais recente primeiro)
      const allDocuments = [...normalDocuments, ...institucionalDocuments];
      allDocuments.sort((a, b) => new Date(b.dataUpload).getTime() - new Date(a.dataUpload).getTime());

      console.log('[fetchAllDocuments] Total de documentos:', allDocuments.length);
      console.log('[fetchAllDocuments] Total pages - Normal:', normalResponse?.totalPages, 'Institucional:', institucionalResponse?.totalPages);

      // Verificar se há mais páginas usando totalPages do Spring
      const hasMoreNormal = normalResponse ? page < (normalResponse.totalPages || 0) - 1 : false;
      const hasMoreInstitucional = institucionalResponse ? page < (institucionalResponse.totalPages || 0) - 1 : false;
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