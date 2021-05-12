<template>
  <div>
    <!-- <div id="user-video-1" style="height: 100vh; width:  100vw; position:  absolute"></div>
    <div id="user-video-2" style="height: 100px; width:  100px; position:  relative"></div>
    <div id="user-video-3" style="height: 100px; width:  100px; position:  relative"></div>
    <div id="user-video-4" style="height: 100px; width:  100px; position:  relative"></div>-->
    <!-- <div style="position: relative">
      <el-button type="primary" @click="leaveEvent" v-if="joined" plain>leave</el-button>
    </div>
    <div class="agora-view">
      <div class="agora-video" v-if="joined"></div>
    </div>-->
    <div class="hello">
      <el-button type="primary" @click="joinEvent" :disabled="disableJoin">join</el-button>
      <el-button type="primary" @click="leaveEvent" plain :disabled="!disableJoin">leave</el-button>
      <div class="agora-view">
        <div class="agora-video">
          <StreamPlayer :stream="localStream" :domId="localStream.getId()" v-if="localStream"></StreamPlayer>
        </div>
        <div class="agora-video">
          <StreamPlayer
            :key="index"
            v-for="(remoteStream, index) in remoteStreams"
            :stream="remoteStream"
            :domId="remoteStream.getId()"
          ></StreamPlayer>
        </div>
      </div>
    </div>
    <q-dialog v-model="isLoading">
      <q-card flat class="loader">
        <q-circular-progress
          indeterminate
          size="50px"
          :thickness="0.2"
          color="blue"
          track-color="transparent"
        />
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import RTCClient from "../agora";
import { log } from "../utils/utils";
import StreamPlayer from '../components/streamplayer'
export default {
  data() {
    return {
      option: {
        appid: "d3fa0e985f114b0a9876aa4dcfffc0c1",
        token: "",
        uid: null,
        channel: "",
        mainVideoId: "user-video-1"
      },
      joined: false,
      isLoading: false,
      localStream: null,
      remoteStreams: [],
      disableJoin: false
    };
  },
  components:{
    StreamPlayer
  },
  methods: {
    joinEvent() {
      this.option.appid = "d3fa0e985f114b0a9876aa4dcfffc0c1";
      console.log(this.option);
      if (!this.option.appid) {
        this.judge("Appid");
        return;
      }
      if (!this.option.channel) {
        this.judge("Channel Name");
        return;
      }
      this.isLoading = true;
      this.rtc
        .joinChannel(this.option)
        .then(() => {
          this.$message({
            message: "Join Success",
            type: "success"
          });
          this.rtc
            .publishStream()
            .then(stream => {
              this.$message({
                message: "Publish Success",
                type: "success"
              });
              this.localStream = stream;
              this.isLoading = false;
              this.remoteStreams.push(this.localStream);
            })
            .catch(err => {
              this.$message.error("Publish Failure");
              log("publish local error", err);
            });
        })
        .catch(err => {
          this.$message.error("Join Failure");
          log("join channel error", err);
        });
      this.disableJoin = true;
    },
    leaveEvent() {
      this.disableJoin = false;
      this.rtc
        .leaveChannel()
        .then(() => {
          this.$router.push('/')
          this.$message({
            message: "Leave Success",
            type: "success"
          });
        })
        .catch(err => {
          this.$message.error("Leave Failure");
          log("leave error", err);
        });
      this.localStream = null;
      this.remoteStreams = [];
    },
    judge(detail) {
      this.$notify({
        title: "Notice",
        message: `Please enter the ${detail}`,
        position: "top-left",
        type: "warning"
      });
    }
  },
  created() {
    this.option.channel = this.$route.params.id;
    this.rtc = new RTCClient(this.option);
    this.$db
      .collection("streams")
      .doc(this.$route.params.id)
      .onSnapshot(doc => {
        // this.option.channel = doc.data().name;
      });

    // log(this.rtc.token);
    this.option.token = this.rtc.token;
    this.option.appid = this.rtc.appId;
    console.log(this.option);
    this.joinEvent();
    let rtc = this.rtc;
    rtc.on("stream-added", evt => {
      let { stream } = evt;
      log("[agora] [stream-added] stream-added", stream.getId());
      console.log(stream);
      rtc.client.subscribe(stream);
    });

    rtc.on("stream-subscribed", evt => {
      let { stream } = evt;
      log("[agora] [stream-subscribed] stream-added", stream.getId());
      if (!this.remoteStreams.find(it => it.getId() === stream.getId())) {
        this.remoteStreams.push(stream);
      }
    });
    rtc.on("stream-removed", evt => {
      let { stream } = evt;
      log("[agora] [stream-removed] stream-removed", stream.getId());
      this.remoteStreams = this.remoteStreams.filter(
        it => it.getId() !== stream.getId()
      );
    });
    rtc.on("peer-online", evt => {
      this.$message(`Peer ${evt.uid} is online`);
    });
    rtc.on("peer-leave", evt => {
      this.$message(`Peer ${evt.uid} already leave`);
      this.remoteStreams = this.remoteStreams.filter(
        it => it.getId() !== evt.uid
      );
    });
  }
};
</script>

<style>
body {
  margin: 0 auto;
}
.loader {
  background: inherit;
  overflow: hidden;
}
.loader::-webkit-scrollbar {
  display: none;
}
</style>
