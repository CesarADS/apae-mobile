import api from './api';
import { Page } from '../models/Page';

export interface GerarDocInstitucionalRequest {
    tipoDocumento: string;
    texto: string;
    dataDocumento: string;
}

export interface UserLoginDTO {
    login: string;
    senha?: string;
}

export interface CodigoAutenticacaoDTO {
    codigo: string;
}

export interface DownloadedFile {
    filename: string;
    contentType: string;
    blob: Blob;
}

export interface InstitucionalResponse {
    id: number;
    titulo: string;
    tipoDocumento: string;
    dataCriacao: string;
    doc?: string;
    tipoConteudo?: string;
    dataUpload?: string;
    dataDownload?: string;
}

export interface ListarParams {
    tipoDocumento?: string;
    dataCriacao?: string;
    termoBusca?: string;
}

const institucionalService = {

    gerarESalvar: async (entrada: GerarDocInstitucionalRequest): Promise<InstitucionalResponse> => {
        const { data } = await api.post<InstitucionalResponse>('/institucional/gerar-e-salvar', entrada);
        return data;
    },

    gerarPdfPreview: async (entrada: GerarDocInstitucionalRequest): Promise<Blob> => {
        const response = await api.post('/institucional/pre-visualizar', entrada, {
            responseType: 'blob',
        });
        return response.data;
    },

    upload: async (entrada: FormData): Promise<Blob> => {
        const response = await api.post('/institucional/upload', entrada, {
            responseType: 'blob',
        });
        return response.data;
    },


    listar: async (params: ListarParams, page: number, size: number = 10): Promise<Page<InstitucionalResponse>> => {
        const requestParams = {
            ...params,
            page,
            size,
        };
        const { data } = await api.get<Page<InstitucionalResponse>>('/institucional/listar', { params: requestParams });
        return data;
    },

    listarPermanentes: async (page: number, size: number = 10, termoBusca?: string): Promise<Page<InstitucionalResponse>> => {
        const params: any = {
            page,
            size,
        };
        if (termoBusca) {
            params.termoBusca = termoBusca;
        }
        const { data } = await api.get<Page<InstitucionalResponse>>('/institucional/listar_permanente', { params });
        return data;
    },


    visualizarUm: async (id: number): Promise<InstitucionalResponse> => {
        const { data } = await api.get<InstitucionalResponse>(`/institucional/listarUm/${id}`);
        return data;
    },


    atualizar: async (id: number, dto: FormData): Promise<InstitucionalResponse> => {
        const { data } = await api.put<InstitucionalResponse>(`/institucional/atualizar/${id}`, dto, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    deletar: async (id: number): Promise<void> => {
        await api.delete(`/institucional/deletar/${id}`);
    },

    solicitarCodigoAssinatura: async (id: number, entrada: UserLoginDTO): Promise<void> => {
        await api.post(`/institucional/iniciar-assinatura/${id}`, entrada);
    },

    confirmarAssinatura: async (id: number, entrada: CodigoAutenticacaoDTO): Promise<void> => {
        await api.post(`/institucional/confirmar-assinatura/${id}`, entrada);
    },

    downloadDocumento: async (id: number): Promise<DownloadedFile> => {
        const response = await api.get(`/institucional/${id}/download`, {
            responseType: 'blob',
        });

        const contentDisposition = response.headers['content-disposition'];
        let filename = 'documento.pdf';
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
            if (filenameMatch && filenameMatch.length > 1) {
                filename = filenameMatch[1];
            }
        }
        
        return {
            filename: filename,
            contentType: response.headers['content-type'],
            blob: response.data,
        };
    },
};

export default institucionalService;