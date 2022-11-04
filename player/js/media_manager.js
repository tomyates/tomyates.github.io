import{SoundMeter}from"./soundmeter.js";export class MediaManager{constructor(e){for(var i in this.bandwidth=900,this.debug=!1,this.camera_location="top",this.camera_margin=15,this.camera_percent=15,this.mediaConstraints=null,this.getSender=e.getSender,this.publishStreamId=null,this.localStream=null,e.userParameters)e.userParameters.hasOwnProperty(i)&&(this[i]=e.userParameters[i]);this.currentVolume=null,this.previousAudioTrack=null,this.desktopStream=null,this.smallVideoTrack=null,this.audioContext=new AudioContext,this.primaryAudioTrackGainNode=null,this.secondaryAudioTrackGainNode=null,this.localStreamSoundMeter=null,this.blackFrameTimer=null,this.mutedAudioStream=null,this.isMuted=!1,this.meterRefresh=null,this.cameraEnabled=!0,this.localVideo=document.getElementById(this.localVideoId),this.dummyCanvas=document.createElement("canvas"),this.soundLevelProviderId=-1,this.publishMode="camera","camera"==this.mediaConstraints.video?this.publishMode="camera":"screen"==this.mediaConstraints.video?this.publishMode="screen":"screen+camera"==this.mediaConstraints.video&&(this.publishMode="screen+camera"),this.checkBrowserScreenShareSupported()}initLocalStream(){if(this.checkWebRTCPermissions(),this.getDevices(),this.trackDeviceChange(),void 0!==this.mediaConstraints.video&&0!=this.mediaConstraints.video)this.openStream(this.mediaConstraints,this.mode);else{var e={audio:this.mediaConstraints.audio};this.navigatorUserMedia(e,(e=>{this.gotStream(e)}),!0)}}checkWebRTCPermissions(){return"WebSocket"in window?void 0===navigator.mediaDevices?(console.log("Cannot open camera and mic because of unsecure context. Please Install SSL(https)"),void this.callbackError("UnsecureContext")):void(void 0!==navigator.mediaDevices&&null!=navigator.mediaDevices&&null!=navigator.mediaDevices||this.callbackError("getUserMediaIsNotAllowed")):(console.log("WebSocket not supported."),void this.callbackError("WebSocketNotSupported"))}getDevices(){navigator.mediaDevices.enumerateDevices().then((e=>{let i=new Array,t=!1,a=!1;e.forEach((e=>{"audioinput"!=e.kind&&"videoinput"!=e.kind||(i.push(e),"audioinput"==e.kind&&(t=!0),"videoinput"==e.kind&&(a=!0))})),this.callback("available_devices",i),0==t&&null==this.localStream&&(console.log("Audio input not found"),console.log("Retrying to get user media without audio"),this.inputDeviceNotFoundLimit<2?0!=a?(this.openStream({video:!0,audio:!1},this.mode),this.inputDeviceNotFoundLimit++):(console.log("Video input not found"),alert("There is no video or audio input")):alert("No input device found, publish is not possible"))})).catch((e=>{console.error("Cannot get devices -> error name: "+e.name+": "+e.message)}))}trackDeviceChange(){navigator.mediaDevices.ondevicechange=()=>{this.getDevices()}}setDesktopwithCameraSource(e,i,t){this.desktopStream=e,this.navigatorUserMedia({video:!0,audio:!1},(a=>{this.smallVideoTrack=a.getVideoTracks()[0];var o=document.createElement("canvas"),s=o.getContext("2d"),r=document.createElement("video");r.srcObject=e,r.play();var d=document.createElement("video");d.srcObject=a,d.play();var n=o.captureStream(15);null==this.localStream?this.gotStream(n):this.updateVideoTrack(n,i,onended,null),null!=t&&(e.getVideoTracks()[0].onended=function(e){t(e)}),setInterval((()=>{o.width=r.videoWidth,o.height=r.videoHeight,s.drawImage(r,0,0,o.width,o.height);var e,i=r.videoWidth*(this.camera_percent/100),t=d.videoHeight/d.videoWidth*i,a=o.width-i-this.camera_margin;e="top"==this.camera_location?this.camera_margin:o.height-t-this.camera_margin,s.drawImage(d,a,e,i,t)}),66)}),!0)}prepareStreamTracks(e,i,t,a){var o=t.getAudioTracks();if(o.length>0&&"camera"==this.publishMode&&(o[0].stop(),t.removeTrack(o[0])),"undefined"!=i&&0!=i){var s={audio:i};this.navigatorUserMedia(s,(s=>{s=this.setGainNodeStream(s);var r=i=>{this.callback("screen_share_stopped"),this.setVideoCameraSource(a,e,null,!0)};"screen"==this.publishMode?(this.updateVideoTrack(t,a,r,!0),o.length>0&&(s=this.mixAudioStreams(t,s)),this.updateAudioTrack(s,a,null)):"screen+camera"==this.publishMode?(o.length>0&&(s=this.mixAudioStreams(t,s)),this.updateAudioTrack(s,a,null),this.setDesktopwithCameraSource(t,a,r)):(0!=i&&null!=i&&t.addTrack(s.getAudioTracks()[0]),this.gotStream(t))}),!0)}else this.gotStream(t)}navigatorUserMedia(e,i,t){return navigator.mediaDevices.getUserMedia(e).then(i).catch((e=>{1==t?"NotFoundError"==e.name?this.getDevices():this.callbackError(e.name,e.message):console.warn(e)}))}navigatorDisplayMedia(e,i){navigator.mediaDevices.getDisplayMedia(e).then(i).catch((e=>{"NotAllowedError"===e.name&&(console.debug("Permission denied error"),this.callbackError("ScreenSharePermissionDenied"),null==this.localStream?this.openStream({video:!0,audio:!0}):this.switchVideoCameraCapture(streamId))}))}getMedia(e,i,t){"screen+camera"==this.publishMode||"screen"==this.publishMode?this.navigatorDisplayMedia(e,(a=>{this.smallVideoTrack&&this.smallVideoTrack.stop(),this.prepareStreamTracks(e,i,a,t)})):this.navigatorUserMedia(e,(a=>{this.smallVideoTrack&&this.smallVideoTrack.stop(),this.prepareStreamTracks(e,i,a,t)}),!0)}openStream(e){this.mediaConstraints=e;var i=!1;void 0!==e.audio&&0!=e.audio&&(i=e.audio),void 0!==e.video?this.getMedia(e,i):(console.error("MediaConstraint video is not defined"),this.callbackError("media_constraint_video_not_defined"))}closeStream(){this.localStream.getVideoTracks().forEach((function(e){e.onended=null,e.stop()})),this.localStream.getAudioTracks().forEach((function(e){e.onended=null,e.stop()})),null!==this.videoTrack&&this.videoTrack.stop(),null!==this.audioTrack&&this.audioTrack.stop(),null!==this.smallVideoTrack&&this.smallVideoTrack.stop(),this.previousAudioTrack&&this.previousAudioTrack.stop(),-1!=this.soundLevelProviderId&&(clearInterval(this.soundLevelProviderId),this.soundLevelProviderId=-1)}checkBrowserScreenShareSupported(){(void 0!==navigator.mediaDevices&&navigator.mediaDevices.getDisplayMedia||navigator.getDisplayMedia)&&this.callback("browser_screen_share_supported")}enableSecondStreamInMixedAudio(e){null!=this.secondaryAudioTrackGainNode&&(this.secondaryAudioTrackGainNode.gain.value=e?1:0)}gotStream(e){this.localStream=e,this.localVideo&&(this.localVideo.srcObject=e)}enableAudioLevelWhenMuted(){navigator.mediaDevices.getUserMedia({video:!1,audio:!0}).then((e=>{this.mutedAudioStream=e;const i=new SoundMeter(this.audioContext);i.connectToSource(this.mutedAudioStream,(e=>{e?alert(e):this.meterRefresh=setInterval((()=>{i.instant.toFixed(2)>.1&&this.callback("speaking_but_muted")}),200)}))})).catch((function(e){console.log("Can't get the soundlevel on mute")}))}disableAudioLevelWhenMuted(){null!=this.meterRefresh&&clearInterval(this.meterRefresh),null!=this.mutedAudioStream&&this.mutedAudioStream.getTracks().forEach((function(e){e.stop()}))}mixAudioStreams(e,i){var t=new MediaStream;e.getVideoTracks().forEach((function(e){t.addTrack(e)})),this.audioContext=new AudioContext;var a=this.audioContext.createMediaStreamDestination();return e.getAudioTracks().length>0?(this.primaryAudioTrackGainNode=this.audioContext.createGain(),this.primaryAudioTrackGainNode.gain.value=1,this.audioContext.createMediaStreamSource(e).connect(this.primaryAudioTrackGainNode).connect(a)):console.debug("Origin stream does not have audio track"),i.getAudioTracks().length>0?(this.secondaryAudioTrackGainNode=this.audioContext.createGain(),this.secondaryAudioTrackGainNode.gain.value=1,this.audioContext.createMediaStreamSource(i).connect(this.secondaryAudioTrackGainNode).connect(a)):console.debug("Second stream does not have audio track"),a.stream.getAudioTracks().forEach((function(e){t.addTrack(e),console.log("audio destination add track")})),t}setGainNodeStream(e){if(0!=this.mediaConstraints.audio&&void 0!==this.mediaConstraints.audio){const i=e.getVideoTracks(),t=e.getAudioTracks();this.audioContext=new AudioContext;let a=this.audioContext.createMediaStreamSource(e),o=this.audioContext.createMediaStreamDestination();this.primaryAudioTrackGainNode=this.audioContext.createGain(),a.connect(this.primaryAudioTrackGainNode),this.primaryAudioTrackGainNode.connect(o),null==this.currentVolume?this.primaryAudioTrackGainNode.gain.value=1:this.primaryAudioTrackGainNode.gain.value=this.currentVolume;const s=o.stream;for(const e of i)s.addTrack(e);for(const e of t)s.addTrack(e);return null!==this.previousAudioTrack&&this.previousAudioTrack.stop(),this.previousAudioTrack=s.getAudioTracks()[1],s}return e}switchDesktopCapture(e){this.publishMode="screen";var i=!1;void 0!==this.mediaConstraints.audio&&0!=this.mediaConstraints.audio&&(i=this.mediaConstraints.audio),void 0!==this.mediaConstraints.video&&0!=this.mediaConstraints.video&&(this.mediaConstraints.video=!0),this.getMedia(this.mediaConstraints,i,e)}switchDesktopCaptureWithCamera(e){void 0!==this.mediaConstraints.video&&0!=this.mediaConstraints.video&&(this.mediaConstraints.video=!0),this.publishMode="screen+camera";var i=!1;void 0!==this.mediaConstraints.audio&&0!=this.mediaConstraints.audio&&(i=this.mediaConstraints.audio),this.getMedia(this.mediaConstraints,i,e)}updateLocalAudioStream(e,i){var t=e.getAudioTracks()[0];if(null!=this.localStream&&null!=this.localStream.getAudioTracks()[0]){var a=this.localStream.getAudioTracks()[0];this.localStream.removeTrack(a),a.stop(),this.localStream.addTrack(t)}else null!=this.localStream?this.localStream.addTrack(t):this.localStream=e;null!=this.localVideo&&(this.localVideo.srcObject=this.localStream),null!=i&&(e.getAudioTracks()[0].onended=function(e){i(e)}),this.isMuted?this.muteLocalMic():this.unmuteLocalMic(),null!=this.localStreamSoundMeter&&this.connectSoundMeterToLocalStream()}updateLocalVideoStream(e,i,t){t&&null!=this.desktopStream&&this.desktopStream.getVideoTracks()[0].stop();var a=e.getVideoTracks()[0];if(null!=this.localStream&&null!=this.localStream.getVideoTracks()[0]){var o=this.localStream.getVideoTracks()[0];this.localStream.removeTrack(o),o.stop(),this.localStream.addTrack(a)}else null!=this.localStream?this.localStream.addTrack(a):this.localStream=e;this.localVideo&&(this.localVideo.srcObject=this.localStream),null!=i&&(e.getVideoTracks()[0].onended=function(e){i(e)})}switchAudioInputSource(e,i){var t=this.localStream.getAudioTracks()[0];if(t?t.stop():console.warn("There is no audio track in local stream"),void 0!==i){!0!==this.mediaConstraints.audio?this.mediaConstraints.audio.deviceId=i:this.mediaConstraints.audio={deviceId:i};let t={video:!1,audio:{deviceId:i}};this.setAudioInputSource(e,t,null,!0,i)}else this.setAudioInputSource(e,this.mediaConstraints,null,!0,i)}setAudioInputSource(e,i,t){return this.navigatorUserMedia(i,(a=>{a=this.setGainNodeStream(a),this.updateAudioTrack(a,e,i,t)}),!0)}switchVideoCameraCapture(e,i,t){var a=this.localStream.getVideoTracks()[0];a?a.stop():console.warn("There is no video track in local stream"),this.publishMode="camera",navigator.mediaDevices.enumerateDevices().then((t=>{for(let e=0;e<t.length;e++)if("videoinput"==t[e].kind&&t[e].deviceId==i){!0!==this.mediaConstraints.video?this.mediaConstraints.video.deviceId={exact:i}:this.mediaConstraints.video={deviceId:{exact:i}};break}console.debug("Given deviceId = "+i+" - Media constraints video property = "+this.mediaConstraints.video),this.setVideoCameraSource(e,this.mediaConstraints,null,!0,i)}))}setVideoCameraSource(e,i,t,a){this.navigatorUserMedia(i,(o=>{a&&this.secondaryAudioTrackGainNode&&o.getAudioTracks().length>0&&(this.secondaryAudioTrackGainNode=null,o=this.setGainNodeStream(o),this.updateAudioTrack(o,e,i,t)),this.cameraEnabled?this.updateVideoTrack(o,e,t,a):this.turnOffLocalCamera()}),!0)}switchVideoCameraFacingMode(e,i){var t=this.localStream.getVideoTracks()[0];t?t.stop():console.warn("There is no video track in local stream"),void 0!==this.mediaConstraints.video&&void 0!==this.mediaConstraints.video.deviceId&&delete this.mediaConstraints.video.deviceId;var a={facingMode:i};this.mediaConstraints.video=Object.assign({},this.mediaConstraints.video,a),this.publishMode="camera",console.debug("Media constraints video property = "+this.mediaConstraints.video),this.setVideoCameraSource(e,{video:this.mediaConstraints.video},null,!0)}updateAudioTrack(e,i,t){var a=this.getSender(i,"audio");a?a.replaceTrack(e.getAudioTracks()[0]).then((i=>{this.updateLocalAudioStream(e,t)})).catch((function(e){console.log(e.name)})):this.updateLocalAudioStream(e,t)}updateVideoTrack(e,i,t,a){var o=this.getSender(i,"video");o?o.replaceTrack(e.getVideoTracks()[0]).then((i=>{this.updateLocalVideoStream(e,t,a)})).catch((e=>{console.log(e.name)})):this.updateLocalVideoStream(e,t,a)}initializeDummyFrame(){this.dummyCanvas.getContext("2d").fillRect(0,0,320,240),this.replacementStream=this.dummyCanvas.captureStream()}turnOffLocalCamera(e){if(this.initializeDummyFrame(),null!=this.localStream){let i;i=null!=e||void 0!==e?e:this.publishStreamId,this.cameraEnabled=!1,this.updateVideoTrack(this.replacementStream,i,null,!0)}else this.callbackError("NoActiveConnection");null==this.blackFrameTimer&&(this.blackFrameTimer=setInterval((()=>{this.initializeDummyFrame()}),3e3))}turnOnLocalCamera(e){null!=this.blackFrameTimer&&(clearInterval(this.blackFrameTimer),this.blackFrameTimer=null),null==this.localStream?this.navigatorUserMedia(this.mediaConstraints,(e=>{this.gotStream(e)}),!1):this.navigatorUserMedia(this.mediaConstraints,(i=>{let t;t=null!=e||void 0!==e?e:this.publishStreamId,this.cameraEnabled=!0,this.updateVideoTrack(i,t,null,!0)}),!1)}muteLocalMic(){this.isMuted=!0,null!=this.localStream?this.localStream.getAudioTracks().forEach((e=>e.enabled=!1)):this.callbackError("NoActiveConnection")}unmuteLocalMic(){this.isMuted=!1,null!=this.localStream?this.localStream.getAudioTracks().forEach((e=>e.enabled=!0)):this.callbackError("NoActiveConnection")}getVideoSender(e){var i=null;return"undefined"!=typeof adapter&&null!==adapter&&("chrome"===adapter.browserDetails.browser||"firefox"===adapter.browserDetails.browser||"safari"===adapter.browserDetails.browser&&adapter.browserDetails.version>=64)&&"RTCRtpSender"in window&&"setParameters"in window.RTCRtpSender.prototype&&(i=this.getSender(e,"video")),i}changeBandwidth(e,i){var t=this.getVideoSender(i);if(null!=t){const i=t.getParameters();return i.encodings||(i.encodings=[{}]),"unlimited"===e?delete i.encodings[0].maxBitrate:i.encodings[0].maxBitrate=1e3*e,t.setParameters(i)}return"Video sender not found to change bandwidth. Streaming may not be active",Promise.reject("Video sender not found to change bandwidth. Streaming may not be active")}setVolumeLevel(e){this.currentVolume=e,null!=this.primaryAudioTrackGainNode&&(this.primaryAudioTrackGainNode.gain.value=e),null!=this.secondaryAudioTrackGainNode&&(this.secondaryAudioTrackGainNode.gain.value=e)}enableAudioLevelForLocalStream(e,i){this.localStreamSoundMeter=new SoundMeter(this.audioContext),this.connectSoundMeterToLocalStream(),this.soundLevelProviderId=setInterval((()=>{e(this.localStreamSoundMeter.instant.toFixed(2))}),i)}connectSoundMeterToLocalStream(){this.localStreamSoundMeter.connectToSource(this.localStream,(function(e){e&&alert(e)}))}applyConstraints(e,i){this.applyConstraints(i)}applyConstraints(e){var i={};void 0===e.audio&&void 0===e.video?(i.video=e,this.mediaConstraints.video=Object.assign({},this.mediaConstraints.video,i.video)):void 0!==e.video&&(i.video=e.video,this.mediaConstraints.video=Object.assign({},this.mediaConstraints.video,i.video)),void 0!==e.audio&&(i.audio=e.audio,this.mediaConstraints.audio=Object.assign({},this.mediaConstraints.audio,i.audio));var t=null;return void 0!==i.video&&(t=this.localStream&&this.localStream.getVideoTracks().length>0?this.localStream.getVideoTracks()[0].applyConstraints(this.mediaConstraints.video):new Promise(((e,i)=>{i("There is no video track to apply constraints")}))),void 0!==i.audio&&(t=this.setAudioInputSource(streamId,{audio:this.mediaConstraints.audio},null)),t}}