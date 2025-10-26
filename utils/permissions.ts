import { jwtDecode } from 'jwt-decode';

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
 * Regra: Precisa ter ao menos (READ + WRITE + TIPO_DOCUMENTO) para pelo menos UMA entidade
 * OU ser SUPER_ADMIN (tem acesso a tudo)
 */
export const canAccessMobileApp = (permissions: string[]): UserPermissions => {
  // SUPER_ADMIN tem acesso a tudo
  const isSuperAdmin = permissions.includes('SUPER_ADMIN');
  
  const canAccessAluno = isSuperAdmin || hasAllPermissions(permissions, [
    'DOCUMENTO_ALUNO_READ',
    'DOCUMENTO_ALUNO_WRITE',
    'TIPO_DOCUMENTO'
  ]);

  const canAccessColaborador = isSuperAdmin || hasAllPermissions(permissions, [
    'DOCUMENTO_COLABORADOR_READ',
    'DOCUMENTO_COLABORADOR_WRITE',
    'TIPO_DOCUMENTO'
  ]);

  const canAccessInstituicao = isSuperAdmin || hasAllPermissions(permissions, [
    'DOCUMENTO_INSTITUCIONAL_READ',
    'DOCUMENTO_INSTITUCIONAL_WRITE',
    'TIPO_DOCUMENTO'
  ]);

  return {
    canAccessAluno,
    canAccessColaborador,
    canAccessInstituicao,
    permissions,
  };
};

/**
 * Valida se o usuário tem permissão mínima para usar o app
 */
export const hasMinimumPermissions = (permissions: string[]): boolean => {
  const access = canAccessMobileApp(permissions);
  return access.canAccessAluno || access.canAccessColaborador || access.canAccessInstituicao;
};
