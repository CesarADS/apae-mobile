/**
 * Constantes de Permissões
 * Baseadas no sistema de permissões do backend (data.sql)
 */

// Permissões de Documentos - Aluno
export const DOCUMENTO_ALUNO_READ = 'DOCUMENTO_ALUNO_READ';
export const DOCUMENTO_ALUNO_WRITE = 'DOCUMENTO_ALUNO_WRITE';
export const DOCUMENTO_ALUNO_DELETE = 'DOCUMENTO_ALUNO_DELETE';

// Permissões de Documentos - Colaborador
export const DOCUMENTO_COLABORADOR_READ = 'DOCUMENTO_COLABORADOR_READ';
export const DOCUMENTO_COLABORADOR_WRITE = 'DOCUMENTO_COLABORADOR_WRITE';
export const DOCUMENTO_COLABORADOR_DELETE = 'DOCUMENTO_COLABORADOR_DELETE';

// Permissões de Documentos - Institucional
export const DOCUMENTO_INSTITUCIONAL_READ = 'DOCUMENTO_INSTITUCIONAL_READ';
export const DOCUMENTO_INSTITUCIONAL_WRITE = 'DOCUMENTO_INSTITUCIONAL_WRITE';
export const DOCUMENTO_INSTITUCIONAL_DELETE = 'DOCUMENTO_INSTITUCIONAL_DELETE';

// Permissões Gerais
export const TIPO_DOCUMENTO = 'TIPO_DOCUMENTO';
export const ALUNO_READ = 'ALUNO_READ';
export const ALUNO_WRITE = 'ALUNO_WRITE';
export const ALUNO_DELETE = 'ALUNO_DELETE';
export const COLABORADOR_READ = 'COLABORADOR_READ';
export const COLABORADOR_WRITE = 'COLABORADOR_WRITE';
export const COLABORADOR_DELETE = 'COLABORADOR_DELETE';
export const GERENCIAR_USUARIO = 'GERENCIAR_USUARIO';
export const GRUPOS_PERMISSOES = 'GRUPOS_PERMISSOES';
export const SUPER_ADMIN = 'SUPER_ADMIN';

/**
 * Conjuntos de permissões necessárias para acessar funcionalidades
 */
export const PERMISSIONS_REQUIRED = {
  // Para digitalizar documentos de aluno
  ALUNO: [DOCUMENTO_ALUNO_READ, DOCUMENTO_ALUNO_WRITE, TIPO_DOCUMENTO],
  
  // Para digitalizar documentos de colaborador
  COLABORADOR: [DOCUMENTO_COLABORADOR_READ, DOCUMENTO_COLABORADOR_WRITE, TIPO_DOCUMENTO],
  
  // Para digitalizar documentos institucionais
  INSTITUICAO: [DOCUMENTO_INSTITUCIONAL_READ, DOCUMENTO_INSTITUCIONAL_WRITE, TIPO_DOCUMENTO],
} as const;

/**
 * Descrições amigáveis das permissões
 */
export const PERMISSION_LABELS: Record<string, string> = {
  [DOCUMENTO_ALUNO_READ]: 'Visualizar Documentos de Alunos',
  [DOCUMENTO_ALUNO_WRITE]: 'Adicionar e Editar Documentos de Alunos',
  [DOCUMENTO_ALUNO_DELETE]: 'Deletar Documentos de Alunos',
  [DOCUMENTO_COLABORADOR_READ]: 'Visualizar Documentos de Colaboradores',
  [DOCUMENTO_COLABORADOR_WRITE]: 'Adicionar e Editar Documentos de Colaboradores',
  [DOCUMENTO_COLABORADOR_DELETE]: 'Deletar Documentos de Colaboradores',
  [DOCUMENTO_INSTITUCIONAL_READ]: 'Visualizar Documentos Institucionais',
  [DOCUMENTO_INSTITUCIONAL_WRITE]: 'Adicionar e Editar Documentos Institucionais',
  [DOCUMENTO_INSTITUCIONAL_DELETE]: 'Deletar Documentos Institucionais',
  [TIPO_DOCUMENTO]: 'Gerenciar Tipos de Documento',
  [ALUNO_READ]: 'Visualizar Alunos',
  [ALUNO_WRITE]: 'Adicionar e Editar Alunos',
  [ALUNO_DELETE]: 'Deletar Alunos',
  [COLABORADOR_READ]: 'Visualizar Colaboradores',
  [COLABORADOR_WRITE]: 'Adicionar e Editar Colaboradores',
  [COLABORADOR_DELETE]: 'Deletar Colaboradores',
  [GERENCIAR_USUARIO]: 'Gerenciar Usuários',
  [GRUPOS_PERMISSOES]: 'Gerenciar Grupos e Permissões',
  [SUPER_ADMIN]: 'Super Administrador',
};
