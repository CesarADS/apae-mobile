// Tipos para documentos normais
export interface DocumentDTO {
  id: number;
  titulo: string;
  tipoDocumento: string;
  dataUpload: string;
  isLast: boolean;
  nomeUsuario: string;
}

// Tipos para documentos institucionais
export interface InstitucionalDTO {
  id: number;
  titulo: string;
  tipoDocumento: string;
  dataDocumento: string;
  isAtivo: boolean;
  dataUpload: string;
  nomeUsuario: string;
}

// Tipo unificado para exibição
export interface Document {
  id: number;
  titulo: string;
  tipoDocumento: string;
  dataUpload: string;
  type: 'normal' | 'institucional';
}