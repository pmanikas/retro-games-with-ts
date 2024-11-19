import { defineConfig } from 'vite';
import path, { dirname } from 'path';

export default defineConfig({
    plugins: [],
    resolve: {
        alias: {},
    },
    server: {
        port: 1575,
        open: true,
        cors: true,
    },
    build: {
        copyPublicDir: true,
        base: path.resolve(dirname(''), 'dist/games'),
        outDir: path.resolve('', `dist/games/${__dirname.split('/').pop()}`),
        assetsDir: '',
    },
});
