const express   = require('express');
const app 		= express();
const http 		= require('http').Server(app);
const io 		= require('socket.io')(http);
const cors 		= require('cors');

const port 		= process.env.PORT || 3000;

app.use(cors());

let clients = 0;

io.on('connection', function(socket){
	console.log('New Socket Connected with =>'+ socket.id);
	socket.join('webnzasupport');

	socket.on('keepMeActive', function(data){
		if(data.member && data.email && data.username){
			let newuser = {
				"username": data.username,
				"email": data.email,
				"member": data.member,
				"status": "Online"
			};

			socket.broadcast.emit('onKeepMeActive', newuser);
		}
	});

	socket.on('chatMessage', function(data){
		if(data.roomName === 'webnzasupport'){
			socket.broadcast.emit('onChatMessage', data);
		} else {
			let secret = 'xYz';
			data.roomName = 'user'+ (data.senderID * data.receiverID) + secret;
			socket.to(data.roomName).emit('onChatMessage', data);
		}
	});

	socket.on('updateTyping', function(data){
		if(data.roomName === 'webnzasupport'){
			socket.broadcast.emit('onUpdateTyping', data);
		} else {
			let secret = 'xYz';
			data.roomName = 'user'+ (data.senderID * data.receiverID) + secret;
			socket.to(data.roomName).emit('onUpdateTyping', data);
		}
	});

	socket.on('joinRoom', function(data){
		let secret = 'xYz';
		let roomName = 'user'+ (data.senderID * data.receiverID) + secret;
		socket.join(roomName);
	});

	socket.on('newClient', function(){
		console.log("New Client added to video chat");
		if(clients < 2) {
			if(clients == 1){
				console.log("Video chat started");
				this.emit('createPeer')
			}
		} else {
			console.log("Session already active");
			this.emit('sessionActive')
		}
		clients++;
		console.log("Total clients =>"+ clients);
	});

	socket.on('offer', function(){
		console.log("Call to offer");
		this.broadcast.emit('backOffer', offer);
	});

	socket.on('answer', function(data){
		console.log("call to answer");
		this.broadcast.emit('backAnswer', data);
	});

	socket.on('disconnect', function(reason){
		console.log("A use has been disconnected "+ reason);
		clients--;
	});
});

http.listen(port, () => console.log(`Active on ${port} port`));