////// <reference path="./typings/node/node.d.ts" />

var qrimage = require('qr-image');
var fs = require('fs');

qrimage
	.image("http://www/nodejs.org",{type:'png',size:5})
	.pipe(fs.createWriteStream('myQrCode.png'));
