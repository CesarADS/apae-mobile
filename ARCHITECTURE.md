# GED APAE Mobile - Arquitetura de Componentes e Hooks

## 📋 Visão Geral

Este projeto React Native foi completamente componentizado seguindo as melhores práticas de desenvolvimento, com uma arquitetura baseada em:

- **Componentes UI reutilizáveis**
- **Componentes de Features específicas**  
- **Hooks customizados para lógica de negócio**
- **Serviços para gerenciamento de API**
- **Types TypeScript para type safety**

## 🏗️ Estrutura do Projeto

```
/components/
  /ui/                    # Componentes de UI reutilizáveis
    Button.tsx
    Input.tsx
    Typography.tsx
    Container.tsx
    IconButton.tsx
    index.ts              # Barrel export
  /features/              # Componentes específicos de funcionalidades
    QRCodeScanner.tsx
    Modal.tsx
    index.ts              # Barrel export
  index.ts                # Barrel export principal

/hooks/                   # Hooks customizados
  useAuth.ts              # Gerenciamento de autenticação
  usePasswordRecovery.ts  # Fluxo de recuperação de senha
  useQRCode.ts           # Scanner QR Code
  index.ts               # Barrel export

/services/               # Camada de serviços/API
  apiClient.ts           # Cliente HTTP centralizado
  authService.ts         # Serviços de autenticação
  index.ts              # Barrel export

/types/                  # Definições TypeScript
  auth.ts               # Types relacionados à autenticação
  index.ts             # Barrel export

/app/
  login.tsx            # Tela de login refatorada
```

## 🧩 Componentes UI

### Button
Botão reutilizável com estados de loading e disabled.

```tsx
<Button
  title="Entrar"
  onPress={handleLogin}
  loading={loading}
  disabled={loading}
/>
```

### Input
Campo de entrada com suporte a todos os props do TextInput nativo.

```tsx
<Input
  placeholder="E-mail"
  keyboardType="email-address"
  autoCapitalize="none"
  value={email}
  onChangeText={setEmail}
/>
```

### Typography
Componente de texto com variantes predefinidas.

```tsx
<Typography variant="h2" color="primary" align="center">
  Bem-vindo ao GED APAE
</Typography>
```

### IconButton
Botão com ícone do MaterialIcons.

```tsx
<IconButton
  iconName="qr-code-scanner"
  size={48}
  color="#007BFF"
  onPress={openScanner}
/>
```

### Container
Container básico com View e props customizáveis.

```tsx
<Container style={styles.content}>
  {children}
</Container>
```

## 🎯 Componentes de Features

### QRCodeScanner
Modal completo para escaneamento de QR Code.

```tsx
<QRCodeScanner
  visible={qrVisible}
  onClose={closeScanner}
  onScan={handleQRCodeScan}
/>
```

### Modal
Modal genérico reutilizável.

```tsx
<Modal
  visible={isVisible}
  onClose={handleClose}
  title="Título do Modal"
>
  {children}
</Modal>
```

## 🎣 Hooks Customizados

### useAuth
Gerencia o estado de autenticação e login.

```tsx
const {
  email,
  password,
  loading,
  error,
  isAuthenticated,
  setEmail,
  setPassword,
  login,
  logout
} = useAuth();
```

**Funcionalidades:**
- Campos de email/password com validação
- Estado de loading durante requisições
- Gerenciamento de erros
- Função de login que retorna boolean
- Logout com limpeza de estado

### usePasswordRecovery
Gerencia o fluxo completo de recuperação de senha.

```tsx
const {
  step,           // 'idle' | 'email' | 'reset'
  email,
  code,
  newPassword,
  loading,
  error,
  setEmail,
  setCode,
  setNewPassword,
  sendRecoveryEmail,
  resetPassword,
  resetFlow,
  startRecovery
} = usePasswordRecovery();
```

**Fluxo:**
1. `startRecovery(email)` - Inicia com email
2. `sendRecoveryEmail()` - Envia código por email  
3. `resetPassword()` - Define nova senha
4. `resetFlow()` - Volta ao estado inicial

