import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: '/evade-player/',
    plugins: [react()],
    build: {
        outDir: 'dist-pages',
    },
});
