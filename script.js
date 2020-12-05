'use strict';

//カメラ映像、マイク音声の取得
let localStream = null;
let peer = null;
let existingCall = null;

navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then(function (stream) {
        // Success
        $('#my-video').get(0).srcObject = stream;
        localStream = stream;
    }).catch(function (error) {
        // Error
        console.error('mediaDevice.getUserMedia() error:', error);
        return;
    });

peer = new Peer({
    key: '0d6fca3f-8fac-4b01-854c-6eae38d8f8af',
    debug: 3
})

peer.on('open', function(){
    $('#my-id').text(peer.id);
    })
    
peer.on('error', function(err){
    alert(err.message);
    })

peer.on('disconnected', function(){
    });

peer.on('call', function(call){
        call.answer(localStream);
        setupCallEventHandlers(call);
    });

$('#make-call').submit(function(e){
    e.preventDefault();
    const call = peer.call($('#callto-id').val(), localStream);
    setupCallEventHandlers(call);
    });

$('#end-call').click(function(){
    existingCall.close();
    });

function setupCallEventHandlers(call){
    if (existingCall) {
        existingCall.close();
        };
    
    existingCall = call;
    
    call.on('stream', function(stream){
        addVideo(call,stream);
        setupEndCallUI();
        $('#their-id').text(call.remoteId);
        });
    // 省略
    }

function addVideo(call,stream){
    $('#their-video').get(0).srcObject = stream;
    }

function removeVideo(peerId){
    $('#' + peerId).remove();
   }

function setupMakeCallUI(){
    $('#make-call').show();
    $('#end-call').hide();
}

function setupEndCallUI() {
    $('#make-call').hide();
    $('#end-call').show();
}


console.log(text(peer.id))