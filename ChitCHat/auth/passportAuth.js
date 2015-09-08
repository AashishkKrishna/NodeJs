module.exports = function(passport,Facebookstrategy,config,mongoose){
	
	var chatUser = new mongoose.Schema({
		profileID : String,
		fullname : String,
		profilePic : String
	})
	
	var userModel = mongoose.model('chatUser',chatUser);
	
	passport.serializeUser(function(user,done){
		done(null,user.id);
	});
	
	passport.deserializeUser(function(id,done){
		userModel.findById(id,function(err,user){
			done(err,user);	
		})
	})
	
	passport.use(new Facebookstrategy({
		clientID : config.fb.appID,
		clientSecret : config.fb.appSecret,
		callbackURL : config.fb.callbackURL,
		profileFields : ['id','displayName','photos']
	},function(acessToken,refreshToken,profile,done){
		// Check if the user exists in our MongoDB, 
		//if not then create one and return profile
		// if exists then simply return the profile
		
		userModel.findOne({'profileID' : profile.id}, function(result,err){
			if(result){
				done(null,result);
			}
			else {
				//Create new user
				var newchatuser = new userModel({
					profileID : profile.id,
					fullname : profile.displayName,
					profilePic : profile.photos[0].value || ''
				});
				
				newchatuser.save(function(err){
					done(null,newchatuser);
				})
			}
		})
	}))
}