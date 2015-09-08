module.exports = function(io,rooms){
	
	var chatrooms = io.of('/roomlist').on('connection',function(socket){
		console.log('Connection established to server');
		
		socket.emit('roomupdate',JSON.stringify(rooms));
		
		socket.on('newroom',function(data){
			rooms.push(data);
			socket.broadcast.emit('roomupdate',JSON.stringify(rooms));
			socket.emit('roomupdate',JSON.stringify(rooms));
		})
	})
	
	var messages  = io.of('/messages').on('connection',function(socket){
		console.log('connected to chat room');
		
		socket.on('joinroom',function(data){
			socket.username = data.user;
			socket.userpic = data.userpic;
			socket.join(data.room);
			updateUserlist(data.room,true);
		})
		
		socket.on('newmessage',function(data){
			socket.broadcast.to(data.room_number).emit('messagefeed',JSON.stringify(data));
		})
		
		function updateUserlist(room,updateAll){
			var getUsers = io.of('/messages').clients(room);
			var userlist = [];
			for(var i in getUsers){
				userlist.push({user:getUsers[i].username, userpic : getUsers[i].userpic});
			}
			socket.to(room).emit('updateUserslist',JSON.stringify(userlist));
			 if(updateAll){
			 	socket.broadcast.to(room).emit('updateUserslist',JSON.stringify(userlist));
			 }
		}
		socket.on('updateList',function(data){
			updateUserlist(data.room);
		})
	})
}