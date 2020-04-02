const express   = require('express');
const app 		= express();
const http 		= require('http').Server(app);
const io 		= require('socket.io')(http);
const cors 		= require('cors');

const port 		= process.env.PORT || 3000;

app.use(cors());

let clients = 0;

let onlineUsers = [];

io.on('connection', function(socket){
	console.log('New Socket Connected with =>'+ socket.id);
	socket.join('webnzasupport');

	socket.on('keepMeActive', function(data){
		if(data.member && data.email && data.username){
			let newuser = {
				"username": data.username,
				"email": data.email,
				"member": data.member,
				"status": "Online",
				"currentSocket": socket.id
			};
			onlineUsers[newuser.member] = newuser;
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
		this.emit('createPeer')
	});

	socket.on('offer', function(offer){
		console.log("Call to offer");
		let secret = 'xYz';
		let roomName = 'user'+ (offer.senderID * offer.receiverID) + secret;
		this.to(roomName).emit('backOffer', offer);
	});

	socket.on('answer', function(data){
		console.log("call to answer");
		let secret = 'xYz';
		let roomName = 'user'+ (data.senderID * data.receiverID) + secret;
		this.to(roomName).emit('backAnswer', data.data);
	});

	socket.on('disconnect', function(reason){
		console.log("A use has been disconnected =>"+ reason);
	});

	socket.on('newAudioClient', function(){
		console.log("New Client added to audio chat");
		if(clients < 2) {
			if(clients == 1){
				console.log("Audio chat started");
				this.emit('createAudioPeer')
			}
		} else {
			console.log("Session already active");
			this.emit('sessionAudioActive')
		}
		clients++;
		console.log("Total clients =>"+ clients);
	});

	socket.on('offerAudio', function(offer){
		console.log("Call to offerAudio");
		this.broadcast.emit('backAudioOffer', offer);
	});

	socket.on('answerAudio', function(data){
		console.log("call to answerAudio");
		this.broadcast.emit('backAudioAnswer', data);
	});
});

http.listen(port, () => console.log(`Active on ${port} port`));