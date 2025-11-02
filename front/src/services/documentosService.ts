import api from './api';
import { Page } from '../models/Page';
import { Documento } from '../models/Documentos';
import { UserLoginDTO } from '../models/User';
import { CodigoAutenticacaoDTO, VerificarAssinaturaDTO } from '../models/Assinatura';
import {DownloadedFile} from "./institucionalService.ts";
export interface GerarDocumentoPessoaDTO {
    texto: string;
    pessoaId?: number;
    tipoDocumento: string;
    localizacao: string;
}


export const documentoService = {


    listar: async (pagina: number, termoBusca?: string): Promise<Page<Documento>> => {

        const params: any = {
            page: pagina,
            size: 10,
        };


        if (termoBusca) {
            params.termoBusca = termoBusca;
        }

        const response = await api.get('/documentos/listar', { params });
        return response.data;
    },

    listarPorPessoa: async (pessoaId: number, pagina: number, termoBusca?: string): Promise<Page<Documento>> => {
        const params: any = {
            page: pagina,
            size: 5,
        };

        if (termoBusca) {
            params.termoBusca = termoBusca;
        }

        const response = await api.get(`/documentos/listar/pessoa/${pessoaId}`, { params });
        return response.data;
    },

    listarPermanentes: async (id: number, pagina: number, termoBusca?: string): Promise<Page<Documento>> => {
        const params: any = {
            id,
            page: pagina,
            size: 10,
        };

        if (termoBusca) {
            params.termoBusca = termoBusca;
        }

        const response = await api.get('/documentos/listar_permanente', { params });
        return response.data;
    },

    buscarUm: async (id: number): Promise<Documento> => {
        const response = await api.get(`/documentos/listarUm/${id}`);
        return response.data;
    },


    mudarStatus: (id: number): Promise<void> => {
        return api.patch(`/documentos/${id}/status`);
    },

    uploadDocPessoa: (pessoaId: number, formData: FormData): Promise<any> => {
        return api.post(`/documentos/create/${pessoaId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

   atualizar: (id: number, formData: FormData): Promise<any> => {
        return api.put(`/documentos/update/${id}`, formData);
    }
    ,

    visualizarDocPessoa: (dto: GerarDocumentoPessoaDTO): Promise<Blob> => {
        return api.post('/documentos/visualizar', dto, {
            responseType: 'blob',
        }).then(response => response.data);
    },


    salvarDocPessoa: (dto: GerarDocumentoPessoaDTO): Promise<Blob> => {
        return api.post(`/documentos/gerar`, dto, {
            responseType: 'blob',
        }).then(response => response.data);
    },

    iniciarAssinatura: (id: number, entrada: UserLoginDTO): Promise<void> => {
        return api.post(`/documentos/iniciar-assinatura/${id}`, entrada);
    },

     confirmarAssinatura: (id: number, entrada: CodigoAutenticacaoDTO): Promise<void> => {
         return api.post(`/documentos/confirmar-assinatura/${id}`, entrada);
     },

     verificarAssinaturas: async (id: number): Promise<VerificarAssinaturaDTO[]> => {
         const response = await api.get(`/documentos/${id}/verificar-assinaturas`);
         return response.data;
     },
    assinarSimples: (id: number, entrada: UserLoginDTO): Promise<void> => {
        return api.post(`/documentos/assinar-simples/${id}`, entrada);
    },

    downloadDocumento: async (id: number): Promise<DownloadedFile> => {
        const response = await api.get(`/documentos/${id}/download`, {
            responseType: 'blob',
        });

        const contentDisposition = response.headers['content-disposition'];
        let filename = 'documento.pdf'; // Nome padrão
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
