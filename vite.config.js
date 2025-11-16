import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',            // IMPORTANT : chemins relatifs pour Electron
  build: {
    outDir: 'dist'
  }
});
