<template>
  <div id="app">

    <video ref="video" height="300" width="400" controls autoplay></video>
    <button @click="screenShot()">截图</button>
    <br>
    <hr>

    <div v-if="imgList.length">
      <div v-for="(item, index) in imgList" :key="index">
        <img :id="'img' + index" class="img" :src="item" @click="cutPhoto('img' + index)">
        <button @click="saveCutImg()">裁剪并发送</button>
      </div>
    </div>

  </div>
</template>

<script>
import flvjs from 'flv.js'
import Cropper from 'cropperjs'
import io from 'socket.io-client';

export default {
  name: 'App',
  components: {},
  data() {
    return {
      url: 'http://localhost:8002/live/test.flv',
      imgList: [],
      cropperjs: null,
      socket: io('ws://localhost:3002')
    }
  },
  mounted() {
    this.viedoInit(this.url)
    console.log(this.socket);
  },
  methods: {
    // 视频播放初始化
    viedoInit(url) {
      if (flvjs.isSupported()) {
        let videoElement = this.$refs.video;
        let flvPlayer = flvjs.createPlayer({
          type: 'flv',
          url: url
        });
        flvPlayer.attachMediaElement(videoElement);
        flvPlayer.load();
        flvPlayer.play();
      }
    },
    // 视频截图
    screenShot() {
      let videoElement = this.$refs.video;
      let canvas = document.createElement('canvas')
      let width = window.innerWidth
      let height = (window.innerHeight / 16) * 9
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(videoElement, 0, 0, width, height)
      this.imgList.push(canvas.toDataURL('image/png'))
    },
    // 图片裁剪
    cutPhoto(id) {
      let img = document.getElementById(id)
      this.cropperjs = new Cropper(img, {
        aspectRatio: 16 / 16,
        viewMode: 0,
        minContainerWidth: 500,
        minContainerHeight: 500,
        dragMode: 'move',
        crop() { },
      });
    },
    // 保存裁剪图片
    saveCutImg() {
      let _this = this
      if (this.cropperjs == null) {
        alert('点击图片进行裁剪')
        return
      }
      //getCroppedCanvas方法可以将裁剪区域的数据转换成canvas数据
      this.cropperjs.getCroppedCanvas({
        maxWidth: 4096,
        maxHeight: 4096,
        fillColor: '#fff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      }).toBlob((blob) => {
        let f = new FileReader()
        f.readAsDataURL(blob)
        f.onload = function () {
          // 发送图片等数据
          _this.sendData(f.result)
        }
      })
      this.cropperjs.destroy()
    },
    sendData(file) {
      console.log(file);
      this.socket.emit('image', file)
    }
  }
}
</script>

<style>
@import '../node_modules/cropperjs/dist/cropper.min.css';

* {
  margin: 0;
  padding: 0;
}

#app {
  width: 100%;
}

.img {
  width: 300px;
  height: auto;
  display: block;
  max-width: 100%;
}
</style>
