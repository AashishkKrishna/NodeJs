module.exports = function(express,app,formidable,fs,os,gm,knoxClient,mongoose,io){
	
	var Socket;
	
	io.on('connection',function(socket){
			Socket = socket;
	})	
	
	var singleImage = new mongoose.Schema({
		filename : String,
		votes : Number
	})
	
	var singleImageModel = mongoose.model('singleImage',singleImage);
		
	var router = express.Router();
	
	router.get('/',function(req,res,next){
		res.render('index',{host: app.get('host')});
	})
	
	router.post('/upload',function(req,res,next){
		// File upload 1
		
		function generatefilename(filename){
			var ext_regex = /(?:\.([^.]+))?$/;
			var ext = ext_regex.exec(filename)[1];
			var date = new Date().getTime();
			var charBank = "abcdefghijklmopqrstuvwxyz";
			var fstring = '';
			for(var i =0; i<15;i++){
				fstring += charBank[parseInt(Math.random() * 26)];
			}
			return (fstring += date + '.' + ext);
		}
		
		
		var tempfile, nfile,fname;
		var newForm = new formidable.IncomingForm();
			newForm.keepExtensions = true;
			newForm.parse(req,function(err,fields,files){
				tempfile = files.upload.path;
				fname = generatefilename(files.upload.name);
				nfile = os.tmpDir() + '/' + fname;
				res.write(200,{'Content-type' : 'text/plain'});
				res.end();
			})
			newForm.on('end',function(){
				fs.rename(tempfile,nfile,function(){
					//Resize the image	and upload this file to S3 bucket
					gm(nfile).resize(300).write(nfile,function(){
						//upload the file to server
						fs.readFile(nfile,function(err,buffer){
							var req = knoxClient.put(fname,{
								'Content-Length' : buffer.length,
								'Content-type' : 'image/jpeg'
							})
							req.on('response',function(res){
								if(res.statusCode === 200){
									//This means the file is in S3 bucket
									var newImage  = new singleImageModel({
										filename : fname,
										votes : 0
									}).save();
									Socket.emit('status', {'msg' : 'Saved !!', 'delay' : 3000})
									Socket.emit('doUpdate', {});
									
									//Delete the local file
									fs.unlink(nfile,function(){
										console.log('Local file deleted !!');
									})
								}
							})
							req.end(buffer);
						})
					})
					
				})
			})
	})
	app.use('/',router);
}