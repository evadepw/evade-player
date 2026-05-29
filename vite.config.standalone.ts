import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'path';

export default defineConfig({
    plugins: [
        react(),
    ],
    publicDir: false,
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
    },
    build: {
        emptyOutDir: false,
        lib: {
            entry: resolve(__dirname, 'src/standalone.ts'),
            name: 'EvadePlayer',
            formats: ['iife', 'es'],
            fileName: (format) => `evade-player.${format === 'es' ? 'mjs' : 'js'}`,
        },
        rollupOptions: {
            output: {
                assetFileNames: 'evade-player.[ext]',
            },
        },
    },
});
