import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'build',
    },
    server: {
        proxy: {
            // Прокси для обхода CORS в разработке
            '/api': {
                target: 'https://firestore.googleapis.com/v1/projects/tg-memory-game/databases/(default)/documents',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
});
