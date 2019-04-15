let path = '/username/:xid/s/:xname';
let params = [];
path = path.replace(/:([^\/]+)/g, function () {
    params.push(arguments[1]);
    return '([^\/]+)';
});
console.log(params, path);