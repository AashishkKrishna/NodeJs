var http = require('http'),
	host = 'localhost',
	port = '9000';

var server = http.createServer(function (request, response) {
	response.writeHead(200, { 'Content-Type' : 'text/html' }); // set content header
	response.end('<h1>Hello world</h1>');
}).listen(port, host, function () {
	console.log('Server listening on http:// ' + host + ':' + port);
})
