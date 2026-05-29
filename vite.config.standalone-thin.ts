import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'path';

export default defineConfig({
    plugins: [
        react({
            jsxRuntime: 'classic',
        }),
    ],
    publicDir: false,
    build: {
        emptyOutDir: false,
        lib: {
            entry: resolve(__dirname, 'src/standalone.ts'),
            name: 'EvadePlayer',
            formats: ['iife', 'es'],
            fileName: (format) => `evade-player.thin.${format === 'es' ? 'mjs' : 'js'}`,
        },
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'react-dom/client',
                'react/jsx-runtime',
            ],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react-dom/client': 'ReactDOM',
                    'react/jsx-runtime': 'React',
                },
                assetFileNames: 'evade-player.[ext]',
            },
        },
    },
});
