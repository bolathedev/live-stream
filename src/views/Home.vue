<template>
  <q-layout>
    <div class flat style="width: 100%">
      <q-toolbar class="bg-primary text-white shadow-2">
        <q-toolbar-title>Live Streams</q-toolbar-title>
      </q-toolbar>

      <q-list bordered>
        <q-item
          class="q-my-sm"
          clickable
          v-ripple
          v-if="streams.length < 1"
          @click="create_stream = !create_stream"
        >
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white">
              <q-icon name="add" color="white" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>No live Streams</q-item-label>
            <q-item-label caption lines="1">Create One</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-icon name="add" color="primary" />
          </q-item-section>
        </q-item>
        <q-item v-for="(stream, i) in streams" :key="i" class="q-my-sm" clickable v-ripple :to="{ name: 'stream', params: {id: stream.id} }">
          <q-item-section avatar>
            <q-icon name="rss_feed" color="primary" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ stream.name }}</q-item-label>
            <q-item-label caption lines="1">Started At {{ stream.createdAt.toDate().toLocaleString() }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-icon name="chevron_right" color="primary" />
          </q-item-section>
          <q-separator />
        </q-item>
      </q-list>
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn
          fab
          icon="add"
          @click="create_stream = !create_stream"
          v-if="streams.length > 0"
          color="primary"
        />
      </q-page-sticky>
    </div>
    <q-dialog v-model="create_stream" :persistent="loading">
      <q-card style="width: 500px">
        <br />
        <div class="text-h6" style="text-align: center">Start A live Stream</div>
        <br />
        <q-card-section>
          <form>
            <div class="form-group">
              <q-input outlined label="Name of Stream" v-model="name" placeholder="Broadcast name" />
            </div>
            <br />
            <q-card-actions align="right">
              <q-btn v-close-popup flat :disable='loading'>Cancel</q-btn>
              <q-btn :loading="loading" @click="createStream" :disable='loading ? loading : !name' flat>Start Streaming</q-btn>
            </q-card-actions>
          </form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import StreamPlayer from "./About";
export default {
  components: {
    StreamPlayer
  },
  data() {
    return {
      loading: false,
      disableJoin: false,
      localStream: null,
      remoteStreams: [],
      streams: [],
      name: "",
      create_stream: false,
      offline: [
        {
          id: 5,
          name: "Brunhilde Panswick",
          email: "bpanswick4@csmonitor.com",
          avatar: "avatar2.jpg"
        },
        {
          id: 6,
          name: "Winfield Stapforth",
          email: "wstapforth5@pcworld.com",
          avatar: "avatar6.jpg"
        }
      ]
    };
  },
  props: {
    msg: String
  },

  methods: {
    getStreams() {
      this.$db
        .collection("streams")
        .where("status", "==", "live")
        .onSnapshot(querySnapshot => {
          console.log(querySnapshot);
          if (querySnapshot.empty) {
            return;
          }
          this.streams = [];
          querySnapshot.forEach(doc => {
            let data = {
              id: doc.data().id,
              name: doc.data().name,
              createdAt: doc.data().createdAt
            };
            this.streams.push(data);
          });
        });
    },
    createStream() {
      this.loading = true;
      const batch = this.$db.batch();
      const streamRef = this.$db.collection("streams").doc();
      console.log(streamRef);
      batch.set(streamRef, {
        name: this.name,
        id: streamRef.id,
        createdAt: this.$firebase.firestore.FieldValue.serverTimestamp(),
        status: "live"
      });

      batch.commit().then(doc => {
        localStorage.setItem(this.name, streamRef.id)
        this.$router.push({
          path: "/stream",
          params: {
            id: streamRef.id
          }
        });
      });
      this.loading = false;
    }
  },
  created() {
    this.getStreams();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.agora-box {
}
.agora-title {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  color: #2c3e50;
}
.agora-view {
  display: flex;
  flex-wrap: wrap;
}
.agora-video {
  width: 320px;
  height: 240px;
  margin: 20px;
}
.agora-input {
  margin: 20px;
  width: 320px;
}
.agora-text {
  margin: 5px;
  font-size: 16px;
  font-weight: bold;
}
.agora-button {
  display: flex;
  width: 160px;
  justify-content: space-between;
  margin: 20px;
}
.agora-video {
  width: 320px;
  height: 240px;
}
</style>
