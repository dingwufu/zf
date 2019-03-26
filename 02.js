let path  = require('path');
let fs = require('fs');
let vm = require('vm');
class Module {
  static wrapper = [
    '(function(exports,module,require,__dirname,__filename){'
    ,
    '})'
  ];
  static _cache = [];
  static _extensions = {
    '.js'(module){
      let str = fs.readFileSync(module.id,'utf8');
      // 给读取到的内容 增加了个函数
      let scriptStr =  Module.wrapper[0] + str +  Module.wrapper[1];
      let fn = vm.runInThisContext(scriptStr);
      // 把函数执行 将exports属性传递给 sum.js
      // exports 是module.exports 别名
      fn.call(module.exports,module.exports,module,req);
    },
    // json处理的时候把exports对象添上 处理js的时候 让用户自己把结果放上去
    '.json'(module){
      let str = fs.readFileSync(module.id,'utf8');
      try {
        str = JSON.parse(str);
        module.exports = str; // 把最终的结果放到exports对象上 require方法会自动把结果返回回去
      } catch (error) {
        throw error;
      }
    }
  }

  constructor(id) {
    this.id = id;
    this.exports = {}
  }
  load() {
    // this : id , exports
    let extname = path.extname(this.id) || '.js';
    if (!Module._extensions[extname]) extname = '.js';
    try {
      Module._extensions[extname](this);
    } catch (error) {
      Module._extensions['.json'](this);
    }
  }
}

function req(id){
  // 解析出一个绝对路径
  let absPath = path.resolve(__dirname,id);
  if (Module._cache[absPath]) {
    return Module._cache[absPath].exports;
  }
  let module = new Module(absPath);
  Module._cache[absPath] = module;
  module.load();
  return module.exports;
}