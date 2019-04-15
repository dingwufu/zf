#! /usr/bin/env node
// 需npm link

let program = require('commander');
let json = require('../package.json');
let config = {
    port: 3000,
    host: '127.0.0.1',
    dir: process.cwd() // 当前执行node命令时候的文件夹地址
};

program
    .version(json.version)
    .option('-p, --port <n>', 'set d-http-server port')
    .option('-o, --host <n>', 'set d-http-server host')
    .option('-d, --dir <n>', 'set d-http-server directory')
    .on('--help', function () {
        console.log('Examples:');
        console.log('  $ d-http-server --port --host')
    })
    .parse(process.argv);

config = {...config, ...program};

let Server = require('../server.js');
let server = new Server(config);
server.start();