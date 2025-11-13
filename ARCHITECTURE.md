# 🏗️ Arquitetura do Projeto - GED APAE Mobile

## Visão Geral

O **GED APAE Mobile** é construído utilizando uma arquitetura modular baseada em **React Native** com **Expo**, seguindo princípios de **separação de responsabilidades** e **componentização**.

---

## 📐 Padrões Arquiteturais

### **1. File-Based Routing (Expo Router)**

O projeto utiliza navegação baseada em arquivos, onde a estrutura de pastas em `app/` define automaticamente as rotas:

```
app/
├── _layout.tsx          → Layout raiz com providers
├── index.tsx            → Rota inicial (/)
├── login.tsx            → Rota de login (/login)
├── dashboard.tsx        → Dashboard (/dashboard)
└── digitalization/      → Grupo de rotas (/digitalization/*)
    ├── _layout.tsx      → Layout do grupo
    ├── camera.tsx       → Scanner (/digitalization/camera)
    └── ...
```

**Vantagens:**
- Navegação declarativa
- Code splitting automático
- Deep linking nativo
- Tipagem automática de rotas

---

### **2. Context API + Hooks**

Gerenciamento de estado global utilizando **Context API** combinado com **Custom Hooks**:

#### **AuthContext**
- Gerencia estado de autenticação
- Armazena dados do usuário e permissões
- Persiste token em armazenamento seguro
- Provê métodos: `login()`, `logout()`, `clearError()`

```typescript
const { isAuthenticated, user, login, logout } = useAuth();
```

#### **Custom Hooks**
- `useApiClient` - Cliente HTTP configurado
- `useDocumentUpload` - Lógica de upload
- `usePasswordRecovery` - Recuperação de senha
- `useQRCode` - Scanner de QR Code

---

### **3. Camada de Componentes**

#### **Componentes UI (Atomic Design)**
Componentes base reutilizáveis:
- `Button` - Botões com variantes
- `Input` - Campos de entrada
- `Typography` - Textos tipografados
- `Container` - Containers responsivos

#### **Componentes de Funcionalidade**
Componentes de negócio específicos:
- `ErrorBoundary` - Captura de erros de renderização
- `PasswordRecoveryModal` - Modal de recuperação
- `QRCodeScanner` - Scanner de QR Code

#### **Formulários Especializados**
- `AlunoForm` - Formulário de documentos de alunos
- `ColaboradorForm` - Formulário de documentos de colaboradores
- `InstituicaoForm` - Formulário de documentos institucionais

---

## 🔄 Fluxo de Dados

### **Fluxo de Autenticação**

```
┌─────────────┐
│ LoginScreen │
└──────┬──────┘
       │ login(email, password)
       ▼
┌─────────────┐
│ AuthContext │
└──────┬──────┘
       │ useApiClient.post('/login')
       ▼
┌─────────────┐
│  API Server │
└──────┬──────┘
       │ { token, user }
       ▼
┌─────────────────┐
│ SecureStorage   │ ← Persiste token
└─────────────────┘
       │
       ▼
┌─────────────┐
│  Dashboard  │
└─────────────┘
```

### **Fluxo de Digitalização**

```
SelectEntity → Form → Camera → Crop → Pages → Upload
     │           │       │       │       │        │
     │           │       │       │       │        └─→ PDF generation
     │           │       │       │       └─→ Manage pages
     │           │       │       └─→ Preview/adjust
     │           │       └─→ Scan document
     │           └─→ Fill metadata
     └─→ Choose entity type
```

---

## 🗄️ Camada de Dados

### **API Client (useApiClient)**

Cliente HTTP centralizado com:
- **Base URL configurável** via `.env`
- **Auto-injeção de token** em todas as requisições
- **Retry automático** (3 tentativas com backoff exponencial)
- **Timeout** de 30 segundos
- **Error handling** padronizado

```typescript
const api = useApiClient();
const response = await api.get('/endpoint');
```

### **Secure Storage**

Armazenamento seguro usando `expo-secure-store`:
- **iOS:** Keychain (criptografia AES)
- **Android:** EncryptedSharedPreferences
- **Funções:** `saveToken()`, `getToken()`, `clearAuthData()`

---

## 🎯 Princípios de Design

### **1. Separation of Concerns**
- **Apresentação:** Componentes UI
- **Lógica:** Custom Hooks
- **Estado:** Context API
- **Dados:** API Client

### **2. Single Responsibility**
Cada módulo tem uma única responsabilidade:
- `useDocumentUpload` → apenas upload
- `AuthContext` → apenas autenticação
- `ErrorBoundary` → apenas captura de erros

### **3. Composição sobre Herança**
Componentes são compostos, não herdados:
```tsx
<Container variant="screen">
  <Typography variant="h1">Título</Typography>
  <Button variant="primary">Ação</Button>
</Container>
```

### **4. Imutabilidade**
Estado é sempre atualizado de forma imutável:
```typescript
setState(prev => ({ ...prev, newProp: value }));
```

---

## 🛡️ Camada de Segurança

### **Validações**

1. **Frontend (UI):**
   - Validação de formulários
   - Verificação de permissões
   - Sanitização de inputs

2. **Backend (API):**
   - Autenticação JWT
   - Validação de permissões
   - Rate limiting

### **Proteções Implementadas**

- ✅ Error Boundaries
- ✅ setState guards (isMounted)
- ✅ Token expiration handling
- ✅ Retry logic com backoff
- ✅ Timeout em requisições
- ✅ Validação de tipos (TypeScript)

---

## 📦 Build e Deploy

### **Development**
```bash
npx expo start
```

### **Preview (APK)**
```bash
eas build --platform android --profile preview
```

### **Production (AAB)**
```bash
eas build --platform android --profile production
```

---

## 🔮 Extensibilidade

### **Adicionar Nova Entidade**

1. Criar formulário em `app/digitalization/forms/`
2. Adicionar tipo em `types/digitalization.ts`
3. Atualizar `select-entity.tsx`
4. Configurar permissões em `utils/permissions.ts`

### **Adicionar Nova Tela**

1. Criar arquivo em `app/nome-tela.tsx`
2. Rota automática: `/nome-tela`
3. Adicionar navegação onde necessário

---

## 📊 Performance

### **Otimizações Implementadas**

- ✅ **Lazy loading** de rotas (Expo Router)
- ✅ **Code splitting** automático
- ✅ **Image compression** (60-90%)
- ✅ **Sequential processing** (previne memory spikes)
- ✅ **Cleanup** de arquivos temporários
- ✅ **Memoization** em componentes pesados

---

## 🧪 Testabilidade

A arquitetura facilita testes:

- **Hooks isolados** podem ser testados independentemente
- **Componentes puros** facilitam snapshot testing
- **API mockável** via dependency injection
- **TypeScript** previne erros em tempo de desenvolvimento

---

## 📚 Referências

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [React Native Best Practices](https://reactnative.dev/docs/performance)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
