# Sistema de Permissões - App Mobile

## 📋 Resumo das Mudanças

O sistema de login foi atualizado para integrar com o novo modelo de permissões baseado em JWT do backend.

## 🔐 Como Funciona

### 1. **Login com JWT**
- O backend retorna um token JWT após autenticação bem-sucedida
- O token contém as permissões do usuário no campo `permissions`
- O token é decodificado no mobile usando a biblioteca `jwt-decode`

### 2. **Estrutura do Token Decodificado**
```typescript
{
  sub: "usuario@email.com",      // Username/email do usuário
  nome: "Nome do Usuário",        // Nome completo (opcional)
  permissions: [                  // Array de permissões
    "DOCUMENTO_ALUNO_READ",
    "DOCUMENTO_ALUNO_WRITE",
    "TIPO_DOCUMENTO"
  ],
  exp: 1234567890                 // Timestamp de expiração
}
```

### 3. **Permissões Necessárias para Acessar o App Mobile**

Para usar o app de digitalização, o usuário **DEVE ter pelo menos UMA** das seguintes combinações:

#### Opção 1: Documentos de Aluno
```
DOCUMENTO_ALUNO_READ + DOCUMENTO_ALUNO_WRITE + TIPO_DOCUMENTO
```

#### Opção 2: Documentos de Colaborador
```
DOCUMENTO_COLABORADOR_READ + DOCUMENTO_COLABORADOR_WRITE + TIPO_DOCUMENTO
```

#### Opção 3: Documentos Institucionais
```
DOCUMENTO_INSTITUCIONAL_READ + DOCUMENTO_INSTITUCIONAL_WRITE + TIPO_DOCUMENTO
```

#### Opção 4: Qualquer Combinação
O usuário pode ter permissões para 1, 2 ou todas as 3 entidades simultaneamente.

## 📁 Arquivos Criados/Modificados

### **Novos Arquivos:**

1. **`utils/permissions.ts`**
   - Funções para decodificar JWT
   - Validação de permissões
   - `canAccessMobileApp()` - verifica acesso por entidade
   - `hasMinimumPermissions()` - valida se pode usar o app

2. **`utils/permissionConstants.ts`**
   - Constantes de permissões
   - Labels descritivos
   - Conjuntos de permissões necessárias

### **Arquivos Modificados:**

1. **`hooks/useAuth.ts`**
   - Decodifica o JWT após login
   - Valida permissões mínimas
   - Armazena permissões no estado `user`
   - Exibe erro se usuário não tiver permissões

2. **`app/digitalization/select-entity.tsx`**
   - Mostra apenas entidades que o usuário tem permissão
   - Exibe loading enquanto carrega permissões
   - Alert se usuário não tiver nenhuma permissão

3. **`types/auth.ts`**
   - Interface `User` já incluía campo `permissions: string[]`
   - Mantida compatibilidade com sistema existente

## 🎯 Fluxo de Autenticação

```
1. Usuário faz login
   ↓
2. Backend retorna JWT com permissões
   ↓
3. App decodifica o JWT
   ↓
4. Valida se tem permissões mínimas
   ↓
5. Se SIM: Login bem-sucedido
   |  - Armazena token
   |  - Armazena permissões
   |  - Navega para dashboard
   ↓
6. Se NÃO: Login falha
   |  - Exibe erro: "Você não possui permissões..."
   |  - Não permite acesso ao app
```

## 🧪 Como Testar

### 1. **Criar Usuário com Permissões**
No backend, certifique-se de ter um usuário com as permissões corretas:

```sql
-- Exemplo: Usuário que pode digitalizar documentos de alunos
INSERT INTO group_permissions (group_id, permission_id)
VALUES 
  (2, 7),  -- DOCUMENTO_ALUNO_READ
  (2, 8),  -- DOCUMENTO_ALUNO_WRITE
  (2, 5);  -- TIPO_DOCUMENTO
```

### 2. **Testar Login**
- Faça login no app
- Se o usuário tiver as permissões corretas, verá a tela de seleção de entidade
- Apenas as entidades permitidas aparecerão

### 3. **Verificar Logs**
O app loga no console as permissões após login bem-sucedido:
```javascript
console.log('Permissões do usuário:', {
  aluno: true/false,
  colaborador: true/false,
  instituicao: true/false,
  permissions: ['...']
});
```

## ⚠️ Casos de Erro

### Erro 1: "Token inválido ou sem permissões"
- **Causa:** Backend não está retornando o campo `permissions` no token
- **Solução:** Verificar geração do JWT no backend

### Erro 2: "Você não possui permissões para digitalizar documentos"
- **Causa:** Usuário não tem ao menos uma combinação válida
- **Solução:** Adicionar permissões ao grupo do usuário no backend

### Erro 3: "Token expirado"
- **Causa:** Token JWT passou do tempo de expiração
- **Solução:** Fazer login novamente

## 🔧 Funções Utilitárias

### `canAccessMobileApp(permissions: string[])`
Retorna objeto com booleanos indicando acesso por entidade:
```typescript
{
  canAccessAluno: boolean,
  canAccessColaborador: boolean,
  canAccessInstituicao: boolean,
  permissions: string[]
}
```

### `hasMinimumPermissions(permissions: string[])`
Retorna `true` se o usuário pode acessar o app (tem ao menos uma entidade).

### `decodeToken(token: string)`
Decodifica o JWT e retorna o objeto `DecodedToken`.

### `isTokenExpired(token: string)`
Verifica se o token está expirado.

### `hasPermission(permissions: string[], permission: string)`
Verifica se o usuário tem uma permissão específica.

### `hasAllPermissions(userPermissions: string[], requiredPermissions: string[])`
Verifica se o usuário tem TODAS as permissões necessárias.

## 📦 Dependências Instaladas

```bash
npm install jwt-decode
```

## 🎨 UX/UI

- **Loading State:** Exibe "Carregando permissões..." enquanto valida
- **Erro no Login:** Mensagem clara explicando a falta de permissões
- **Seleção de Entidade:** Mostra apenas cards das entidades permitidas
- **Alert de Bloqueio:** Se não tiver nenhuma permissão, exibe alert e volta

## ✅ Checklist de Validação

- [x] JWT é decodificado corretamente
- [x] Permissões são extraídas do token
- [x] Validação de permissões mínimas funciona
- [x] Erro exibido quando não há permissões
- [x] Tela de seleção mostra apenas entidades permitidas
- [x] Token é armazenado globalmente para requisições
- [x] Expiração do token é verificada
- [x] Logout limpa token e permissões

## 🔄 Próximos Passos

1. ✅ Validar permissões na tela de formulário (evitar bypass)
2. ✅ Validar permissões antes de fazer upload
3. ✅ Adicionar verificação de permissão DELETE se implementar funcionalidade de deletar documentos
4. ✅ Implementar refresh token se necessário
5. ✅ Adicionar tela de "Sem Permissões" mais amigável

## 📞 Suporte

Se tiver dúvidas sobre o sistema de permissões:
1. Verificar os logs do console após login
2. Consultar `utils/permissions.ts` para lógica de validação
3. Consultar `utils/permissionConstants.ts` para lista completa de permissões
4. Verificar `data.sql` no backend para estrutura de permissões
