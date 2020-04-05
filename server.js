const express   = require('express');
const app 		= express();
const http 		= require('http').Server(app);
const io 		= require('socket.io')(http);
const cors 		= require('cors');

const port 		= process.env.PORT || 3000;

app.use(cors());

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
				"status": '1',
				"currentSocket": socket.id,
				"callStatus": false
			};
			onlineUsers["MEMBER-"+ newuser.member] = newuser;
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

	socket.on('newVideoClient', function(){

		this.emit('createVideoPeer');
	});

	socket.on('offerVideoCall', function(offer){
		let secret = 'xYz';
		let roomName = 'user'+ (offer.senderID * offer.receiverID) + secret;
		let opponentData = onlineUsers["MEMBER-"+ offer.receiverID];
		offer.opponentStatus = 1;
		if(opponentData && opponentData.member && opponentData.member == offer.receiverID){
			if(io.sockets.adapter.rooms[roomName]){
				if(io.sockets.adapter.rooms[roomName].sockets[opponentData.currentSocket]){
					this.to(roomName).emit('backOfferVideoCall', offer);
				} else {
					offer.opponentStatus = 2;
					io.to(opponentData.currentSocket).emit('backOfferVideoCall', offer);
				}
			}
		} else {
			offer.opponentStatus = 0;
			this.emit('backOfferVideoCall', offer);
		}
	});

	socket.on('answerVideoCall', function(data){
		let secret = 'xYz';
		let roomName = 'user'+ (data.senderID * data.receiverID) + secret;
		this.to(roomName).emit('backAnswerVideoCall', data.data);
	});

	socket.on('leaveVideoCall', function(data){
		console.log("call to leaveVideoCall");
		let secret = 'xYz';
		let roomName = 'user'+ (data.senderID * data.receiverID) + secret;
		socket.leave(roomName);
	});

	socket.on('newAudioClient', function(){

		this.emit('createAudioPeer');
	});

	socket.on('offerAudioCall', function(offer){
		let secret = 'xYz';
		let roomName = 'user'+ (offer.senderID * offer.receiverID) + secret;
		this.to(roomName).emit('backOfferAudioCall', offer);
	});

	socket.on('answerAudioCall', function(data){
		let secret = 'xYz';
		let roomName = 'user'+ (data.senderID * data.receiverID) + secret;
		this.to(roomName).emit('backAnswerAudioCall', data.data);
	});

	socket.on('leaveAudioCall', function(data){
		console.log("call to leaveAudioCall");
		let secret = 'xYz';
		let roomName = 'user'+ (data.senderID * data.receiverID) + secret;
		socket.leave(roomName);
	});

	socket.on('disconnect', function(reason){
		console.log("A use has been disconnected =>"+ reason);
	});
});

http.listen(port, () => console.log(`Active on ${port} port`));