var express = require('express'),
	path = require('path'),
	config = require('./config/config.js'),
	knox = require('knox'),
	fs = require('fs'),
	os = require('os'),
	formidable = require('formidable'),
	gm = require('gm'),
	mongoose = require('mongoose').connect(config.dbURL)
	
var app = express();
app.set('views',path.join(__dirname,'views'));
app.engine('html',require('hogan-express'));
app.set('view engine','html');

app.use(express.static(path.join(__dirname,'')));
app.set('port',process.env.PORT || 3000);
app.set('host',config.host);

var knoxClient = knox.createClient({
	key : config.S3Accesskey,
	secret: config.S3Secretkey ,
	bucket : config.S3Bucket
})

var server = require('http').createServer(app);
var io = require('socket.io')(server);

require('./routes/routes.js')(express,app,formidable,fs,os,gm,knox,mongoose,io);

server.listen(app.get('port'),function(){
	console.log("Photogrid running on port:- "+ app.get('port'));
})