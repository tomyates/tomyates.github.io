import{PeerStats}from"./peer_stats.js";import{WebSocketAdaptor}from"./websocket_adaptor.js";import{MediaManager}from"./media_manager.js";import{SoundMeter}from"./soundmeter.js";class ReceivingMessage{constructor(e){this.size=e,this.received=0,this.data=new ArrayBuffer(e)}}export class WebRTCAdaptor{constructor(e){for(var t in this.peerconnection_config=null,this.sdp_constraints=null,this.remotePeerConnection=new Array,this.remotePeerConnectionStats=new Array,this.remoteDescriptionSet=new Array,this.iceCandidateList=new Array,this.roomName=null,this.playStreamId=new Array,this.audioContext=new AudioContext,this.isMultiPeer=!1,this.multiPeerStreamId=null,this.webSocketAdaptor=null,this.isPlayMode=!1,this.debug=!1,this.publishStreamId=null,this.idMapping=new Array,this.onlyDataChannel=!1,this.dataChannelEnabled=!0,this.receivingMessages=new Map,this.candidateTypes=["udp","tcp"],e)e.hasOwnProperty(t)&&(this[t]=e[t]);this.remoteVideo=document.getElementById(this.remoteVideoId),this.soundMeters=new Array,this.soundLevelList=new Array,this.mediaManager=new MediaManager({userParameters:e,webRTCAdaptor:this,callback:(e,t)=>{this.callback(e,t)},callbackError:(e,t)=>{this.callbackError(e,t)},getSender:(e,t)=>this.getSender(e,t)}),this.initialize()}initialize(){this.isPlayMode||this.onlyDataChannel||void 0===this.mediaConstraints||null!=this.mediaManager.localStream||this.mediaManager.initLocalStream(),this.checkWebSocketConnection()}publish(e,t,i,a,o,n,r){if(this.publishStreamId=e,this.mediaManager.publishStreamId=e,this.onlyDataChannel)var s={command:"publish",streamId:e,token:t,subscriberId:void 0!==typeof i?i:"",subscriberCode:void 0!==typeof a?a:"",streamName:void 0!==typeof o?o:"",mainTrack:void 0!==typeof n?n:"",video:!1,audio:!1,metaData:r};else null==this.mediaManager.localStream?this.mediaManager.navigatorUserMedia(this.mediaConstraints,(s=>{this.mediaManager.gotStream(s);var d={command:"publish",streamId:e,token:t,subscriberId:void 0!==typeof i?i:"",subscriberCode:void 0!==typeof a?a:"",streamName:void 0!==typeof o?o:"",mainTrack:void 0!==typeof n?n:"",video:this.mediaManager.localStream.getVideoTracks().length>0,audio:this.mediaManager.localStream.getAudioTracks().length>0,metaData:r};this.webSocketAdaptor.send(JSON.stringify(d))}),!1):s={command:"publish",streamId:e,token:t,subscriberId:void 0!==typeof i?i:"",subscriberCode:void 0!==typeof a?a:"",streamName:void 0!==typeof o?o:"",mainTrack:void 0!==typeof n?n:"",video:this.mediaManager.localStream.getVideoTracks().length>0,audio:this.mediaManager.localStream.getAudioTracks().length>0,metaData:r};this.webSocketAdaptor.send(JSON.stringify(s))}joinRoom(e,t,i){this.roomName=e;var a={command:"joinRoom",room:e,streamId:t,mode:i};this.webSocketAdaptor.send(JSON.stringify(a))}play(e,t,i,a,o,n,r){this.playStreamId.push(e);var s={command:"play",streamId:e,token:t,room:i,trackList:a,subscriberId:void 0!==typeof o?o:"",subscriberCode:void 0!==typeof n?n:"",viewerInfo:r};this.webSocketAdaptor.send(JSON.stringify(s))}stop(e){this.closePeerConnection(e);var t={command:"stop",streamId:e};this.webSocketAdaptor.send(JSON.stringify(t))}join(e){var t={command:"join",streamId:e,multiPeer:this.isMultiPeer&&null==this.multiPeerStreamId,mode:this.isPlayMode?"play":"both"};this.webSocketAdaptor.send(JSON.stringify(t))}leaveFromRoom(e){this.roomName=e;var t={command:"leaveFromRoom",room:e};console.log("leave request is sent for "+e),this.webSocketAdaptor.send(JSON.stringify(t))}leave(e){var t={command:"leave",streamId:this.isMultiPeer&&null!=this.multiPeerStreamId?this.multiPeerStreamId:e};this.webSocketAdaptor.send(JSON.stringify(t)),this.closePeerConnection(e),this.multiPeerStreamId=null}getStreamInfo(e){var t={command:"getStreamInfo",streamId:e};this.webSocketAdaptor.send(JSON.stringify(t))}upateStreamMetaData(e,t){var i={command:"updateStreamMetaData",streamId:e,metaData:t};this.webSocketAdaptor.send(JSON.stringify(i))}getRoomInfo(e,t){var i={command:"getRoomInfo",streamId:t,room:e};this.webSocketAdaptor.send(JSON.stringify(i))}enableTrack(e,t,i){var a={command:"enableTrack",streamId:e,trackId:t,enabled:i};this.webSocketAdaptor.send(JSON.stringify(a))}getTracks(e,t){this.playStreamId.push(e);var i={command:"getTrackList",streamId:e,token:t};this.webSocketAdaptor.send(JSON.stringify(i))}onTrack(e,t){if(console.log("onTrack"),null!=this.remoteVideo)this.remoteVideo.srcObject!==e.streams[0]&&(this.remoteVideo.srcObject=e.streams[0],console.log("Received remote stream"));else{var i={stream:e.streams[0],track:e.track,streamId:t,trackId:this.idMapping[t][e.transceiver.mid]};this.callback("newStreamAvailable",i)}}iceCandidateReceived(e,t){if(e.candidate){var i=!1;if(""==e.candidate.candidate?i=!0:void 0===e.candidate.protocol?this.candidateTypes.forEach((t=>{e.candidate.candidate.toLowerCase().includes(t)&&(i=!0)})):i=this.candidateTypes.includes(e.candidate.protocol.toLowerCase()),i){var a={command:"takeCandidate",streamId:t,label:e.candidate.sdpMLineIndex,id:e.candidate.sdpMid,candidate:e.candidate.candidate};this.debug&&(console.log("sending ice candiate for stream Id "+t),console.log(JSON.stringify(e.candidate))),this.webSocketAdaptor.send(JSON.stringify(a))}else console.log("Candidate's protocol(full sdp: "+e.candidate.candidate+") is not supported. Supported protocols: "+this.candidateTypes),""!=e.candidate.candidate&&this.callbackError("protocol_not_supported","Support protocols: "+this.candidateTypes.toString()+" candidate: "+e.candidate.candidate)}else console.log("No event.candidate in the iceCandidate event")}initDataChannel(e,t){t.onerror=i=>{console.log("Data Channel Error:",i);var a={streamId:e,error:i};console.log("channel status: ",t.readyState),"closed"!=t.readyState&&this.callbackError("data_channel_error",a)},t.onmessage=t=>{var i={streamId:e,data:t.data},a=i.data;if("string"==typeof a||a instanceof String)this.callback("data_received",i);else{var o=a.length||a.size||a.byteLength,n=new Int32Array(a,0,1)[0],r=this.receivingMessages[n];if(null==r){var s=new Int32Array(a,0,2)[1];return r=new ReceivingMessage(s),this.receivingMessages[n]=r,void(o>8&&console.error("something went wrong in msg receiving"))}var d=a.slice(4,o);new Uint8Array(r.data).set(new Uint8Array(d),r.received,o-4),r.received+=o-4,r.size==r.received&&(i.data=r.data,this.callback("data_received",i))}},t.onopen=()=>{this.remotePeerConnection[e].dataChannel=t,console.log("Data channel is opened"),this.callback("data_channel_opened",e)},t.onclose=()=>{console.log("Data channel is closed"),this.callback("data_channel_closed",e)}}initPeerConnection(e,t){if(null==this.remotePeerConnection[e]){var i=e;if(console.log("stream id in init peer connection: "+e+" close stream id: "+i),this.remotePeerConnection[e]=new RTCPeerConnection(this.peerconnection_config),this.remoteDescriptionSet[e]=!1,this.iceCandidateList[e]=new Array,this.playStreamId.includes(e)||null!=this.mediaManager.localStream&&this.mediaManager.localStream.getTracks().forEach((t=>this.remotePeerConnection[e].addTrack(t,this.mediaManager.localStream))),this.remotePeerConnection[e].onicecandidate=e=>{this.iceCandidateReceived(e,i)},this.remotePeerConnection[e].ontrack=e=>{this.onTrack(e,i)},this.remotePeerConnection[e].onnegotiationneeded=e=>{console.log("onnegotiationneeded")},this.dataChannelEnabled)if("publish"==t){const t={ordered:!0};if(this.remotePeerConnection[e].createDataChannel){var a=this.remotePeerConnection[e].createDataChannel(e,t);this.initDataChannel(e,a)}else console.warn("CreateDataChannel is not supported")}else if("play"==t)this.remotePeerConnection[e].ondatachannel=t=>{this.initDataChannel(e,t.channel)};else{const t={ordered:!0};if(this.remotePeerConnection[e].createDataChannel){var o=this.remotePeerConnection[e].createDataChannel(e,t);this.initDataChannel(e,o),this.remotePeerConnection[e].ondatachannel=t=>{this.initDataChannel(e,t.channel)}}else console.warn("CreateDataChannel is not supported")}this.remotePeerConnection[e].oniceconnectionstatechange=t=>{var i={state:this.remotePeerConnection[e].iceConnectionState,streamId:e};this.callback("ice_connection_state_changed",i),this.isPlayMode||this.playStreamId.includes(e)||"connected"==this.remotePeerConnection[e].iceConnectionState&&this.mediaManager.changeBandwidth(this.mediaManager.bandwidth,e).then((()=>{console.log("Bandwidth is changed to "+this.mediaManager.bandwidth)})).catch((e=>console.warn(e)))}}}closePeerConnection(e){if(null!=this.remotePeerConnection[e]&&(null!=this.remotePeerConnection[e].dataChannel&&this.remotePeerConnection[e].dataChannel.close(),"closed"!=this.remotePeerConnection[e].signalingState)){this.remotePeerConnection[e].close(),this.remotePeerConnection[e]=null,delete this.remotePeerConnection[e];var t=this.playStreamId.indexOf(e);-1!=t&&this.playStreamId.splice(t,1)}null!=this.remotePeerConnectionStats[e]&&(clearInterval(this.remotePeerConnectionStats[e].timerId),delete this.remotePeerConnectionStats[e]),null!=this.soundMeters[e]&&delete this.soundMeters[e]}signallingState(e){return null!=this.remotePeerConnection[e]?this.remotePeerConnection[e].signalingState:null}iceConnectionState(e){return null!=this.remotePeerConnection[e]?this.remotePeerConnection[e].iceConnectionState:null}gotDescription(e,t){this.remotePeerConnection[t].setLocalDescription(e).then((i=>{console.debug("Set local description successfully for stream Id "+t);var a={command:"takeConfiguration",streamId:t,type:e.type,sdp:e.sdp};this.debug&&(console.debug("local sdp: "),console.debug(e.sdp)),this.webSocketAdaptor.send(JSON.stringify(a))})).catch((e=>{console.error("Cannot set local description. Error is: "+e)}))}takeConfiguration(e,t,i,a){var o=e,n=i,r=t,s="offer"==n,d="publish";s&&(d="play"),this.idMapping[o]=a,this.initPeerConnection(o,d),this.remotePeerConnection[o].setRemoteDescription(new RTCSessionDescription({sdp:r,type:n})).then((e=>{this.debug&&(console.debug("set remote description is succesfull with response: "+e+" for stream : "+o+" and type: "+n),console.debug(r)),this.remoteDescriptionSet[o]=!0;var t=this.iceCandidateList[o].length;console.debug("Ice candidate list size to be added: "+t);for(var i=0;i<t;i++)this.addIceCandidate(o,this.iceCandidateList[o][i]);this.iceCandidateList[o]=[],s&&(console.log("try to create answer for stream id: "+o),this.remotePeerConnection[o].createAnswer(this.sdp_constraints).then((e=>{console.log("created answer for stream id: "+o),e.sdp=e.sdp.replace("useinbandfec=1","useinbandfec=1; stereo=1"),this.gotDescription(e,o)})).catch((e=>{console.error("create answer error :"+e)})))})).catch((e=>{this.debug&&console.error("set remote description is failed with error: "+e),(e.toString().indexOf("InvalidAccessError")>-1||e.toString().indexOf("setRemoteDescription")>-1)&&this.callbackError("notSetRemoteDescription")}))}takeCandidate(e,t,i){var a=e,o=new RTCIceCandidate({sdpMLineIndex:t,candidate:i});this.initPeerConnection(a,"peer"),1==this.remoteDescriptionSet[a]?this.addIceCandidate(a,o):(console.debug("Ice candidate is added to list because remote description is not set yet"),this.iceCandidateList[a].push(o))}addIceCandidate(e,t){var i=!1;""==t.candidate?i=!0:void 0===t.protocol?this.candidateTypes.forEach((e=>{t.candidate.toLowerCase().includes(e)&&(i=!0)})):i=this.candidateTypes.includes(t.protocol.toLowerCase()),i?this.remotePeerConnection[e].addIceCandidate(t).then((t=>{this.debug&&console.log("Candidate is added for stream "+e)})).catch((i=>{console.error("ice candiate cannot be added for stream id: "+e+" error is: "+i),console.error(t)})):this.debug&&console.log("Candidate's protocol("+t.protocol+") is not supported.Candidate: "+t.candidate+" Supported protocols:"+this.candidateTypes)}startPublishing(e){var t=e;this.initPeerConnection(t,"publish"),this.remotePeerConnection[t].createOffer(this.sdp_constraints).then((e=>{this.gotDescription(e,t)})).catch((e=>{console.error("create offer error for stream id: "+t+" error: "+e)}))}toggleVideo(e,t,i){var a={command:"toggleVideo",streamId:e,trackId:t,enabled:i};this.webSocketAdaptor.send(JSON.stringify(a))}toggleAudio(e,t,i){var a={command:"toggleAudio",streamId:e,trackId:t,enabled:i};this.webSocketAdaptor.send(JSON.stringify(a))}getStats(e){console.log("peerstatsgetstats = "+this.remotePeerConnectionStats[e]),this.remotePeerConnection[e].getStats(null).then((t=>{var i=-1,a=-1,o=-1,n=-1,r=-1,s=-1,d=-1,c="",l=-1,h=-1,m=-1,p=-1,u=-1,g=-1,C=-1,S=-1,f=-1,v=-1,b=-1,k=-1,y=-1,P=-1,w=-1;t.forEach((e=>{"inbound-rtp"==e.type&&void 0!==e.kind?(i+=e.bytesReceived,"audio"==e.kind?o=e.packetsLost:"video"==e.kind&&(a=e.packetsLost),n+=e.fractionLost,r=e.timestamp):"outbound-rtp"==e.type?(s+=e.bytesSent,r=e.timestamp,c=e.qualityLimitationReason,null!=e.framesEncoded&&(l+=e.framesEncoded)):"track"==e.type&&void 0!==e.kind&&"audio"==e.kind?(void 0!==e.audioLevel&&(d=e.audioLevel),void 0!==e.jitterBufferDelay&&void 0!==e.jitterBufferEmittedCount&&(P=e.jitterBufferDelay/e.jitterBufferEmittedCount)):"track"==e.type&&void 0!==e.kind&&"video"==e.kind?(void 0!==e.frameWidth&&(u=e.frameWidth),void 0!==e.frameHeight&&(g=e.frameHeight),void 0!==e.framesDecoded&&(b=e.framesDecoded),void 0!==e.framesDropped&&(k=e.framesDropped),void 0!==e.framesReceived&&(y=e.framesReceived),void 0!==e.jitterBufferDelay&&void 0!==e.jitterBufferEmittedCount&&(w=e.jitterBufferDelay/e.jitterBufferEmittedCount)):"remote-inbound-rtp"==e.type&&void 0!==e.kind?(void 0!==e.packetsLost&&("video"==e.kind?a=e.packetsLost:"audio"==e.kind&&(o=e.packetsLost)),void 0!==e.roundTripTime&&("video"==e.kind?C=e.roundTripTime:"audio"==e.kind&&(f=e.roundTripTime)),void 0!==e.jitter&&("video"==e.kind?S=e.jitter:"audio"==e.kind&&(v=e.jitter))):"media-source"==e.type&&"video"==e.kind&&(h=e.width,m=e.height,p=e.framesPerSecond)})),this.remotePeerConnectionStats[e].totalBytesReceived=i,this.remotePeerConnectionStats[e].videoPacketsLost=a,this.remotePeerConnectionStats[e].audioPacketsLost=o,this.remotePeerConnectionStats[e].fractionLost=n,this.remotePeerConnectionStats[e].currentTime=r,this.remotePeerConnectionStats[e].totalBytesSent=s,this.remotePeerConnectionStats[e].audioLevel=d,this.remotePeerConnectionStats[e].qualityLimitationReason=c,this.remotePeerConnectionStats[e].totalFramesEncoded=l,this.remotePeerConnectionStats[e].resWidth=h,this.remotePeerConnectionStats[e].resHeight=m,this.remotePeerConnectionStats[e].srcFps=p,this.remotePeerConnectionStats[e].frameWidth=u,this.remotePeerConnectionStats[e].frameHeight=g,this.remotePeerConnectionStats[e].videoRoundTripTime=C,this.remotePeerConnectionStats[e].videoJitter=S,this.remotePeerConnectionStats[e].audioRoundTripTime=f,this.remotePeerConnectionStats[e].audioJitter=v,this.remotePeerConnectionStats[e].framesDecoded=b,this.remotePeerConnectionStats[e].framesDropped=k,this.remotePeerConnectionStats[e].framesReceived=y,this.remotePeerConnectionStats[e].videoJitterAverageDelay=w,this.remotePeerConnectionStats[e].audioJitterAverageDelay=P,this.callback("updated_stats",this.remotePeerConnectionStats[e])}))}enableStats(e){null==this.remotePeerConnectionStats[e]&&(this.remotePeerConnectionStats[e]=new PeerStats(e),this.remotePeerConnectionStats[e].timerId=setInterval((()=>{this.getStats(e)}),5e3))}disableStats(e){null==this.remotePeerConnectionStats[e]&&void 0===this.remotePeerConnectionStats[e]||clearInterval(this.remotePeerConnectionStats[e].timerId)}checkWebSocketConnection(){(null==this.webSocketAdaptor||0==this.webSocketAdaptor.isConnected()&&0==this.webSocketAdaptor.isConnecting())&&(this.webSocketAdaptor=new WebSocketAdaptor({websocket_url:this.websocket_url,webrtcadaptor:this,callback:this.callback,callbackError:this.callbackError,debug:this.debug}))}closeWebSocket(){for(var e in this.remotePeerConnection)this.remotePeerConnection[e].close();this.remotePeerConnection=new Array,this.webSocketAdaptor.close()}peerMessage(e,t,i){var a={command:"peerMessageCommand",streamId:e,definition:t,data:i};this.webSocketAdaptor.send(JSON.stringify(a))}forceStreamQuality(e,t){var i={command:"forceStreamQuality",streamId:e,streamHeight:t};this.webSocketAdaptor.send(JSON.stringify(i))}sendData(e,t){var i=this.remotePeerConnection[e].dataChannel,a=t.length||t.size||t.byteLength,o=0;if("string"==typeof t||t instanceof String)i.send(t);else{var n=Math.floor(999999*Math.random());let e=new Int32Array(2);for(e[0]=n,e[1]=a,i.send(e),o=0;o<a;){var r=Math.min(a-o,16e3),s=new Uint8Array(r+4),d=new Int32Array(1);d[0]=n,s.set(new Uint8Array(d.buffer,0,4),0);var c=t.slice(o,o+r);s.set(new Uint8Array(c),4),o+=r,i.send(s)}}}enableAudioLevel(e,t){const i=new SoundMeter(this.audioContext);i.connectToSource(e,(function(e){e?alert(e):console.log("Added sound meter for stream: "+t+" = "+i.instant.toFixed(2))})),this.soundMeters[t]=i}getSoundLevelList(e){for(let t=0;t<e.length;t++)this.soundLevelList[e[t]]=this.soundMeters[e[t]].instant.toFixed(2);this.callback("gotSoundList",this.soundLevelList)}getSender(e,t){var i=null;return null!=this.remotePeerConnection[e]&&(i=this.remotePeerConnection[e].getSenders().find((function(e){return e.track.kind==t}))),i}assignVideoTrack(e,t,i){var a={command:"assignVideoTrackCommand",streamId:t,videoTrackId:e,enabled:i};this.webSocketAdaptor.send(JSON.stringify(a))}updateVideoTrackAssignments(e,t,i){var a={streamId:e,command:"updateVideoTrackAssignmentsCommand",offset:t,size:i};this.webSocketAdaptor.send(JSON.stringify(a))}setMaxVideoTrackCount(e,t){var i={streamId:e,command:"setMaxVideoTrackCountCommand",maxTrackCount:t};this.webSocketAdaptor.send(JSON.stringify(i))}updateAudioLevel(e,t){var i={streamId:e,eventType:"UPDATE_AUDIO_LEVEL",audioLevel:t};this.sendData(e,JSON.stringify(i))}turnOffLocalCamera(e){this.mediaManager.turnOffLocalCamera(e)}turnOnLocalCamera(e){this.mediaManager.turnOnLocalCamera(e)}muteLocalMic(){this.mediaManager.muteLocalMic()}unmuteLocalMic(){this.mediaManager.unmuteLocalMic()}switchDesktopCapture(e){this.mediaManager.switchDesktopCapture(e)}switchVideoCameraCapture(e,t){this.mediaManager.switchVideoCameraCapture(e,t)}switchVideoCameraFacingMode(e,t){this.mediaManager.switchVideoCameraFacingMode(e,t)}switchDesktopCaptureWithCamera(e){this.mediaManager.switchDesktopCaptureWithCamera(e)}switchAudioInputSource(e,t){this.mediaManager.switchAudioInputSource(e,t)}setVolumeLevel(e){this.mediaManager.setVolumeLevel(e)}enableAudioLevelForLocalStream(e,t){this.mediaManager.enableAudioLevelForLocalStream(e,t)}applyConstraints(e){this.mediaManager.applyConstraints(e)}changeBandwidth(e,t){this.mediaManager.changeBandwidth(e,t)}enableAudioLevelWhenMuted(){this.mediaManager.enableAudioLevelWhenMuted()}disableAudioLevelWhenMuted(){this.mediaManager.disableAudioLevelWhenMuted()}getVideoSender(e){return this.mediaManager.getVideoSender(e)}closeStream(){this.mediaManager.closeStream()}applyConstraints(e,t){this.mediaManager.applyConstraints(e,t)}}