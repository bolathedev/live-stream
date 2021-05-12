<template>
  <div class="agora-video-player absolute-top" ref="player" :id="domId"></div>
</template>

<script>
export default {
  name: "stream-player",
  props: ["stream", "domId"],
  mounted() {
    this.$nextTick(function() {
      if (this.stream && !this.stream.isPlaying()) {
        this.stream.play(`${this.domId}`, err => {
          if (err && err.status !== "aborted") {
            console.warn("trigger autoplay policy");
          }
        });
      }
    });
  },
  beforeDestroy() {
    if (this.stream) {
      if (this.stream.isPlaying()) {
        this.stream.stop();
      }
      this.stream.close();
    }
  }
};
</script>

<style>
.agora-video-player {
  height: 200px;
  width: 200px;
  top: 0;
}
</style>
