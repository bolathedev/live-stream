<template>
<div>
    <div id="user-video-1" style="height: 100vh; width:  100vw; position:  absolute"></div>
    <!-- <div id="user-video-2" style="height: 100px; width:  100px; position:  relative"></div>
    <div id="user-video-3" style="height: 100px; width:  100px; position:  relative"></div>
    <div id="user-video-4" style="height: 100px; width:  100px; position:  relative"></div> -->
    <div style="position: relative">
      <el-button type="primary" @click="leaveEvent" v-if="joined" plain>leave</el-button>
    </div>
    <div class="agora-view">
      <div class="agora-video" v-if="joined"></div>
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
  </div>
</template>

<script>
import RTCClient from "../agora";
import { log } from "../utils/utils";
export default {
  data() {
    return {
      option: {
        appid: "",
        token: "",
        uid: null,
        channel: "",
        mainVideoId: "user-video-1"
      },
      joined: false,
      isLoading: false
    };
  },
  methods: {
    joinEvent() {
      if (!this.option.channel) {
        this.judge("Channel Name");
        return;
      }
      this.isLoading = true;
      this.rtc
        .join()
        .then(response => {
          this.isLoading = false;
          this.joined = true;
          this.$message({
            message: "Join Success",
            type: "success"
          });
        })
        .catch(err => {
          this.$message.error("Join Failure");
          log("join channel error", err);
        });
      //   this.disableJoin = true;
    },
    leaveEvent() {
      this.rtc
        .leave()
        .then(() => {
          this.joined = false;
          this.$message({
            message: "Leave Success",
            type: "success"
          }); 
          this.$router.push('/')
        })
        .catch(err => {
          this.$message.error("Leave Failure");
          log("leave error", err);
        });
      //   this.localStream = null;
      //   this.remoteStreams = [];
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
        this.joinEvent();
      });
    console.log(this.option);

    // log(this.rtc.token);
    this.option.token = this.rtc.token;
    this.option.appid = this.rtc.appId;
    let rtc = this.rtc;
    rtc.on("stream-added", evt => {
      let { stream } = evt;
      log("[agora] [stream-added] stream-added", stream.getId());
      console.log(stream)
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
