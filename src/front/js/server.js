var canvas = null

function getQueryString(name) {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    let r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return decodeURIComponent(r[2]);
    };
    return null;
 }

// const socketId = Math.ceil(Math.random()*10000); 

const id = getQueryString("id")

const SignalingChannel = ()=>{
    var socket = new WebSocket(`ws://192.168.31.78:30011/ifc/user/${id}`);
    socket.addEventListener('open', function (event) {
        console.log('socket is open')
        socket.send(JSON.stringify({data: "连接成功"}))
    });
    socket.addEventListener('message', function (event) {
        console.log('event', event)
    });
    return socket
}

var constraints = {audio: true, video: false};
var pc 
var signaling 

window.onload = function(){
    // handles JSON.stringify/parse 
 signaling = SignalingChannel();
const configuration = {};
pc = new RTCPeerConnection(configuration);

// Send any ice candidates to the other peer.
pc.onicecandidate = ({candidate}) => signaling.send(JSON.stringify({toId: 1, data: candidate}));

// Let the "negotiationneeded" event trigger offer generation.
pc.onnegotiationneeded =  () => {
  try {
     pc.createOffer().then((res)=>{
        pc.setLocalDescription(res).then(()=>{
            signaling.send( JSON.stringify({toId: 1, data:{desc: pc.localDescription}}));
        });
    })
    // Send the offer to the other peer.
    
  } catch (err) {
    console.error(err);
  }
};

// Once remote track media arrives, show it in remote video element.
pc.ontrack = (event) => {
  // Don't set srcObject again if it is already set.
  if (remoteView.srcObject) return;
  remoteView.srcObject = event.streams[0];
};

// Call start() to initiate.
 

signaling.onmessage =  ({data}) => {
    console.log(data)
    
    const desc = JSON.parse(data)
  try {
    if (desc) {
      // If you get an offer, you need to reply with an answer.
      if (desc.type) {
        if (desc.type === 'offer') {
            pc.setRemoteDescription(desc).then(()=>{
                navigator.mediaDevices.getUserMedia(constraints).then((stream)=>{
                   stream.getTracks().forEach((track) =>
                   pc.addTrack(track, stream));
                   pc.createAnswer().then((res)=>{
                       pc.setLocalDescription(res );
                   })
                   signaling.send( JSON.stringify({toId: 1, data:{desc: pc.localDescription}}));
               })
           })
           
         } else if (desc.type === 'answer') {
            pc.setRemoteDescription(desc);
         } else {
           console.log('Unsupported SDP type.');
         }
      }else if (desc) {
        pc.addIceCandidate(desc);
     }
      
    } 
  } catch (err) {
    console.error(err);
  }
};
}

var vudio = null
var isOpen = false

start = () => {
    
    // try {
    //   // Get local stream, show it in self-view, and add it to be sent.
    //      navigator.mediaDevices.getUserMedia(constraints).then((stream)=>{
    //         stream.getTracks().forEach((track) =>
    //         pc.addTrack(track, stream));
    //         // selfView.srcObject = stream;
    //     })
     
    // } catch (err) {
    //   console.error(err);
    // }
    signaling.send(JSON.stringify({toId: 1, data: '发送给1'}))
  }

function startMic (){
    if (!isOpen) {
        var canvas = document.querySelector('#canvas')
        var audio = document.querySelector('#audio')
        navigator.mediaDevices.getUserMedia({
            audio: true
        }).then((mediaStream)=>{
            isOpen = true
            console.log('用户同意')
            console.log(mediaStream, 'mediaStream')
            // audio.srcObject = mediaStream
            // audio.onloadedmetadata = function(e) {
            //     audio.play();
            //     // audio.muted = true;
            // };
              // 调用Vudio
      vudio = new Vudio(mediaStream, canvas, {
        accuracy: 256,
        width: 1024,
        height: 200,
        waveform: {
          fadeSide: false,
          maxHeight: 200,
          verticalAlign: 'middle',
          horizontalAlign: 'center',
          color: '#2980b9'
        }
      })
    
      vudio.dance()
        }).catch((err)=>{
            console.log(err, 'err')
        })
    
        console.log()
        console.log("开麦了")
    }
    
}

function endMic (){
    if (isOpen) {
        vudio.pause()
        isOpen = false
        console.log("闭麦了")
    }
   
}