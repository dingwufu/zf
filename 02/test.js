let req = require('./req');

let js = req('./source/03');
let js2 = req('./source/03.js');
let json = req('./source/02.json');
let json2 = req('./source/02');
console.log(js, js2, json, json2);

let { wideDir, depthDirPromise } = require('./dir');
depthDirPromise('a').then(dirs => {
    console.log('深度Promise', dirs);
})
wideDir('a', (err, dirs) => {
    console.log('广度异步', dirs);
})