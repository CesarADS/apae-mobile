# 📱 Development Build - Guia Completo

## ✅ O que foi feito

1. **Instalado EAS CLI** globalmente
2. **Login no Expo** com sua conta (@cesarads)
3. **Configurado o projeto** para EAS Build
4. **Instalado react-native-image-crop-picker** (biblioteca nativa)
5. **Atualizado crop.tsx** para usar editor nativo
6. **Iniciado build de desenvolvimento** para Android

---

## 🚀 Como usar após o build

### Passo 1: Baixar e Instalar o APK

Quando o build terminar (10-20 minutos), você receberá:
- Um link no terminal
- Um email com o link para download
- Acesso no dashboard: https://expo.dev/accounts/cesarads/projects/apae-mobile/builds

**Baixe o APK** e instale no seu celular Android.

### Passo 2: Iniciar o servidor de desenvolvimento

```bash
npx expo start --dev-client
```

### Passo 3: Abrir o app

1. Abra o app **"apae-mobile (dev)"** no celular
2. Escaneie o QR code que apareceu no terminal
3. O app vai carregar conectado ao seu computador

---

## 🎯 Vantagens do Development Build

✅ **Editor nativo de crop** - Interface profissional do Android
✅ **Gestos naturais** - Pinça para zoom, rotação, etc.
✅ **Melhor performance** - Código nativo, não JavaScript
✅ **Mais recursos** - Acesso a bibliotecas nativas (ML Kit, câmera avançada, etc.)
✅ **Hot reload** - Continua funcionando normalmente

---

## 📋 Editor Nativo - Recursos

O editor de crop que agora funciona tem:

- ✅ **Arrastar para mover** a área de crop
- ✅ **Pinça (2 dedos)** para zoom in/out
- ✅ **Rotação com 2 dedos** para girar a imagem
- ✅ **Cantos arrastáveis** para redimensionar
- ✅ **Grid 3x3** para alinhamento (regra dos terços)
- ✅ **Botões de rotação** (90°, 180°, etc.)
- ✅ **Proporções fixas** (opcional: 4:3, 16:9, quadrado, etc.)
- ✅ **Free style** (crop livre, qualquer formato)

---

## 🔄 Quando preciso rebuildar?

**SIM, precisa rebuild se:**
- ❌ Adicionar/remover dependências nativas (ex: nova biblioteca com código nativo)
- ❌ Mudar versão do Expo SDK
- ❌ Alterar configurações nativas (app.json, AndroidManifest, etc.)

**NÃO precisa rebuild se:**
- ✅ Mudar código JavaScript/TypeScript
- ✅ Adicionar componentes React
- ✅ Alterar estilos
- ✅ Mudar lógica de negócio
- ✅ **95% das mudanças normais**

---

## 🛠️ Comandos úteis

```bash
# Ver status dos builds
eas build:list

# Cancelar build em andamento
eas build:cancel

# Build de produção (quando quiser publicar)
eas build --profile production --platform android

# Ver logs do build
eas build:view [BUILD_ID]

# Limpar cache e rebuildar
eas build --profile development --platform android --clear-cache
```

---

## 📱 Testando o Crop Nativo

Após instalar o Development Build:

1. **Inicie o servidor**: `npx expo start --dev-client`
2. **Abra o app** no celular
3. **Navegue até**: Dashboard → Digitalizar Documento
4. **Tire uma foto**
5. **Clique em "Recortar Imagem"**
6. **Você verá o editor nativo!** 🎉

### Funcionalidades do editor:

- **Arrastar a área verde** = Move o crop
- **Pinça (zoom)** = Aumenta/diminui a área visível
- **2 dedos girando** = Rotaciona a imagem
- **Cantos** = Redimensiona a área de crop
- **Botão de rotação** = Gira 90° (barra superior)
- **✓ Confirmar** = Aplica o crop
- **✕ Cancelar** = Volta sem salvar

---

## ⚠️ Solução de Problemas

### Build falhou?

1. **Verifique o erro** no terminal ou no dashboard
2. **Tente novamente** com: `eas build --profile development --platform android`
3. **Limpe o cache**: adicione `--clear-cache`

### App não conecta?

1. Celular e computador na **mesma rede WiFi**
2. Firewall pode estar bloqueando - desative temporariamente
3. Reinicie: `npx expo start --dev-client --clear`

### Erro ao abrir o crop?

Se aparecer erro sobre módulo não encontrado:
1. O build ainda não terminou, espere
2. Ou você está no Expo Go (precisa do Development Build)

---

## 🎓 Próximos passos

Depois que o crop estiver funcionando perfeitamente, você pode:

1. **Adicionar detecção de bordas** (OpenCV ou ML Kit)
2. **Melhorar a câmera** com foco automático, flash, etc.
3. **OCR** para extrair texto automaticamente
4. **Compressão inteligente** para upload mais rápido

---

## 📚 Documentação

- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [react-native-image-crop-picker](https://github.com/ivpusic/react-native-image-crop-picker)

---

**Criado em:** 26/10/2025
**Status:** ✅ Build em andamento...