### useQRCode
Gerencia o scanner de QR Code.

```tsx
const {
  visible,
  scanned,
  error,
  openScanner,
  closeScanner,
  handleScan
} = useQRCode();
```

**Funcionalidades:**
- Controle de visibilidade do scanner
- Estado de escaneamento
- Validação automática do JSON
- Tratamento de erros com alerts

## 🔧 Serviços

### ApiClient
Cliente HTTP centralizado com interceptors.

```tsx
class ApiClient {
  async get<T>(endpoint: string): Promise<T>
  async post<T>(endpoint: string, data: any): Promise<T>
  async put<T>(endpoint: string, data: any): Promise<T>
  async delete<T>(endpoint: string): Promise<T>
}
```

**Funcionalidades:**
- Base URL configurável
- Headers padrão (Content-Type, Authorization)
- Interceptors para request/response
- Tratamento automático de erros HTTP
- Suporte a token JWT

### AuthService
Serviços específicos de autenticação.

```tsx
class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse>
  static async forgotPassword(request: ForgotPasswordRequest): Promise<void>
  static async resetPassword(request: ResetPasswordRequest): Promise<void>
}
```

## 📝 Types TypeScript

### Interfaces de Request/Response
```tsx
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  expiresAt: string;
  permissions: string[];
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  email: string;
  recoveryCode: string;
  newPassword: string;
}
```

### Estados dos Hooks
```tsx
interface AuthState extends AsyncState<LoginResponse> {
  isAuthenticated: boolean;
  user: User | null;
}

interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
```

## 🚀 Como Usar

### Imports Simplificados
Graças aos barrel exports, todos os imports são limpos:

```tsx
// Componentes
import { Button, Input, Typography, Modal } from '../components';

// Hooks  
import { useAuth, usePasswordRecovery } from '../hooks';

// Serviços
import { AuthService } from '../services';

// Types
import { LoginRequest, AuthState } from '../types';
```

### Exemplo de Uso Completo
```tsx
export default function LoginScreen() {
  const { email, password, loading, setEmail, setPassword, login } = useAuth();
  const { step, startRecovery, sendRecoveryEmail, resetPassword } = usePasswordRecovery();
  const { visible, openScanner, handleScan } = useQRCode();

  const handleLogin = async () => {
    const success = await login();
    if (success) {
      router.replace('/dashboard');
    }
  };

  return (
    <Container>
      <Input
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button
        title="Entrar"
        onPress={handleLogin}
        loading={loading}
      />
    </Container>
  );
}
```

## ✨ Benefícios da Arquitetura

### 🔄 Reutilização
- Componentes UI funcionam em qualquer tela
- Hooks podem ser reutilizados em diferentes contextos
- Serviços centralizados evitam duplicação

### 🧪 Testabilidade
- Hooks podem ser testados isoladamente
- Componentes têm responsabilidades bem definidas
- Mocks fáceis dos serviços

### 📦 Manutenibilidade
- Separação clara de responsabilidades
- Código organizado e encontrável
- Imports limpos com barrel exports

### 🔒 Type Safety
- TypeScript em toda a aplicação
- Interfaces bem definidas
- Autocomplete e detecção de erros

### 🎯 Flexibilidade
- Componentes aceitam props customizadas
- Hooks retornam dados e funções específicas
- Fácil extensão e modificação

## 🔧 Próximos Passos

1. **Persistência**: Adicionar AsyncStorage para tokens
2. **Navegação**: Integrar com sistema de rotas protegidas  
3. **Testes**: Implementar testes unitários para hooks
4. **Performance**: Implementar React.memo onde necessário
5. **Acessibilidade**: Adicionar suporte completo a11y
6. **Offline**: Implementar cache e sincronização offline

---

Esta arquitetura fornece uma base sólida e escalável para o desenvolvimento do aplicativo GED APAE, seguindo as melhores práticas da comunidade React Native.