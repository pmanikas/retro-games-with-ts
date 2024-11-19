import { defineConfig } from 'vite';
import path, { dirname } from 'path';

export default defineConfig({
    plugins: [

    ],
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
        outDir: path.resolve(dirname(''), `dist/games/${__dirname.split('/').reverse()[0]}`),
        assetsDir: '',
    },
});
