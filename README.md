# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Variáveis de ambiente

O projeto utiliza agora um arquivo `.env` na raiz para configurar a URL base da API.

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
2. Ajuste o valor:
   ```env
   API_BASE_URL=https://seu-dominio.com/api
   ```
3. A URL é exposta via `extra.apiBaseUrl` em `app.config.js` e acessada em runtime pelo hook `useApiClient`.

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
