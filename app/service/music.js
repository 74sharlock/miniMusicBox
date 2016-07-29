const http = require('http');

let route = {
    'search' (query){
        return `http://music.163.com/api/search/pc?s=${encodeURIComponent(query.s)}&offset=${query.offset || 1}&limit=${query.limit || 15}&type=${query.type || 1}`;
    },
    'song' (query){
        return `http://music.163.com/api/song/detail/?id=${query['songId']}&ids=%5B${query['songId']}%5D`;
    },
    'lyric' (query){
        return `http://music.163.com/api/song/lyric?os=pc&id=${query.id}&lv=-1&kv=-1&tv=-1`;
    }
};

let core = function (method, query) {
    return new Promise (function (resolve, reject) {
        let body = '';
        /*let clientIp = request.headers['x-forwarded-for'] || request.connection.remoteAddress || request.socket.remoteAddress || request.connection.socket.remoteAddress;*/
        let req = http.request({
            hostname: 'music.163.com',
            port: 80,
            path: route[method](query),
            method: 'POST',
            headers: {
                'Accept-Encoding': 'identity;q=1, *;q=0',
                'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6',
                'Cache-Control': 'no-cache',
                'Content-type':'application/x-www-form-urlencoded; charset=UTF-8',
                'Connection': 'keep-alive',
                'Host': 'music.163.com',
                'Pragma': 'no-cache',
                'Range': 'bytes=0-',
                'Referer': 'http://music.163.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36'
            }
        }, function(res) {
            res.on('data', function(chuck) {
                return body += chuck;
            });
            res.on('end', function() {
                resolve(JSON.parse(body));
            });
            res.on('error', function (err) {
                reject(err);
            });
        });
        req.end();
    });
};

module.exports = {
    search(query){
        return core('search', query);
    },
    getSong(query){
        return core('song', query);
    },
    getLyric(query){
        return core('lyric', query);
    }
};

