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
                target: 'http://way-test.dev.tedo.ru',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
});
