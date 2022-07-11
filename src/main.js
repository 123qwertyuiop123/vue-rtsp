import Vue from 'vue'
import App from './App.vue'
import VueSocketIO from 'vue-socket.io'
import SocketIO from 'socket.io-client'

Vue.config.productionTip = false

Vue.use(new VueSocketIO({
  debug: true,
  connection: SocketIO.connect('ws://localhost:3002', {
    path: '',
    // autoConnect: false,
    transports: ['websocket', 'xhr-polling', 'jsonp-polling']
  })

}))

new Vue({
  sockets: {
    // 可以用来测试 是否链接成功了
    connect: function () {
      console.log('链接成功')
    },
  },
  render: h => h(App),
}).$mount('#app')
