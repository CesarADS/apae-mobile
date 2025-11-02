import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Permite conexões de qualquer IP
    port: 5173, // A porta que você já configurou
    strictPort: true,
    allowedHosts: [
      'gedapae.com.br',
      'www.gedapae.com.br',
      '15.229.148.78' // Também é uma boa prática manter o IP público
    ]
  }
})
