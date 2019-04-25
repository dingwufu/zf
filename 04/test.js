let AsyncSeriesWaterfallHook = require('./AsyncSeriesWaterfallHook');
// let {AsyncSeriesWaterfallHook} = require('tapable');

let hook = new AsyncSeriesWaterfallHook(['name', 'a1', 'b2']);
// hook.tapPromise('吃饭', function () {
//     console.log(arguments);
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             console.log(1);
//             reject('hello');
//         }, 1000);
//     })
// });
// hook.tapPromise('吃饭', function (a) {
//     console.log(a);
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             console.log(2);
//             resolve('hello');
//         }, 1000);
//     })
// })
// hook.promise(1, 2, 3).then(r => {
//     console.log(r);
// })

hook.tapAsync('吃饭',function(data, cb, cb2, cb3){ 
    console.log(arguments)
    setTimeout(() => {
         console.log('1');
         cb3();
    }, 2000);
 }); 
 hook.tapAsync('睡觉',function(data, cb, cb2){
     console.log(arguments);
     setTimeout(() => {
         console.log('2')
         cb(99)
     }, 1000);
 }); 
 hook.callAsync(9, function(data){ // promise.all
     console.log('ok', data);
 }); // 异步调用