# 🛠️ Development Build - GED APAE Mobile

## Visão Geral

Este guia explica como configurar o ambiente de desenvolvimento, gerar builds de teste e produção usando **Expo EAS Build**.

---

## 📋 Pré-requisitos

### **Software Necessário**
- Node.js 18+ ([Download](https://nodejs.org/))
- Git ([Download](https://git-scm.com/))
- Android Studio (para emulador) ou dispositivo físico
- Conta Expo ([Criar conta](https://expo.dev/signup))

### **Configuração de Conta**
```bash
# Instalar EAS CLI globalmente
npm install -g eas-cli

# Login na conta Expo
eas login

# Verificar conta atual
eas whoami
```

**Conta atual:** `gestaoapae` (apaesistema@gmail.com)

---

## 🚀 Instalação do Projeto

### **1. Clonar Repositório**
```bash
git clone https://github.com/your-org/apae-mobile.git
cd apae-mobile
```

### **2. Instalar Dependências**
```bash
npm install
```

### **3. Configurar Variáveis de Ambiente**
Edite `config/environment.ts` com a URL do backend:

```typescript
export const API_URL = 'http://seu-servidor.com.br:8080/api';
```

---

## 🔧 Development Build

### **O que é Development Build?**
É uma build especial que:
- ✅ Permite usar bibliotecas nativas (expo-dev-client)
- ✅ Suporta hot reload
- ✅ Facilita debugging
- ✅ Não precisa rebuild a cada mudança de código

### **Criar Development Build**

**Primeira vez:**
```bash
# Configurar projeto EAS
eas build:configure

# Criar development build para Android
eas build --profile development --platform android
```

**Instalar no dispositivo:**
1. Baixar APK gerado (link no terminal)
2. Transferir para Android e instalar
3. Executar projeto local:
   ```bash
   npx expo start --dev-client
   ```
4. Escanear QR code no app instalado

### **Workflow de Desenvolvimento**
```
┌────────────────────────────────────────┐
│  1. Development Build instalado (1x)  │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│  2. npx expo start --dev-client        │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│  3. Editar código (hot reload)         │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│  4. Testar no dispositivo em tempo real│
└────────────────────────────────────────┘
```

---

## 📦 Preview Build

### **O que é Preview Build?**
Build de teste completo:
- ✅ Simula produção
- ✅ Testa features antes de enviar para loja
- ✅ Compartilhável com testadores
- ❌ Não permite hot reload

### **Gerar Preview Build**

```bash
# Build preview para Android
eas build --profile preview --platform android
```

**Configuração (eas.json):**
```json
{
  "preview": {
    "android": {
      "buildType": "apk",
      "distribution": "internal"
    }
  }
}
```

### **Distribuir para Testadores**
1. Baixar APK gerado
2. Enviar por email/drive/link
3. Instalar no dispositivo de teste
4. **Não precisa ter Expo instalado**

---

## 🚢 Production Build

### **O que é Production Build?**
Build final para publicação:
- ✅ Otimizada e minificada
- ✅ Formato AAB (Google Play)
- ✅ Assinada com keystore
- ✅ Pronta para loja

### **Gerar Production Build**

```bash
# Build production para Google Play
eas build --profile production --platform android
```

**Configuração (eas.json):**
```json
{
  "production": {
    "android": {
      "buildType": "app-bundle"
    }
  }
}
```

### **Credenciais**
EAS gerencia automaticamente:
- ✅ Android keystore
- ✅ Assinatura do APK/AAB
- ✅ Armazenamento seguro

**Primeiro build production:**
```
? Generate a new Android Keystore? Yes
✓ Generated Keystore
✓ Uploaded to EAS servers
```

---

## 📱 Instalação no Dispositivo

### **Development Build**
```bash
# Método 1: Scan QR code
npx expo start --dev-client

# Método 2: USB debugging
adb install build.apk
npx expo start --dev-client --localhost
```

### **Preview/Production Build**
```bash
# Transferir APK para dispositivo
adb install -r build.apk

# Ou baixar diretamente no celular
# e instalar manualmente
```

---

## 🔐 Configuração de Credenciais

### **EAS Project Owner**
```json
// app.json
{
  "expo": {
    "owner": "gestaoapae",
    "slug": "apae-mobile"
  }
}
```

### **Atualizar Credenciais**
```bash
# Ver credenciais atuais
eas credentials

# Resetar keystore (CUIDADO!)
eas credentials --platform android
# > Select: Keystore > Remove
```

⚠️ **Aviso:** Remover keystore impede atualizar app na Play Store!

---

## 🌍 Update Over-the-Air (OTA)

### **O que é OTA?**
Atualização de código sem rebuildar:
- ✅ JavaScript changes
- ✅ Assets (imagens, etc)
- ❌ Native code (bibliotecas)

### **Publicar Update**
```bash
# Publicar update para production
eas update --branch production --message "Fix login bug"

# Publicar para preview
eas update --branch preview --message "Test new feature"
```

### **Quando usar?**
- ✅ Bugs críticos de JS
- ✅ Ajustes de UI
- ✅ Correções de texto
- ❌ Novas bibliotecas nativas
- ❌ Mudanças em app.json

---

## 🔍 Troubleshooting

### **Build falha com "ENOSPC"**
**Problema:** Sem espaço no servidor EAS

**Solução:**
```bash
# Limpar cache local
npm cache clean --force
rm -rf node_modules
npm install

# Tentar novamente
eas build --profile preview --platform android --clear-cache
```

### **"Keystore not found"**
**Problema:** Credenciais perdidas

**Solução:**
```bash
# Gerar novo keystore
eas credentials
# > Android > Production > Keystore > Generate new
```

⚠️ **Importante:** Novo keystore = não pode atualizar app na loja

### **Build muito lenta**
**Problema:** Fila do EAS

**Solução:**
- Assinar plano pago (builds prioritárias)
- Ou aguardar fila gratuita (~20min)

### **APK não instala**
**Problema:** "App not installed"

**Causas:**
1. **Signature mismatch:** Desinstalar versão antiga primeiro
2. **Insufficient storage:** Liberar espaço
3. **Corrupt APK:** Baixar novamente

**Solução:**
```bash
# Desinstalar versão antiga
adb uninstall com.apae.mobile

# Instalar nova
adb install build.apk
```

### **Hot reload não funciona**
**Problema:** Mudanças não aparecem

**Solução:**
```bash
# Limpar cache Metro
npx expo start --dev-client --clear

# Ou recarregar app (shake device > Reload)
```

---

## 📊 Build Profiles Comparação

| Feature | Development | Preview | Production |
|---------|-------------|---------|------------|
| Hot Reload | ✅ | ❌ | ❌ |
| Debug Tools | ✅ | ✅ | ❌ |
| Otimização | ❌ | ✅ | ✅ |
| Tamanho | ~50MB | ~30MB | ~25MB |
| Tempo Build | 5-10min | 10-15min | 15-20min |
| Formato | APK | APK | AAB |
| Distribuição | Dev only | Internal | Google Play |
| OTA Updates | ✅ | ✅ | ✅ |

---

## 🎯 Fluxo Recomendado

### **Para Features Novas**
```
Development Build → Testar localmente → 
Preview Build → QA testing → 
Production Build → Google Play
```

### **Para Hotfixes**
```
Development Build → Fix → 
OTA Update (se apenas JS) OU
Production Build (se mudança nativa)
```

---

## 📚 Comandos Úteis

```bash
# Ver builds recentes
eas build:list

# Ver detalhes de build específica
eas build:view BUILD_ID

# Cancelar build em progresso
eas build:cancel

# Ver logs de build
eas build:logs BUILD_ID

# Configurar projeto
eas build:configure

# Inspecionar configuração
eas build:inspect --profile production --platform android

# Ver updates publicados
eas update:list --branch production

# Rollback de update
eas update --branch production --message "Rollback" --republish

# Ver uso de builds (quota)
eas build:list --limit 30
```

---

## 🔗 Links Úteis

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android App Bundle](https://developer.android.com/guide/app-bundle)
- [EAS Pricing](https://expo.dev/pricing)

---

## ⚙️ Configuração Completa (eas.json)

```json
{
  "cli": {
    "version": ">= 7.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

---

## 🎓 Melhores Práticas

### **Versionamento**
```json
// app.json
{
  "version": "1.2.3", // Semantic versioning
  "android": {
    "versionCode": 10203 // Incrementar a cada build
  }
}
```

### **Build Testing Checklist**
- [ ] Testar login/logout
- [ ] Testar digitalização completa
- [ ] Verificar permissões (câmera, storage)
- [ ] Testar offline behavior
- [ ] Verificar performance
- [ ] Testar em devices diferentes (small/large)

### **Pre-Production Checklist**
- [ ] Version bumped
- [ ] CHANGELOG.md atualizado
- [ ] Testado em preview build
- [ ] Privacy policy atualizada
- [ ] Screenshots atualizados
- [ ] Store listing revisada

---

## 👨‍💻 Desenvolvido por

**César Augusto**  
GitHub: [@CesarADS](https://github.com/CesarADS)

---

## 📄 Licença

Este projeto é proprietário da APAE.
