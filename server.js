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
		let rooms = Object.keys(socket.rooms);
		console.log(rooms);
		io.broadcast.emit('webnzasupport','a new user has joined the room');
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
		console.log("A use has been disconnected"+ reason);
	});
});

function SendOffer(offer){
	this.broadcast.emit('BackOffer', offer)
}

function SendAnswer(data){
	this.broadcast.emit('BackAnswer', data);
}

http.listen(port, () => console.log(`Active on ${port} port`));