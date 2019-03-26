class Promise {
  constructor (executor) {
    let self = this;
    this.status = 'pending';
    this.resolveValue = undefined;
    this.rejectValue = undefined;
    this.resolveCallbacks= [];
    this.rejectCallbacks = [];

    function resolve(val) {
      if (value instanceof Promise) {
        return value.then(resolve,reject)
      }
      if (self.status === 'pending') {
        self.status = 'fulfilled';
        self.resolveValue = val;
        self.resolveCallbacks.forEach(fn => fn()));
      }
    }
    function reject(err) {
      if (self.status === 'pending') {
        self.status = 'rejected';
        self.rejectValue = err;
        self.rejectCallbacks.forEach(fn => fn()));
      }
    }

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  static resolve(value) {
    return new Promise((resolve,reject)=>{
      resolve(value);
    })
  }
  static reject(reason) {
    return new Promise((resolve,reject)=>{
      reject(reason);
    })
  }

  then(onFulfilled, onRejected) {
    // 参数的可选
    onFulfilled = typeof onFulfilled ==='function' ? onFulfilled : val=>val;
    onRejected = typeof onRejected == 'function'? onRejected :err=>{throw err}
    let self = this;

    let promise2 = new Promise(function(resolve, reject) {
      if (self.status === 'fulfilled') {
        setTimeout(() => {
          try {
              let returnVal = onFulfilled(self.resolveValue);
              resolvePromise(promise2, returnVal, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      if (self.status === 'rejected') {
        setTimeout(() => {
          try {
            let returnVal = onRejected(self.rejectValue);
            resolvePromise(promise2, returnVal, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      if (self.status === 'pending') {
        this.resolveCallbacks.push(function () {
          setTimeout(() => {
            try {
              let returnVal = onFulfilled(self.resolveValue);
              resolvePromise(promise2, returnVal, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        })
        this.rejectCallbacks.push(function () {
          setTimeout(() => {
            try {
              let returnVal = onRejected(self.rejectValue);
              resolvePromise(promise2, returnVal, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        })
      }
    })
    return promise2;
  }

  catch(errCallback) {
    return this.then(null, errCallback)
  }

  finally (cb) {
    // console.log('重写finally');
    return this.then(
      val => Promise.resolve(cb()).then(() => val),
      err => Promise.resolve(cb()).then(() => { throw new Error(); })
    );
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) { // 防止返回的promise 和 then方法返回的promise 是同一个
    return reject(new TypeError('循环引用'));
  }
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    let called;
    try {
      let then = x.then;
      if (typeof then === 'function') { 
        then.call(x, y => {
          if(called) return
          called = true;
          resolvePromise(promise2, y, resolve, reject)
        }, r=>{
          if (called) return // 防止调用失败 又调用成功
          called = true;
          reject(r);
        });
      } else {
        resolve(x);
      }
    } catch (error) {
      reject(error);
    }
  } else {
    resolve(x);
  }
}