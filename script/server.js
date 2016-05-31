import fs from 'fs';
import url from 'url';
import http from 'http';
import path from 'path';
import mime from './mime';
import music from './music';
import queryString from 'querystring';

let root = path.resolve(process.argv[2] || '.');

export default () => {

    let httpServer = http.createServer((req, res)=>{
        let source = url.parse(req.url),
            pathName = source.pathname,
            filePath = path.join(root, '/public' + pathName),
            ext = path.extname(pathName) ? path.extname(pathName).slice(1) : 'txt',
            contentType = mime[ext],
            clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

        if(pathName.indexOf('/music') === 0){

            let postdata = "";
            req.on("data",function(postchunk){
                postdata += postchunk;
            });

            //POST结束输出结果
            req.on("end",function(){
                music(pathName, queryString.parse(postdata), res, req);
            });
        } else {
            fs.stat(filePath, function (err, stats) {
                if (!err && stats.isFile()) {
                    // 没有出错并且文件存在:
                    console.log(`200 [GET] [${clientIp.replace('::ffff:', '')}]: ${req.url}`);
                    // 发送200响应:
                    res.writeHead(200, {'content-type': contentType});
                    // 将文件流导向response:
                    fs.createReadStream(filePath).pipe(res);
                } else {
                    // 出错了或者文件不存在:
                    console.log(`404 [GET] [${clientIp.replace('::ffff:', '')}]: ${req.url}`);
                    // 发送404响应:
                    res.writeHead(404, {'content-type': 'text/html'});
                    //fs.createReadStream(path.join(root, '/static/target/404.html')).pipe(res);
                    res.end('<h1>404 not found!</h1>')
                }
            });
        }
    });

    httpServer.listen(7878);
    console.log(`Server is running at http://localhost:7878/`);
};
