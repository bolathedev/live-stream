import EventEmitter from "events";
import AgoraRTC from "agora-rtc-sdk-ng";

export default class Communication {
  constructor({ channel, uid, mainVideoId, secondaryVideoId, token }) {
    this.appId = "d3fa0e985f114b0a9876aa4dcfffc0c1";
    this.option = {
      channel,
      uid,
      token: token || "",
      mainVideoId,
      secondaryVideoId: secondaryVideoId || "",
    };
    this.localTracks = {
      videoTrack: null,
      audioTrack: null,
    };
    this.remoteUsers = {};
    this.client = null;
    this.localStream = null;
    this._eventBus = new EventEmitter();
    // this.mediaStreamRecorder = new MediaStream()
    this.allStreams = [];
  }

  async join() {
    // create Agora client
    try {
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });
      this.client = client;
      this.clientListener();
      await client.setEncryptionConfig("aes-128-xts", "83839");
      await client.join(
        this.appId,
        this.option.channel,
        this.option.token || null
      );
      this.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      this.localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: "720p_1",
      });
      // play local video track
      this.localTracks.videoTrack.play(this.option.mainVideoId);
      await client.publish(Object.values(this.localTracks));
      this.appendTrack(this.localTracks.audioTrack);
    } catch (error) {
      return error;
    }
  }

  clientListener() {
    const client = this.client;

    client.on("user-published", (user, mediaType) => {
      // The stream is added to the channel but not locally subscribed
      this._eventBus.emit("user-published", { user, mediaType });
    });
    client.on("user-unpublished", (user) => {
      // The stream is added to the channel but not locally subscribed
      this._eventBus.emit("user-unpublished", { user });
    });
    client.on("stream-added", (evt) => {
      // The stream is added to the channel but not locally subscribed
      this._eventBus.emit("stream-added", evt);
      console.log(evt);
    });
    // client.on("stream-subscribed", (evt) => {
    //   this._eventBus.emit("stream-subscribed", evt);
    // });
    // client.on("stream-removed", (evt) => {
    //   this._eventBus.emit("stream-removed", evt);
    // });
    // client.on("peer-online", (evt) => {
    //   this._eventBus.emit("peer-online", evt);
    // });
    // client.on("peer-leave", (evt) => {
    //   this._eventBus.emit("peer-leave", evt);
    // });
  }

  on(eventName, callback) {
    this._eventBus.on(eventName, callback);
  }

  async subscribe(user, mediaType) {
    // const uid = user.uid;
    const remoteUsersCount = Object.keys(this.remoteUsers).length;
    // subscribe to a remote user
    if (remoteUsersCount < 5) {
      await this.client.subscribe(user);
      if (mediaType !== "audio") {
        if (remoteUsersCount <= 1) {
          user.videoTrack.play(this.option.mainVideoId);
        } else {
          user.videoTrack.play(`user-video-${remoteUsersCount}`);
        }
      }
      if (mediaType !== "video") {
        user.audioTrack.play();
        this.appendTrack(user.audioTrack);
      }
      const id = user.uid;
      this.remoteUsers[id] = user;
    }
  }

  async leave() {
    for (const trackName in this.localTracks) {
      const track = this.localTracks[trackName];
      if (track) {
        track.stop();
        track.close();
        this.localTracks[trackName] = undefined;
      }
    }

    // remove remote users and player views
    this.remoteUsers = {};

    // leave the channel
    await this.client.leave();

    // console.log('client leaves channel success')
  }

  // startRecording() {
  //   console.info('Start Record')

  //   const recorder = RecordRTC(this.allStreams, {
  //     type: 'audio',
  //     mimeType: 'audio/wav',
  //   })
  //   recorder.startRecording()
  //   setTimeout(() => {
  //     recorder.stopRecording(() => {
  //       const blob = recorder.getBlob()
  //       invokeSaveAsDialog(blob, 'interview.weba')
  //     })
  //   }, 10000)
  // }

  appendTrack(mediaTrack) {
    const mediaStreamRecorder = new MediaStream();
    mediaStreamRecorder.addTrack(mediaTrack._originMediaStreamTrack);
    this.allStreams = [mediaStreamRecorder, ...this.allStreams];
  }
}
