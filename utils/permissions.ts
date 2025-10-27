import { jwtDecode } from 'jwt-decode';

// ============================================
// PERMISSÕES DO SISTEMA (Backend)
// ============================================
export const PERMISSIONS = {
  // Alunos
  ALUNO_READ: 'ALUNO_READ',
  ALUNO_WRITE: 'ALUNO_WRITE',
  ALUNO_DELETE: 'ALUNO_DELETE',
  
  // Colaboradores
  COLABORADOR_READ: 'COLABORADOR_READ',
  COLABORADOR_WRITE: 'COLABORADOR_WRITE',
  COLABORADOR_DELETE: 'COLABORADOR_DELETE',
  
  // Documentos de Alunos
  DOCUMENTO_ALUNO_READ: 'DOCUMENTO_ALUNO_READ',
  DOCUMENTO_ALUNO_WRITE: 'DOCUMENTO_ALUNO_WRITE',
  DOCUMENTO_ALUNO_DELETE: 'DOCUMENTO_ALUNO_DELETE',
  
  // Documentos de Colaboradores
  DOCUMENTO_COLABORADOR_READ: 'DOCUMENTO_COLABORADOR_READ',
  DOCUMENTO_COLABORADOR_WRITE: 'DOCUMENTO_COLABORADOR_WRITE',
  DOCUMENTO_COLABORADOR_DELETE: 'DOCUMENTO_COLABORADOR_DELETE',
  
  // Documentos Institucionais
  DOCUMENTO_INSTITUCIONAL_READ: 'DOCUMENTO_INSTITUCIONAL_READ',
  DOCUMENTO_INSTITUCIONAL_WRITE: 'DOCUMENTO_INSTITUCIONAL_WRITE',
  DOCUMENTO_INSTITUCIONAL_DELETE: 'DOCUMENTO_INSTITUCIONAL_DELETE',
  
  // Administração
  TIPO_DOCUMENTO: 'TIPO_DOCUMENTO',
  GRUPOS_PERMISSOES: 'GRUPOS_PERMISSOES',
  GERENCIAR_USUARIO: 'GERENCIAR_USUARIO',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export interface DecodedToken {
  sub: string; // username/email
  nome?: string;
  permissions: string[];
  exp: number; // timestamp de expiração
}

export interface UserPermissions {
  canAccessAluno: boolean;
  canAccessColaborador: boolean;
  canAccessInstituicao: boolean;
  permissions: string[];
}

/**
 * Decodifica o token JWT e retorna as informações
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
};

/**
 * Verifica se o token está expirado
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

/**
 * Verifica se o usuário possui uma permissão específica
 */
export const hasPermission = (permissions: string[], permission: string): boolean => {
  return permissions.includes(permission);
};

/**
 * Verifica se o usuário possui TODAS as permissões necessárias
 */
export const hasAllPermissions = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.every(perm => userPermissions.includes(perm));
};

/**
 * Verifica se o usuário pode acessar o app mobile
 * 
 * REGRA: Para ter acesso ao app, o usuário precisa ter:
 * - TIPO_DOCUMENTO (obrigatório)
 * - READ + WRITE de pelo menos UMA entidade (Aluno, Colaborador ou Institucional)
 * - OU ser SUPER_ADMIN (acessa tudo)
 */
export const canAccessMobileApp = (permissions: string[]): UserPermissions => {
  // SUPER_ADMIN tem acesso a tudo
  const isSuperAdmin = hasPermission(permissions, PERMISSIONS.SUPER_ADMIN);
  
  // Verificar acesso a cada entidade
  const canAccessAluno = isSuperAdmin || hasAllPermissions(permissions, [
    PERMISSIONS.DOCUMENTO_ALUNO_READ,
    PERMISSIONS.DOCUMENTO_ALUNO_WRITE,
    PERMISSIONS.TIPO_DOCUMENTO
  ]);

  const canAccessColaborador = isSuperAdmin || hasAllPermissions(permissions, [
    PERMISSIONS.DOCUMENTO_COLABORADOR_READ,
    PERMISSIONS.DOCUMENTO_COLABORADOR_WRITE,
    PERMISSIONS.TIPO_DOCUMENTO
  ]);

  const canAccessInstituicao = isSuperAdmin || hasAllPermissions(permissions, [
    PERMISSIONS.DOCUMENTO_INSTITUCIONAL_READ,
    PERMISSIONS.DOCUMENTO_INSTITUCIONAL_WRITE,
    PERMISSIONS.TIPO_DOCUMENTO
  ]);

  return {
    canAccessAluno,
    canAccessColaborador,
    canAccessInstituicao,
    permissions,
  };
};

/**
 * Valida se o usuário tem permissão mínima para usar o app mobile
 * 
 * REGRA: Precisa ter acesso a pelo menos UMA entidade
 */
export const hasMinimumPermissions = (permissions: string[]): boolean => {
  const access = canAccessMobileApp(permissions);
  return access.canAccessAluno || access.canAccessColaborador || access.canAccessInstituicao;
};
