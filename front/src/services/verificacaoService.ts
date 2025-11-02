import api from "./api.ts";


export enum TipoAssinatura {
    SIMPLES = 'SIMPLES',
    AVANCADA = 'AVANCADA'
}

export interface VerificarAssinaturaDTO {
    nomeSignatario: string;
    dataAssinatura: string; // LocalDateTime is serialized as a string
    tipo: TipoAssinatura;
    valida: boolean;
    mensagem: string;
}

const verificarDocumentoPublico = async (arquivo: File, codigoVerificacao: string): Promise<VerificarAssinaturaDTO[]> => {
    const formData = new FormData();
    formData.append('arquivo', arquivo);

    const { data } = await api.post<VerificarAssinaturaDTO[]>(`/publica/verificar-documento/${codigoVerificacao}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

export const verificacaoService = {
    verificarDocumentoPublico,
};
