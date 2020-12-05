const Peer = window.Peer;

(async function main() {
  let number=0;  //参加者人数
  const localVideo = document.getElementById('js-local-stream');
  const joinTrigger = document.getElementById('js-join-trigger');
  const leaveTrigger = document.getElementById('js-leave-trigger');
  const remoteVideos = document.getElementById('js-remote-streams');
  const roomId = document.getElementById('js-room-id');
  const roomMode = document.getElementById('js-room-mode');
  const localText = document.getElementById('js-local-text');
  const sendTrigger = document.getElementById('js-send-trigger');
  const messages = document.getElementById('js-messages');
  const sdkSrc = document.querySelector('script[src*=skyway]');


  const getRoomModeByHash = () => (location.hash === '#sfu' ? 'sfu' : 'mesh');

  roomMode.textContent = getRoomModeByHash();
  window.addEventListener(
    'hashchange',
    () => (roomMode.textContent = getRoomModeByHash())
  );

  const localStream = await navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true,
    })
    .catch(console.error);

  // Render local stream
  localVideo.muted = true;
  localVideo.srcObject = localStream;
  localVideo.playsInline = true;
  await localVideo.play().catch(console.error);

  //Peerクラスの生成、自動でIDの付与
  const peer = (window.peer = new Peer({
    key: window.__SKYWAY_KEY__,
    debug: 3,
  }));

  //最初の画面に来た際の処理
  joinTrigger.addEventListener('click', () => {
    
    if (!peer.open) {
      return;
    }

    const room = peer.joinRoom(roomId.value, {
      mode: getRoomModeByHash(),
      stream: localStream,
      
    });

    //初参加の時
    room.once('open', () => {
      messages.textContent += '= 参加しました =\n';
      　number++;
      document.getElementById('number').innerText=aaa;

    });
    //他人が参加した時の処理
    room.on('peerJoin', peerId => {
      messages.textContent += `= ${peerId} が参加しました =\n`;
      number++;
      document.getElementById('number').innerText=peerId;

    });

    //他人のビデオの表示
    room.on('stream', async stream => {
      const newVideo = document.createElement('video');
      newVideo.srcObject = stream;
      newVideo.playsInline = true;
      // mark peerId to find it later at peerLeave event
      newVideo.setAttribute('data-peer-id', stream.peerId);
      remoteVideos.append(newVideo);
      await newVideo.play().catch(console.error);
    });

    //メッセージの処理
    room.on('data', ({ data, src }) => {
      messages.textContent += `${src}: ${data}\n`;
    });
　　
    　
    //メンバーが通話から抜けるとき
    room.on('peerLeave', peerId => {
      const remoteVideo = remoteVideos.querySelector(
        `[data-peer-id="${peerId}"]`
      );
      remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      remoteVideo.srcObject = null;
      remoteVideo.remove();

      messages.textContent += `= ${peerId} が退出しました =\n`;
      number--;
      document.getElementById('PersonNumber').innerText=number;
    });

    // for closing myself
    room.once('close', () => {
      sendTrigger.removeEventListener('click', onClickSend);
      messages.textContent += '= 退出しました =\n';
      Array.from(remoteVideos.children).forEach(remoteVideo => {
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        remoteVideo.srcObject = null;
        remoteVideo.remove();
      });
    });
　　
    //各ボタンが押された時イベントを呼び出す
    sendTrigger.addEventListener('click', onClickSend);
    leaveTrigger.addEventListener('click', () => room.close(), { once: true });
    
    //送信が押されたときの処理
    function onClickSend() {
      room.send(localText.value);

      messages.textContent += `${peer.id}: ${localText.value}\n`;
      localText.value = '';
    }
  });

  peer.on('error', console.error);
})();