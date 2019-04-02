let Promise = require('./01')
let p = new Promise((resolve,reject)=>{
    resolve(1000)
});
// 值的穿透
// p.then().then().then().then((data)=>{
//     console.log(data);
// },function(err){
//     console.log(err,'----');
// })

// 递归调用
// let promise2 = p.then(()=>{
//     return new Promise((resolve,reject)=>{
//        setTimeout(()=>{
//             resolve(new Promise((resolve,reject)=>{
//                 setTimeout(()=>{
//                     resolve(new Promise((resolve,reject)=>{
//                        setTimeout(()=>{
//                             resolve(20000)
//                        },2000)
//                     }))
//                 },1000)
//             }))
//        },1000)
//     })
// },err=>{
//     console.log(err);
// })
// promise2.then(data=>{
//     console.log(data);
// })

// finally
p.finally(() => {
    console.log('finally')
}).then(data => {
    console.log(data);
})