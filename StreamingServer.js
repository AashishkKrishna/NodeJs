////// <reference path="./typings/node/node.d.ts" />

var http = require('http'),
	fs = require('fs'),
	path = require('path'),
	port = '9000',
	host = 'localhost';

var mimes = {
	".html" : "text/html",
	".css" : "text/css",
	".js" : "text/javascript",
	".gif": "text/gif",
	".jpg" : "text/jpg",
	".png" : "text/png"
};

var server = http.createServer(function (request, response) {
	var filepath = (request.url === '/') ? ('./htmlfiles/index.html') : ('.' + request.url);
	var contenttype = mimes[path.extname(filepath)];
	fs.exists(filepath, function (file_exists) {
		if (file_exists) {
			response.writeHead(200,{'Content-Type': contenttype});
			var streamfile = fs.createReadStream(filepath).pipe(response);
			
			streamfile.on('error',function(){
				response.writeHead(500);
				response.end();
			});
		}
		else {
			response.writeHead(404);
			response.end('Sorry we couldnt find your file');
		}
	});

}).listen(port, host, function () {
	console.log('Server listening on http://' + host + ':' + port);
})