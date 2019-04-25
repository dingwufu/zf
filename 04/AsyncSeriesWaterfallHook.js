class AsyncSeriesWaterfallHook {
    constructor(arr) {
        if(!arr || arr.length < 1) throw Error('Waterfall hooks must have at least one argument');
        this.args = arr;
        this.tasks = [];
    }

    tapPromise(...args) {
        let task = args.pop();
        this.tasks.push(task);
    }
    promise(...args) {
        args = args.slice(0, this.args.length);
        let firstFn = this.tasks.shift();
        return this.tasks.reduce((prev, cur) => {
            return prev.then(data => cur(data)).catch(err => {throw err});
        }, firstFn(...args));
    }
    tapAsync(...args) {
        let task = args.pop();
        this.tasks.push(task);
    }
    callAsync(...args) {
        let cb = args[args.length - 1];
        let firstFn = this.tasks.shift();
        let len = this.args.length + 1; // 参数长度
        let cbTask = this.tasks.slice(0, len - 2); // 可用的回调函数
        let params = [];

        for (let i = 0; i < len; i++) {
            if ( i < 2) {
                params[i] = args[i];
                continue;
            }
            if (i >= len - cbTask.length) {
                params[i] = () => { // 闭包后存参数
                    return cbTask[i - len + cbTask.length](...params);
                }
                continue;
            }
            params[i] = undefined;
        }
        firstFn(...params);
    }
}

module.exports = AsyncSeriesWaterfallHook;