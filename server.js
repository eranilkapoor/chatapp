const express   = require('express');
const app 		= express();
const http 		= require('http').Server(app);
const io 		= require('socket.io')(http);
const cors 		= require('cors');

const port 		= process.env.PORT || 3000;

app.use(cors());

let clients = [];

io.on('connection', function(socket){
	console.log('New Socket Connected with =>'+ socket.id);
	socket.join('webnzasupport', () => {
		socket.broadcast.emit('webnzasupport','A new user has joined the room');
	});

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
			let roomName = 'user'+ (data.senderID * data.receiverID) + secret;
			socket.to(roomName).emit('onChatMessage', data);
		}
	});

	socket.on('joinRoom', function(data){
		let secret = 'xYz';
		let roomName = 'user'+ (data.senderID * data.receiverID) + secret;
		socket.join(roomName);
	});

	socket.on('NewClient', function(){
		if(clients.length < 2) {
			if(clients.length == 1){
				this.emit('CreatePeer')
			}
		} else {
			this.emit('SessionActive')
		}
		clients.push(socket.id);
	});
	socket.on('Offer', SendOffer)
	socket.on('Answer', SendAnswer)
	socket.on('disconnect', function(reason){
		console.log("A use has been disconnected "+ reason);
	});
});

function SendOffer(offer){
	this.broadcast.emit('BackOffer', offer)
}

function SendAnswer(data){
	this.broadcast.emit('BackAnswer', data);
}

http.listen(port, () => console.log(`Active on ${port} port`));