var express = require('express');
var app = 	express();
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var config = require('./config/config.js' );
var ConnectMongo = require('connect-mongo')(session);
var mongoose = require('mongoose').connect(config.dbURL);
var passport = require('passport');
var Facebookstrategy = require('passport-facebook').Strategy;
var rooms = [];



app.set('views',path.join(__dirname,'Views'))
app.engine('html',require('hogan-express'));
app.set('view engine','html');
app.use(express.static(path.join(__dirname)));
app.use(cookieParser());
//app.use(session({secret : 'catscanfly'}));

var env = process.env.NODE_ENV || 'development';

if(env==='development'){
	// dev specific setting
	app.use(session({secret : config.sessionSecret}))
}
else
{
	// prod specific setting
	app.use(session({
			secret : config.sessionSecret,
			store : new ConnectMongo({
				//	url : config.dbURL,   // disabled because mongoose and mongo creates different connection
					mongoose_connection : mongoose.connections[0],
					stringify : true
				})
		}))
}

//test the mongoose for connection
//  var userSchema = mongoose.Schema({
// 	 username : String,
// 	 password : String,
// 	 fullname : String
//  })
// 
// var Person = mongoose.model('users',userSchema);
// 
// var John = new Person({
// 	username : "Aashish",
// 	password: "AashishPassword",
// 	fullname : "AashishK"
// });
// 
// John.save(function(err){
// 	console.log("done");
// })
////////////////////////////////////

app.use(passport.initialize());
app.use(passport.session());

require('./routes/routes.js')(express,app,passport,config,rooms);
require('./auth/passportAuth.js')(passport,Facebookstrategy,config,mongoose); 

// app.route('/').get(function(req,res,next){
// 	//res.send('<h1>Hello World</h1>');
// 	res.render("index",{'title':'Welcome to ChatCat'});
// })

// app.listen(3000,function(){
// 	console.log('Chatcat woking on port 3000');
// 	console.log('Mode :- ' + env);
// })

app.set('port',process.env.PORT || 3000);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

require('./socket/socket.js')(io,rooms);
server.listen(app.get('port'),function(){
	console.log('Chatcat on port:- ' + app.get('port'));
})

 