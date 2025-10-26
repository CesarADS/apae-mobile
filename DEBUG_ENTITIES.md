# 🔍 Debug: Problema de Entidades Não Aparecendo

## Problema
Ao clicar no botão "Digitalizar Documentos", nenhuma entidade (Aluno, Colaborador, Instituição) aparece na tela.

## Possíveis Causas
1. ❌ Usuário não possui as permissões necessárias
2. ❌ Token JWT não contém as permissões corretas
3. ❌ Erro na decodificação do token
4. ❌ Problema no estado do usuário (user.permissions)

## ✅ Correções Implementadas

### 1. Adicionado suporte para SUPER_ADMIN
- SUPER_ADMIN agora tem acesso automático a todas as entidades
- Arquivo: `utils/permissions.ts`

### 2. Adicionados logs de debug
- Logs no login (useAuth.ts)
- Logs na seleção de entidades (select-entity.tsx)
- Painel visual de debug em modo desenvolvimento

## 🧪 Como Testar

### Passo 1: Verificar os Logs no Console

1. Abra o aplicativo no Expo
2. Faça login
3. Procure no console:
   ```
   === LOGIN DEBUG ===
   Token decodificado: {...}
   Permissões recebidas: [...]
   ```

4. Verifique se as permissões incluem:
   - Para Aluno: `DOCUMENTO_ALUNO_READ`, `DOCUMENTO_ALUNO_WRITE`, `TIPO_DOCUMENTO`
   - Para Colaborador: `DOCUMENTO_COLABORADOR_READ`, `DOCUMENTO_COLABORADOR_WRITE`, `TIPO_DOCUMENTO`
   - Para Institucional: `DOCUMENTO_INSTITUCIONAL_READ`, `DOCUMENTO_INSTITUCIONAL_WRITE`, `TIPO_DOCUMENTO`
   - OU: `SUPER_ADMIN`

### Passo 2: Verificar na Tela de Seleção

1. Clique em "Digitalizar Documento"
2. Procure no console:
   ```
   === SELECT ENTITY DEBUG ===
   User: {...}
   User permissions: [...]
   Calculated permissions: {...}
   ```

3. Se estiver em modo desenvolvimento, você verá um painel cinza na tela mostrando:
   ```
   DEBUG - Permissões:
   Aluno: SIM/NÃO
   Colaborador: SIM/NÃO
   Instituição: SIM/NÃO
   Total: X permissões
   ```

## 🔧 Verificar no Backend

### Verificar Permissões do Usuário no Banco de Dados

```sql
-- Ver permissões do usuário
SELECT u.email, p.nome as permissao
FROM tb_users u
JOIN user_group ug ON ug.user_id = u.id
JOIN group_permissions gp ON gp.group_id = ug.group_id
JOIN tb_permissions p ON p.id = gp.permission_id
WHERE u.email = 'SEU_EMAIL_AQUI';
```

### Verificar se o Token Contém as Permissões

1. Faça login no frontend web
2. Abra o DevTools (F12)
3. Copie o token da resposta
4. Acesse https://jwt.io
5. Cole o token
6. Verifique se o payload contém:
   ```json
   {
     "sub": "email@exemplo.com",
     "nome": "Nome do Usuário",
     "permissions": [
       "DOCUMENTO_ALUNO_READ",
       "DOCUMENTO_ALUNO_WRITE",
       "TIPO_DOCUMENTO"
     ],
     "exp": 1234567890
   }
   ```

## ✅ Requisitos Mínimos

Para acessar o app mobile, o usuário precisa de **pelo menos UMA** das seguintes combinações:

### Opção 1: Documentos de Aluno
- ✅ `DOCUMENTO_ALUNO_READ`
- ✅ `DOCUMENTO_ALUNO_WRITE`
- ✅ `TIPO_DOCUMENTO`

### Opção 2: Documentos de Colaborador
- ✅ `DOCUMENTO_COLABORADOR_READ`
- ✅ `DOCUMENTO_COLABORADOR_WRITE`
- ✅ `TIPO_DOCUMENTO`

### Opção 3: Documentos Institucionais
- ✅ `DOCUMENTO_INSTITUCIONAL_READ`
- ✅ `DOCUMENTO_INSTITUCIONAL_WRITE`
- ✅ `TIPO_DOCUMENTO`

### Opção 4: Super Admin
- ✅ `SUPER_ADMIN` (tem acesso a tudo automaticamente)

## 🚨 Cenários de Erro Comuns

### Erro: "Você não possui permissões para digitalizar documentos"
**Causa**: Usuário não tem permissões mínimas  
**Solução**: Adicionar permissões no banco de dados ou atribuir grupo com permissões corretas

### Erro: Tela de seleção aparece vazia (sem cards)
**Causa**: Usuário passou pela validação de login mas não tem as permissões específicas  
**Solução**: Verificar logs de debug e adicionar permissões faltantes

### Erro: "Token inválido ou sem permissões"
**Causa**: Token JWT não contém o campo `permissions`  
**Solução**: Verificar implementação do backend - método que gera o token deve incluir as permissões

## 📝 Próximos Passos

1. **Teste com SUPER_ADMIN**: Crie um usuário com SUPER_ADMIN e teste
2. **Teste com permissões específicas**: Crie um usuário com apenas permissões de Aluno
3. **Verifique os logs**: Compartilhe os logs do console para análise detalhada
4. **Teste o token**: Use jwt.io para verificar o conteúdo do token

## 🔗 Arquivos Modificados

- `utils/permissions.ts` - Adicionado suporte para SUPER_ADMIN
- `hooks/useAuth.ts` - Adicionados logs de debug no login
- `app/digitalization/select-entity.tsx` - Adicionados logs e painel visual de debug
- `test-permissions.js` - Script de teste da lógica de permissões
