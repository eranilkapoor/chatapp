'use strict';

const Peer      = require('simple-peer');
const socket    = io();
const video     = document.querySelector('video');
const client    = {};

navigator.mediaDevices.getUserMedia({video:true, audio:true}).then(stream => {
    socket.emit('NewClient')
    video.srcObject = stream
    video.play()

    function InitPeer(type){
        console.log("RUN INITPEER");
        let peer = new Peer({ initiator: (type == 'init') ? true : false, stream: stream, trickle: false })
        peer.on('stream', function(stream){
            console.log("RUN CREATEVIDEO");
            CreateVideo(stream)
        })
        peer.on('close', function(){
            console.log("RUN CLOSE VIDEO");
            document.getElementById("peerVideo").remove();
            peer.destroy()
        })

        return peer
    }

    function MakePeer(){
        client.gotAnswer = false
        let peer = InitPeer('init');
        peer.on('signal', function(data){
            console.log("RUN MAKEPEER");
            if(!client.gotAnswer){
                socket.emit('Offer', data);
            }
        })
        client.peer = peer
    }

    function FrontAnswer(offer){
        console.log("RUN FRONTANSWER");
        let peer = InitPeer('notInit');
        peer.on('signal', (data) => {
            socket.emit('Answer', data);
        })
        peer.signal(offer);
    }

    function SignalAnswer(answer){
        console.log("RUN SIGNALANSWER");
        client.gotAnswer = true
        let peer = client.peer
        peer.signal(answer)
    }

    function CreateVideo(stream){
        let video = document.createElement('video')
        video.id = 'peerVideo'
        video.srcObject = stream
        video.class = 'embed-responsive-item'
        document.querySelector('#peerDiv').appendChild(video)
        video.play()
    }

    function SessionActive(){
        console.log("RUN SESSIONACTIVE");
        document.write('Session Active. Please come back later');
    }

    socket.on('BackOffer', FrontAnswer)
    socket.on('BackAnswer', SignalAnswer)
    socket.on('SessionActive', SessionActive)
    socket.on('CreatePeer', MakePeer)
}).catch((err) => {
    document.write(err)
});