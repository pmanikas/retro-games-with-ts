const liveServer = require('live-server');

const params = {
    port: 8181,
    host: '0.0.0.0',
    root: './games',
    open: true,
    file: 'index.html',
    wait: 1000,
    logLevel: 2,
};

liveServer.start(params);
