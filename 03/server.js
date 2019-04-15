// 第三周作业:
// http-server 缓存  206 + gzip压缩 + 如果是文件 标识文件图标 文件夹 文件夹图标标  + 提交到npm包上 代码发到github上 
let http = require('http');
let fs = require('mz/fs');
let path = require('path');
let url = require('url');
let mime = require('mime');
let chalk = require('chalk');
let ejs = require('ejs');
let zlib = require('zlib');

let template = fs.readFileSync(path.resolve(__dirname, 'source/template.html'), 'utf8');
class Server {
    constructor(config) {
        this.port = config.port;
        this.host = config.host;
        this.dir = config.dir;
        this.template = template;
    }
    async handleRequest(req, res) {
        let { pathname } = url.parse(req.url);
        let absPath = path.join(this.dir, pathname);  // 若resolve pathname 如果有/ 会直接取根路径
        try {
            let statObj = await fs.stat(absPath);
            if (statObj.isDirectory()) {
                let dirs = await fs.readdir(absPath);
                let renderDirs = [];
                for (let index = 0; index < dirs.length; index++) {
                    const dir = dirs[index];
                    let dirname = path.join(pathname, dir);
                    let stats = await fs.stat(path.join(this.dir, dirname));

                    renderDirs.push({
                        href: dirname,
                        dirname: dir,
                        isFile: !stats.isDirectory()
                    });
                }
                let html = ejs.render(this.template, { arr: renderDirs });
                res.setHeader('Content-Type', 'text/html;charset=utf8');
                res.end(html);
            } else {
                this.sendFile(req, res, statObj, absPath);
            }
        } catch (error) {
            console.log(error)
            this.emitError(req, res, absPath, error);
        }
    }
    cache(req, res, statObj, absPath) {
        // 缓存： 强制缓存   对比缓存 -- 更新时间 | 摘要
        const lastModified = statObj.ctime.toUTCString();
        const etag = statObj.size + '';
        const modifiedSince = req.headers['if-modified-since'];
        const noneMatch = req.headers['if-none-match'];

        res.setHeader('Cache-Control', 'max-age=5');
        res.setHeader('Last-Modified', lastModified);
        res.setHeader('etag', etag);
        if(lastModified !== modifiedSince) return false;
        if(etag !== noneMatch) return false;
        return true;
    }
    sendFile(req, res, statObj, absPath) {
        if(this.cache(req, res, statObj, absPath)) {
            res.statusCode = 304;
            return res.end();
        }
        
        res.setHeader('Content-Type', mime.getType(absPath) + ';charset=utf8');
        let rs = this.rangeStream(req, res, statObj, absPath);
        rs = this.zlibStream(req, res, absPath, rs);
        rs.pipe(res);
    }
    rangeStream(req, res, statObj, absPath) {
        let total = statObj.size
        let range = req.headers['range'];

        if(range){
            let [,start,end] = range.match(/(\d*)-(\d*)/);
            start = start ? Number(start) : 0;
            end = end ? end : total;

            res.statusCode = 206;
            res.setHeader('Content-Range',`bytes ${start}-${end}/${total}`);
            // 返回部分数据
            return fs.createReadStream(absPath,{start,end:end-1});
        }
        return fs.createReadStream(absPath);
    }
    zlibStream(req, res, absPath, rs) {
        let encoding = req.headers['accept-encoding'];
        if (encoding) {
            if (encoding.indexOf('gzip') !== -1) {
                res.setHeader('Content-Encoding', 'gzip');
                return rs.pipe(zlib.createGzip());
            }
            if (encoding.indexOf('deflate') !== -1) {
                res.setHeader('Content-Encoding', 'deflate');
                return rs.pipe(zlib.createDeflate());
            }
        }
        return rs.pipe(res);
    }
    emitError(req, res, absPath, error) {
        res.statusCode = 404;
        res.end('Not Found');
    }
    start() {
        let server = http.createServer(this.handleRequest.bind(this));
        server.listen(this.port, this.host, () => {
            console.log(chalk.yellow(`Starting up d-http-server, serving ${this.dir} \r\nAvailable on\r\n`));
            console.log(chalk.green(` http://${this.host}:${this.port}`));
        })
    }
}

module.exports = Server