/**
 * Script de teste para validar a lógica de permissões
 * Execute com: node test-permissions.js
 */

const hasAllPermissions = (userPermissions, requiredPermissions) => {
  return requiredPermissions.every(perm => userPermissions.includes(perm));
};

const canAccessMobileApp = (permissions) => {
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

// Casos de teste
console.log('=== TESTE DE PERMISSÕES ===\n');

// Teste 1: Usuário com permissões completas de Aluno
const test1 = [
  'ALUNO_READ',
  'DOCUMENTO_ALUNO_READ',
  'DOCUMENTO_ALUNO_WRITE',
  'TIPO_DOCUMENTO'
];
console.log('Teste 1 - Permissões completas de Aluno:');
console.log('Permissões:', test1);
console.log('Resultado:', canAccessMobileApp(test1));
console.log('');

// Teste 2: Usuário sem TIPO_DOCUMENTO
const test2 = [
  'DOCUMENTO_ALUNO_READ',
  'DOCUMENTO_ALUNO_WRITE'
];
console.log('Teste 2 - Sem TIPO_DOCUMENTO:');
console.log('Permissões:', test2);
console.log('Resultado:', canAccessMobileApp(test2));
console.log('');

// Teste 3: Usuário com permissões de Colaborador
const test3 = [
  'DOCUMENTO_COLABORADOR_READ',
  'DOCUMENTO_COLABORADOR_WRITE',
  'TIPO_DOCUMENTO'
];
console.log('Teste 3 - Permissões de Colaborador:');
console.log('Permissões:', test3);
console.log('Resultado:', canAccessMobileApp(test3));
console.log('');

// Teste 4: Usuário com permissões de Institucional
const test4 = [
  'DOCUMENTO_INSTITUCIONAL_READ',
  'DOCUMENTO_INSTITUCIONAL_WRITE',
  'TIPO_DOCUMENTO'
];
console.log('Teste 4 - Permissões de Institucional:');
console.log('Permissões:', test4);
console.log('Resultado:', canAccessMobileApp(test4));
console.log('');

// Teste 5: Usuário com todas as permissões
const test5 = [
  'DOCUMENTO_ALUNO_READ',
  'DOCUMENTO_ALUNO_WRITE',
  'DOCUMENTO_COLABORADOR_READ',
  'DOCUMENTO_COLABORADOR_WRITE',
  'DOCUMENTO_INSTITUCIONAL_READ',
  'DOCUMENTO_INSTITUCIONAL_WRITE',
  'TIPO_DOCUMENTO'
];
console.log('Teste 5 - Todas as permissões:');
console.log('Permissões:', test5);
console.log('Resultado:', canAccessMobileApp(test5));
console.log('');

// Teste 6: Usuário sem permissões
const test6 = [];
console.log('Teste 6 - Sem permissões:');
console.log('Permissões:', test6);
console.log('Resultado:', canAccessMobileApp(test6));
console.log('');

// Teste 7: Super Admin (verificar se não quebra)
const test7 = ['SUPER_ADMIN'];
console.log('Teste 7 - Apenas SUPER_ADMIN:');
console.log('Permissões:', test7);
console.log('Resultado:', canAccessMobileApp(test7));
