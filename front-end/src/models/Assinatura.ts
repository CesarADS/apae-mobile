export interface CodigoAutenticacaoDTO {
    codigo: string;
}

export interface VerificarAssinaturaDTO {
    assinante: string;
    dataAssinatura: string;
    valida: boolean;
}
