# 🔐 Sistema de Permissões - GED APAE Mobile

## Visão Geral

O sistema de permissões do GED APAE Mobile garante que usuários tenham acesso apenas às funcionalidades autorizadas. As permissões são gerenciadas no backend e validadas no frontend através do **token JWT**.

---

## 🎯 Tipos de Permissões

### **Permissões por Entidade**

Cada entidade (Aluno, Colaborador, Instituição) possui 3 níveis de permissão:

| Permissão | Código | Descrição |
|-----------|--------|-----------|
| **Leitura** | `DOCUMENTO_ALUNO_READ` | Visualizar documentos |
| **Escrita** | `DOCUMENTO_ALUNO_WRITE` | Criar/editar documentos |
| **Exclusão** | `DOCUMENTO_ALUNO_DELETE` | Deletar documentos |

### **Lista Completa de Permissões**

#### **Documentos de Alunos**
- `DOCUMENTO_ALUNO_READ`
- `DOCUMENTO_ALUNO_WRITE`
- `DOCUMENTO_ALUNO_DELETE`

#### **Documentos de Colaboradores**
- `DOCUMENTO_COLABORADOR_READ`
- `DOCUMENTO_COLABORADOR_WRITE`
- `DOCUMENTO_COLABORADOR_DELETE`

#### **Documentos Institucionais**
- `DOCUMENTO_INSTITUCIONAL_READ`
- `DOCUMENTO_INSTITUCIONAL_WRITE`
- `DOCUMENTO_INSTITUCIONAL_DELETE`

#### **Tipos de Documento**
- `TIPO_DOCUMENTO` - Obrigatório para visualizar lista de tipos

---

## 🔑 Validação de Acesso ao App

### **Permissões Mínimas Requeridas**

Para acessar o app mobile, o usuário precisa:

1. **Pelo menos uma permissão de LEITURA** em qualquer entidade
2. **Pelo menos uma permissão de ESCRITA** em qualquer entidade
3. **Permissão TIPO_DOCUMENTO** para visualizar tipos

**Exemplo de validação:**
```typescript
// utils/permissions.ts

export const hasMinimumPermissions = (permissions: string[]): boolean => {
  const hasRead = permissions.some(p => 
    p.includes('READ') && p.includes('DOCUMENTO')
  );
  
  const hasWrite = permissions.some(p => 
    p.includes('WRITE') && p.includes('DOCUMENTO')
  );
  
  const hasTipoDocumento = permissions.includes('TIPO_DOCUMENTO');
  
  return hasRead && hasWrite && hasTipoDocumento;
};
```

---

## 📋 Estrutura do Token JWT

O token JWT contém as permissões do usuário:

```json
{
  "sub": "123",
  "nome": "João Silva",
  "email": "joao@apae.org.br",
  "permissions": [
    "DOCUMENTO_ALUNO_READ",
    "DOCUMENTO_ALUNO_WRITE",
    "TIPO_DOCUMENTO"
  ],
  "exp": 1699999999,
  "iat": 1699900000
}
```

**Campos importantes:**
- `sub` - ID do usuário
- `nome` - Nome completo
- `permissions` - Array de permissões
- `exp` - Timestamp de expiração
- `iat` - Timestamp de criação

---

## 🛡️ Validações no Frontend

### **1. Login**

No momento do login, o app valida se o usuário tem permissões suficientes:

```typescript
// contexts/AuthContext.tsx

if (!hasMinimumPermissions(decodedToken.permissions)) {
  throw new Error(
    'Você não possui permissões para digitalizar documentos.'
  );
}
```

### **2. Seleção de Entidade**

Na tela de seleção, apenas entidades permitidas são exibidas:

```typescript
// app/digitalization/select-entity.tsx

const userPermissions = canAccessMobileApp(user?.permissions || []);

{userPermissions.canAccessAluno && (
  <EntityCard entity="aluno" />
)}

{userPermissions.canAccessColaborador && (
  <EntityCard entity="colaborador" />
)}

{userPermissions.canAccessInstituicao && (
  <EntityCard entity="instituicao" />
)}
```

### **3. Tipos de Documento**

Os tipos são filtrados no formulário baseado nas permissões:

```typescript
// app/digitalization/forms/AlunoForm.tsx

const tiposDocumento = tiposDocumentoList.filter(
  tipo => tipo.aluno === true
);
```

---

## 🔄 Fluxo de Validação

```
┌──────────────┐
│ Login Screen │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Validate Token   │
│ - Decode JWT     │
│ - Check expiry   │
└──────┬───────────┘
       │
       ▼
┌──────────────────────┐
│ Validate Permissions │
│ - hasRead?           │
│ - hasWrite?          │
│ - hasTipoDocumento?  │
└──────┬───────────────┘
       │
       ├─→ ❌ Insufficient → Show Error
       │
       └─→ ✅ Valid → Dashboard
                │
                ▼
       ┌────────────────┐
       │ Select Entity  │
       │ - Show allowed │
       └────────────────┘
```

