
let { wideDir, depthDirPromise } = require('./dir');
depthDirPromise('a').then(dirs => {
    console.log('深度Promise', dirs);
})
wideDir('a', (err, dirs) => {
    console.log('广度异步', dirs);
})