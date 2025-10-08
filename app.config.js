import 'dotenv/config';

export default ({ config }) => {
  if (!process.env.API_BASE_URL) {
    throw new Error('Variável de ambiente API_BASE_URL não definida. Crie um arquivo .env com API_BASE_URL.');
  }
  return {
    ...config,
    extra: {
      ...(config.extra || {}),
      apiBaseUrl: process.env.API_BASE_URL,
    },
  };
};