---

## 🎨 Feedback Visual

### **Sem Permissões**
```
┌─────────────────────────────────┐
│  ⚠️ Acesso Negado               │
│                                 │
│  Você não possui permissões     │
│  para digitalizar documentos.   │
│                                 │
│  Contate o administrador.       │
│                                 │
│  [Voltar para Login]            │
└─────────────────────────────────┘
```

### **Permissões Parciais**
Se o usuário tem acesso apenas a Alunos, a tela mostra:
```
┌─────────────────────────────────┐
│  Selecione o tipo de documento  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  👨‍🎓 Aluno               │  │ ← Habilitado
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  👔 Colaborador   (bloq.) │  │ ← Desabilitado
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  🏢 Institucional (bloq.) │  │ ← Desabilitado
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

---

## 🔧 Utilitários de Permissão

### **canAccessMobileApp**

Retorna objeto com permissões de acesso:

```typescript
export const canAccessMobileApp = (permissions: string[]) => {
  return {
    canAccessAluno: 
      permissions.includes('DOCUMENTO_ALUNO_READ') &&
      permissions.includes('DOCUMENTO_ALUNO_WRITE'),
      
    canAccessColaborador:
      permissions.includes('DOCUMENTO_COLABORADOR_READ') &&
      permissions.includes('DOCUMENTO_COLABORADOR_WRITE'),
      
    canAccessInstituicao:
      permissions.includes('DOCUMENTO_INSTITUCIONAL_READ') &&
      permissions.includes('DOCUMENTO_INSTITUCIONAL_WRITE'),
      
    hasTipoDocumento: 
      permissions.includes('TIPO_DOCUMENTO'),
  };
};
```

### **isTokenExpired**

Valida se o token ainda é válido:

```typescript
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch {
    return true;
  }
};
```

---

## 📊 Matriz de Permissões

| Usuário | Aluno R | Aluno W | Colab R | Colab W | Inst R | Inst W | Tipo Doc | Acesso |
|---------|---------|---------|---------|---------|--------|--------|----------|--------|
| Admin   | ✅      | ✅      | ✅      | ✅      | ✅     | ✅     | ✅       | ✅ Total |
| Gestor  | ✅      | ✅      | ✅      | ✅      | ❌     | ❌     | ✅       | ✅ Parcial |
| Prof.   | ✅      | ✅      | ❌      | ❌      | ❌     | ❌     | ✅       | ✅ Alunos |
| RH      | ❌      | ❌      | ✅      | ✅      | ❌     | ❌     | ✅       | ✅ Colab. |
| Visitante | ✅    | ❌      | ❌      | ❌      | ❌     | ❌     | ❌       | ❌ Negado |

---

## 🔐 Segurança

### **Validação Dupla**

1. **Frontend:** Valida permissões para UX
2. **Backend:** Valida permissões para segurança

**Nunca confie apenas no frontend!**

### **Token Seguro**

- Armazenado em **Keychain** (iOS) ou **EncryptedSharedPreferences** (Android)
- Nunca armazenado em plain text
- Auto-destruído ao expirar

### **Expiração**

- Token tem validade definida no backend
- App valida expiração automaticamente
- Logout automático quando expira
- Re-autenticação necessária

---

## 🚨 Tratamento de Erros

### **Token Expirado**
```
Sua sessão expirou. Por favor, faça login novamente.
```

### **Sem Permissões**
```
Você não possui permissões para digitalizar documentos.
É necessário ter permissão de ler e escrever para pelo menos uma entidade.
```

### **Acesso Negado (403)**
```
Você não tem permissão para realizar esta ação.
Contate o administrador.
```

---

## 📱 Exemplo Prático

**Usuário:** Professor de Educação Física

**Permissões:**
- `DOCUMENTO_ALUNO_READ`
- `DOCUMENTO_ALUNO_WRITE`
- `TIPO_DOCUMENTO`

**Pode fazer:**
- ✅ Digitalizar documentos de alunos
- ✅ Visualizar tipos de documento
- ✅ Fazer upload de PDFs de alunos

**Não pode fazer:**
- ❌ Digitalizar documentos de colaboradores
- ❌ Digitalizar documentos institucionais
- ❌ Ver opções de Colaborador ou Instituição

---

## 🔄 Atualização de Permissões

Para atualizar permissões de um usuário:

1. Admin altera permissões no sistema web
2. Usuário faz logout do app mobile
3. Usuário faz login novamente
4. Novo token com permissões atualizadas é gerado
5. App reflete novas permissões automaticamente

---

## 📚 Referências

- [JWT.io](https://jwt.io) - Decode tokens
- [LGPD](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) - Lei de proteção de dados
