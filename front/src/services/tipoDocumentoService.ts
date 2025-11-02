import api from './api';
import { Page } from '../models/Page';
import { TipoDocumentoRequest, TipoDocumentoResponse } from '../models/TipoDocumento';


const listarPaginado = async (page: number, termoBusca?: string): Promise<Page<TipoDocumentoResponse>> => {
    const params = {
        page,
        size: 10, 
        sort: 'nome,asc', 
    
        ...(termoBusca && { termoBusca: termoBusca })
    };
    
    
    const response = await api.get<Page<TipoDocumentoResponse>>('/tipo-documento/all', { params });
    return response.data;
};


const criar = async (payload: TipoDocumentoRequest): Promise<TipoDocumentoResponse> => {
    const response = await api.post<TipoDocumentoResponse>('/tipo-documento', payload);
    return response.data;
};


const atualizar = async (id: number, payload: TipoDocumentoRequest): Promise<TipoDocumentoResponse> => {
    const response = await api.put<TipoDocumentoResponse>(`/tipo-documento/${id}`, payload);
    return response.data;
};

const changeStatus = async (id: number): Promise<void> => {
    await api.patch(`/tipo-documento/${id}/status`);
};

const buscarTodosInstitucional = async (gerar: boolean): Promise<TipoDocumentoResponse[]> => {
    const response = await api.get<TipoDocumentoResponse[]>('/tipo-documento/institucionais', { params: { gerar } });
    return response.data;
}

const buscarTodosAlunos = async (gerar: boolean): Promise<TipoDocumentoResponse[]> => {
    const response = await api.get<TipoDocumentoResponse[]>('/tipo-documento/alunos', { params: { gerar } });
    return response.data;
}

const buscarTodosColaboradores = async (gerar: boolean): Promise<TipoDocumentoResponse[]> => {
    const response = await api.get<TipoDocumentoResponse[]>('/tipo-documento/colaboradores', { params: { gerar } });
    return response.data;
}

export const tipoDocumentoService = {
    listarPaginado,
    criar,
    atualizar,
    changeStatus,
    buscarTodosInstitucional,
    buscarTodosAlunos,
    buscarTodosColaboradores
};
