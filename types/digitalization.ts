// Tipos para entidades
export interface Aluno {
  id: number;
  nome: string;
  cpf?: string;
  dataNascimento?: string;
}

export interface Colaborador {
  id: number;
  nome: string;
  cpf?: string;
}

export interface TipoDocumento {
  id: number;
  nome: string;
  descricao?: string;
}

// Tipos para o fluxo de digitalização
export type EntityType = 'aluno' | 'colaborador' | 'instituicao';

export interface CapturedPage {
  id: string;
  uri: string;
  base64?: string;
  width: number;
  height: number;
}

export interface DocumentFormData {
  entityType: EntityType;
  entityId?: number; // ID do aluno ou colaborador (não usado para instituição)
  tipoDocumento: string;
  dataDocumento: string;
  titulo?: string; // Usado apenas para instituição
  localizacao: string; // Localização do documento
  pages: CapturedPage[];
}

// Tipos para upload
export interface UploadDocumentPayload {
  tipoDocumento: string;
  dataDocumento: string;
  file: string; // Base64
  titulo?: string; // Apenas para instituição
  localizacao: string; // Localização do documento
}

export interface UploadResponse {
  id: number;
  message: string;
}