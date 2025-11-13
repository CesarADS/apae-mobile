# 📱 GED APAE - Sistema Mobile de Gerenciamento Eletrônico de Documentos

<div align="center">
  <img src="./assets/images/logo.png" alt="Logo APAE" width="200"/>
  
  **Aplicativo mobile para digitalização e gerenciamento de documentos da APAE**
  
  [![Expo](https://img.shields.io/badge/Expo-54.0.20-000020?style=flat&logo=expo)](https://expo.dev)
  [![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=flat&logo=react)](https://reactnative.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
</div>

---

## 📋 Sobre o Projeto

O **GED APAE Mobile** é um aplicativo desenvolvido para facilitar a digitalização e o gerenciamento eletrônico de documentos nas unidades da APAE (Associação de Pais e Amigos dos Excepcionais). O app permite que colaboradores autorizados digitalizem documentos de alunos, colaboradores e documentos institucionais diretamente pelo celular, com upload seguro para o servidor.

---

## ✨ Funcionalidades Principais

### 🔐 **Autenticação e Segurança**
- Login seguro com email e senha
- Autenticação via QR Code
- Sistema de permissões granulares por perfil de usuário
- Tokens JWT com armazenamento criptografado (Keychain/EncryptedSharedPreferences)
- Auto-login com validação de token
- Recuperação de senha por email com código de verificação

### 📸 **Digitalização de Documentos**
- Scanner nativo com detecção automática de bordas
- Captura de múltiplas páginas por documento (limite: 20 páginas)
- Compressão inteligente de imagens
- Conversão automática para PDF de alta qualidade
- Preview e edição antes do upload
- Processamento sequencial para otimização de memória

### 📂 **Gestão de Documentos**
- Cadastro de documentos por tipo de entidade:
  - **Alunos:** documentos vinculados a alunos específicos
  - **Colaboradores:** documentos de funcionários
  - **Institucionais:** documentos gerais da instituição
- Busca inteligente de alunos e colaboradores
- Seleção de tipo de documento por categoria
- Definição de data do documento
- Campo de localização física do documento original
- Metadados completos para organização

### 🎨 **Interface do Usuário**
- Design moderno e intuitivo
- Tema claro fixo para melhor visualização
- Navegação fluida com Expo Router
- Feedback visual em todas as operações
- Mensagens de progresso durante upload
- Error boundaries para estabilidade
- Suporte a gestos nativos do Android

### 🔄 **Sincronização e Upload**
- Upload seguro via HTTPS
- Retry automático em caso de falha de rede (até 3 tentativas)
- Timeout configurável (30 segundos)
- Validação de tamanho de arquivo (máx. 40MB)
- Limpeza automática de arquivos temporários
- Indicadores de progresso detalhados

---

## 🛡️ Segurança e Privacidade

- ✅ Conexão HTTPS criptografada
- ✅ Armazenamento seguro de tokens (expo-secure-store)
- ✅ Validação de expiração de token
- ✅ Permissões baseadas em perfil de usuário
- ✅ Error boundaries para prevenir crashes
- ✅ Logs detalhados para debug (apenas em desenvolvimento)
- ✅ Conformidade com LGPD

---

## 🚀 Tecnologias Utilizadas

### **Core**
- **React Native** `0.81.5` - Framework mobile
- **Expo** `54.0.20` - Plataforma de desenvolvimento
- **TypeScript** `5.9.2` - Tipagem estática
- **Expo Router** `6.0.13` - Navegação file-based

### **Bibliotecas Principais**
- `react-native-document-scanner-plugin` - Scanner de documentos com detecção de bordas
- `expo-image-manipulator` - Processamento e compressão de imagens
- `expo-print` - Conversão de imagens para PDF
- `expo-secure-store` - Armazenamento seguro de tokens
- `jwt-decode` - Decodificação de tokens JWT
- `@react-native-picker/picker` - Seleção de tipos de documento
- `@react-native-community/datetimepicker` - Seleção de datas

### **Componentes UI**
- `expo-router` - Navegação
- `react-native-safe-area-context` - Áreas seguras
- `@expo/vector-icons` - Ícones (MaterialIcons)
- Componentes customizados (Button, Input, Typography, Modal)

---

## 📦 Instalação e Configuração

### **Pré-requisitos**
- Node.js 18+ instalado
- npm ou yarn
- Conta Expo (para builds)
- Android Studio (para emulador) ou dispositivo físico

### **1. Clone o repositório**
```bash
git clone https://github.com/CesarADS/apae-mobile.git
cd apae-mobile
```

### **2. Instale as dependências**
```bash
npm install
```

### **3. Configure as variáveis de ambiente**
Crie um arquivo `.env` na raiz do projeto:
```env
API_BASE_URL=https://gedapae.com.br/api
```

### **4. Inicie o servidor de desenvolvimento**
```bash
npx expo start
```

---

## 🏗️ Build e Deploy

### **Development Build (Testagem)**
```bash
# Build local para dispositivo conectado via USB
npx expo run:android

# Build preview via EAS (APK standalone)
eas build --platform android --profile preview
```

### **Production Build (Play Store)**
```bash
# Gerar AAB para publicação
eas build --platform android --profile production

# Enviar automaticamente para Play Store
eas submit --platform android --profile production
```

---

## 📱 Permissões do App

O aplicativo solicita as seguintes permissões:

- **📷 Câmera:** Para digitalizar documentos
- **📁 Armazenamento (Leitura/Escrita):** Para salvar temporariamente documentos antes do upload

---

## 🗂️ Estrutura do Projeto

```
apae-mobile/
├── app/                          # Telas (file-based routing)
│   ├── _layout.tsx              # Layout raiz com ErrorBoundary
│   ├── index.tsx                # Tela inicial (auto-login)
│   ├── login.tsx                # Tela de login
│   ├── dashboard.tsx            # Dashboard principal
│   └── digitalization/          # Fluxo de digitalização
│       ├── select-entity.tsx    # Seleção de tipo de documento
│       ├── form.tsx             # Formulário wrapper
│       ├── camera.tsx           # Scanner de documentos
│       ├── crop.tsx             # Preview e ajustes
│       ├── pages.tsx            # Gerenciamento de páginas
│       ├── upload.tsx           # Upload para servidor
│       └── forms/               # Formulários específicos
│           ├── AlunoForm.tsx
│           ├── ColaboradorForm.tsx
│           └── InstituicaoForm.tsx
├── components/                   # Componentes reutilizáveis
│   ├── ui/                      # Componentes base (Button, Input, Typography)
│   ├── features/                # Componentes de funcionalidades
│   └── ErrorBoundary.tsx        # Error boundary global
├── contexts/                     # Contextos React
│   └── AuthContext.tsx          # Gerenciamento de autenticação
├── hooks/                        # Hooks customizados
│   ├── useApiClient.ts          # Cliente HTTP com retry logic
│   ├── useAuth.ts               # Hook de autenticação
│   ├── useDocumentUpload.ts     # Upload de documentos
│   ├── usePasswordRecovery.ts   # Recuperação de senha
│   └── useQRCode.ts             # Scanner de QR Code
├── types/                        # Definições TypeScript
├── utils/                        # Utilitários
│   ├── permissions.ts           # Validação de permissões
│   └── secureStorage.ts         # Armazenamento seguro
├── constants/                    # Constantes (cores, etc)
├── assets/                       # Imagens e recursos
├── app.json                      # Configuração Expo
├── eas.json                      # Configuração EAS Build
└── tsconfig.json                 # Configuração TypeScript
```

---

## 🔧 Melhorias Implementadas

### **Estabilidade**
- ✅ ErrorBoundary global para capturar crashes de renderização
- ✅ Proteção contra setState em componentes desmontados
- ✅ Retry automático em requisições de rede (3x com backoff exponencial)
- ✅ Timeout de 30 segundos em todas as requisições
- ✅ Validação de token expirado com logout automático

### **Performance**
- ✅ Processamento sequencial de imagens (previne crashes por memória)
- ✅ Limite de 20 páginas por documento
- ✅ Compressão otimizada de imagens
- ✅ Limpeza automática de arquivos temporários

### **UX/UI**
- ✅ Tema claro fixo (sem mudanças automáticas)
- ✅ Cor do texto do Picker sempre visível
- ✅ KeyboardAvoidingView para melhor digitação
- ✅ Mensagens de progresso detalhadas
- ✅ Feedback visual em todas as operações
- ✅ Auto-login com token salvo

---

## 📄 Documentação Adicional

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura do projeto
- [PERMISSIONS_SYSTEM.md](./PERMISSIONS_SYSTEM.md) - Sistema de permissões
- [DIGITALIZATION_FLOW.md](./DIGITALIZATION_FLOW.md) - Fluxo de digitalização
- [DEVELOPMENT_BUILD.md](./DEVELOPMENT_BUILD.md) - Builds de desenvolvimento
- [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) - Política de privacidade

---

## 🤝 Contribuindo

Este é um projeto proprietário da APAE. Para contribuições, entre em contato com a equipe de desenvolvimento.

---

## 📜 Licença

Este projeto é de uso exclusivo da APAE. Todos os direitos reservados.

---

## 👨‍💻 Desenvolvedor

<div align="center">
  
### Criado por **César Augusto**

[![GitHub](https://img.shields.io/badge/GitHub-CesarADS-181717?style=for-the-badge&logo=github)](https://github.com/CesarADS)

**[🔗 github.com/CesarADS](https://github.com/CesarADS)**

</div>

---

<div align="center">
  <sub>Desenvolvido com ❤️ para a APAE</sub>
</div>

IMPORTANTE: Sem `API_BASE_URL` o build falhará (erro lançado em `app.config.js` / `environment.ts`).

Arquivo utilitário: `config/environment.ts` exporta `ENV.API_BASE_URL` caso queira reutilizar em outros pontos.

## Fluxo de build

Alterar o `.env` requer reiniciar o bundler (parar `npx expo start` e iniciar novamente) para refletir o valor no bundle.

## Learn more

Recursos úteis:

- [Expo documentation](https://docs.expo.dev/)
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/)

## Join the community

- [Expo on GitHub](https://github.com/expo/expo)
- [Discord community](https://chat.expo.dev)
