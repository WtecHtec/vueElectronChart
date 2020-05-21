import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Chat from '@/components/Chatroom'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Home
    },
    {
      path: '/Chat',
      name: 'Chat',
      component: Chat
    }
  ]
})
