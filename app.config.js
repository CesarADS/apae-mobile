import 'dotenv/config';

export default ({ config }) => {
  // Usar variável de ambiente ou valor padrão de produção
  const apiBaseUrl = process.env.API_BASE_URL || 'https://gedapae.com.br/api';
  
  return {
    ...config,
    extra: {
      ...(config.extra || {}),
      apiBaseUrl,
    },
  };
};
