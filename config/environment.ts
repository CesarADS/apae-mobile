import Constants from 'expo-constants';

interface Extra {
  apiBaseUrl?: string;
}

const extra: Extra = (Constants?.expoConfig?.extra || {}) as Extra;

if (!extra.apiBaseUrl) {
  throw new Error('API_BASE_URL não foi injetada no extra do Expo. Verifique app.config.js e o arquivo .env');
}

export const ENV = {
  API_BASE_URL: extra.apiBaseUrl,
};
