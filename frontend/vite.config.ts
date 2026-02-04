import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
// import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vite.dev/config/
export default defineConfig({
  // plugins: [react(), tailwindcss(), basicSsl()],
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0', // Aceita conexões de qualquer IP na rede local
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
