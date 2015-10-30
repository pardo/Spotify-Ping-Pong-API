var fs = require('fs');
var http = require('http');
var pongWorker = require('./pongWorker.js');
var config = require('./config');

var pingSchema = /^\d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+$/;

var api = http.createServer();
api.on('request', function (req, res) {
    var encodedPing = req.url.substr(1);
    var ping = encodedPing.replace(/-/g, ' ');
    
    res.setHeader('Content-type', 'application/json');

    if (!pingSchema.test(ping)) {
        res.end('{"status":201}');
        return;
    }


    pongWorker.process(ping, function (err, pong) {
        if (err) {
            res.end('{"status":' + err + '}');
            return;
        }

        var encodedPong = pong.replace(/ /g, '-');

        res.end('{"status":100,"ping":"' + encodedPing + '","pong":"' + encodedPong + '"}');
    });
});
api.listen(config.apiPort, '127.0.0.1');


var browser = http.createServer();
browser.on('request', function (req, res) {
    switch (req.url) {
        case '/worker.html':
            fs.readFile('./worker.html', 'utf8', function (err, data) {
                res.end(data.replace('WEBSOCKETPORT', config.wsPort));
            });
            break;
        case '/player.swf':
            fs.createReadStream('./player.swf').pipe(res);
            break;
        default:
            res.writeHead(404);
            res.end('404 - ' + http.STATUS_CODES[404]);
            break;
    }
});
browser.listen(config.serverPort, '127.0.0.1');
console.log('Open -', 'http://localhost:'+config.serverPort+'/worker.html');