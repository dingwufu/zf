// 实现广度优先异步方法 和深度优先 promise版
let fs = require('fs');
let path = require('path');

function wideDir(dir, callback) {
    let arr = [ dir ];

    function next(index) {
        if (index === arr.length) return callback(undefined, arr);
        let dirPath = path.join(__dirname, arr[index]);
        fs.stat(dirPath, (err, stats) => {
            if (err) return callback(err);

            if (stats.isDirectory()) {
                fs.readdir(dirPath, (err, files) => {
                    if (err) return callback(err);

                    let absFiles = files.map(file => path.join(arr[index], file));
                    arr = [...arr, ...absFiles];
                    next(index + 1);
                })
            } else {
                next(index + 1);
            }
        })
    }
    next(0);
}

function depthDirPromise(dir, arr = []) {
    return new Promise((resolve, reject) => {
        let absPath = path.join(__dirname, dir);
        fs.stat(absPath, (err, stats) => {
            if (err) return reject(err);
            
            if (stats.isDirectory()) {
                fs.readdir(absPath, (err, files) => {
                    if (err) return reject(err);
                    let absFiles = files.map(file => path.join(dir, file));

                    function next(index) {
                        if(index === absFiles.length) {
                            arr.push(dir);
                            return resolve(arr);
                        }

                        depthDirPromise(absFiles[index], arr).then(dir => {
                            next(index + 1);
                        }).catch(reject);
                    }
                    next(0);
                })
            } else {
                arr.push(dir);
                resolve(arr);
            }
        });
    });
}

module.exports = {
    wideDir,
    depthDirPromise
}