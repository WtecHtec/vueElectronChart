import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    NimWeb: null,
    accid: null,
    token: null,
    appKey: 'a8ffc22c406f858806f8ec5cd6bdc695'
  },
  getters: {
    getNimWeb(state) {
      return state.NimWeb
    },
    getAccId(state) {
      return state.accid
    },
    getToken(state) {
      return state.token
    },
    getAppKey(state) {
      return state.appKey
    }
  },
  mutations: {
    setNimWeb(state, nimWeb) {
      state.NimWeb = nimWeb
    },
    setAccId(state, accid) {
      state.accid = accid
    },
    setToken(state, token) {
      state.token = token
    }
  },
  actions: {
    setNimWeb({commit, state}, nimWeb) {
      // 跟后台打交道
      // 调用mutaions里面的方法
      commit('setNimWeb', nimWeb)
    },
    setAccId({commit, state}, accid) {
      // 跟后台打交道
      // 调用mutaions里面的方法
      commit('setAccId', accid)
    },
    setToken({commit, state}, token) {
      // 跟后台打交道
      // 调用mutaions里面的方法
      commit('setToken', token)
    }
  }
})
