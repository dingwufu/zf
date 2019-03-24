Promise.prototype.finally = function (cb) {
  console.log('finally');
  return this.then(
    val => Promise.resolve(cb()).then(() => val),
    err => Promise.resolve(cb()).then(() => { throw new Error(); })
  );
}
let p = new Promise((reslove, reject) => {
  reject(1);
});
p.then().finally(() => {
  console.log('调用finally');
}).then(data => {
  console.log('success: ' + data);
}).catch(err => {
  console.log('fail: ' + err);
})