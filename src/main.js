// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import httpRequest from './util/request'
import store from './store/index.js'
Vue.use(ElementUI)

Vue.config.productionTip = false
Vue.prototype.http = httpRequest
Vue.prototype.$store = store
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: creator => creator(App)
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
