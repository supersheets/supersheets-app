import Vue from 'vue'
import Vuex from 'vuex'

const axios = require('axios')
const uuidV4 = require('uuid/v4')
const { convertSpreadsheetToSchemaTables } = require('@/lib/schemautil.js') 
const wait = ms => new Promise((r, j)=>setTimeout(r, ms))

Vue.use(Vuex)

// Auth0 Configuration
// import auth0 from 'auth0-js'

// const config = {
//   domain: process.env.VUE_APP_AUTH0_DOMAIN,
//   clientID: process.env.VUE_APP_AUTH0_CLIENTID,
//   redirectUri: `${process.env.VUE_APP_DOMAIN}/callback`,
//   audience: process.env.VUE_APP_AUTH0_AUDIENCE, 
//   responseType: 'token id_token',
//   scope: 'openid profile email'
// }
// const webAuth = new auth0.WebAuth(config)

// Google OAuth Configuration
import { initGoogleOAuth } from './lib/oauth'
const GOOGLE_BASE_CONFIG = {
  'client_id': process.env.VUE_APP_GOOGLE_CLIENTID,
  'scope': 'profile email'
}

export default new Vuex.Store({
  state: {
    GoogleAuth: null,
    user: null,
    sheet: { title: "Loading ..." },
    cache: null,
    axios: axios.create({
      baseURL: process.env.VUE_APP_SUPERSHEETSIO_ENDPOINT,
      // timeout: 1000,
      // headers: { 'X-Custom-Header': 'foobar'}
    }),
    notifications: [ ],
    mode: process.env.VUE_APP_MODE,
    loadstatus: { num_sheets_loaded: 0, num_sheets_total: -1, message: "Loading ...", sheets_loaded: [ ] },
  },
  getters: {
    isAuthenticated: (state, getters) => {
      return state.user
    },
    isTokenValid: (state, getters) => {
      return state.user && state.user.expiresAt > (Date.now() + 5 * 60 * 1000)
    },
    idptoken: (state, getters) => {
      return state.user && state.user.token
    },
    supersheetsbaseurl: (state, getter) => {
      return process.env.VUE_APP_SUPERSHEETSIO_ENDPOINT
    },
    graphqlendpoint: (state, getter) => {
      if (!state.sheet.id) return null
      return `${process.env.VUE_APP_SUPERSHEETSIO_ENDPOINT}/${state.sheet.id}/graphql`
    },
    schemas: (state, getter) => {
      return state.sheet.id && convertSpreadsheetToSchemaTables(state.sheet) || null
    }
  },
  mutations: {
    setGoogleAuth(state, GoogleAuth) {
      if (GoogleAuth && GoogleAuth.isSignedIn.get()) {
        state.GoogleAuth = GoogleAuth
        let user = GoogleAuth.currentUser.get()
        let profile = user.getBasicProfile()
        let auth = user.getAuthResponse()
        state.user = {
          email: profile.getEmail(),
          name: profile.getName(),
          sub: profile.getId(),
          provider: 'google',
          domain: user.getHostedDomain(),
          token: auth.id_token,
          issuedAt: auth.first_issued_at,
          expiresIn: auth.expires_in,
          expiresAt: auth.expires_at,
          family_name: profile.getFamilyName(),
          given_name: profile.getGivenName(),
          image_url: profile.getImageUrl(),
        }
        state.axios.defaults.headers.common['Authorization'] = `Bearer ${state.user.token}`
      }
    },
    logoutUser(state) {
      state.user = null 
      delete state.axios.defaults.headers.common['Authorization']
      return
    },
    setSheet(state, sheet) {
      state.sheet = sheet
    },
    setCache(state, cache) {
      state.cache = cache
    },
    clearLoadStatus(state) {
      state.loadstatus = { num_sheets_loaded: 0, num_sheets_total: -1, message: "Loading ...", sheets_loaded: [ ] }
    },
    updateLoadStatus(state, status) {
      let old_sheets_loaded = state.loadstatus.sheets_loaded
      if (status.sheets_loaded && (status.sheets_loaded.length > state.loadstatus.sheets_loaded.length)) {
        status.message = `Loaded sheets: ${status.sheets_loaded.slice(state.loadstatus.sheets_loaded.length).join(', ')}`
      }
      Object.assign(state.loadstatus, status)
    },
    // NOTIFICATIONS
    addNotification(state, { message, level }) {
      let note = {
        uuid: uuidV4(),
        message: message,
        classObject: { 'notification': true, 'show': true }
      }
      note.classObject[`is-${level || 'info' }`] = true
      state.notifications.push(note)
      setTimeout(() => {
        note.classObject['show'] = false
        state.notifications = state.notifications.filter(n => n.uuid != note.uuid)
      }, 5000)
    },
    removeNotification(state, uuid) {
      state.notifications = state.notifications.filter(note => note.uuid != uuid)
    }
  },
  actions: {
    // GOOGLE OAUTH
    async initGoogleOAuth({dispatch, commit, state, getters}, { gapi, options }) {
      options = Object.assign(options || { }, GOOGLE_BASE_CONFIG)
      let GoogleAuth = await initGoogleOAuth(gapi, options)
      commit('setGoogleAuth', GoogleAuth)
    },
    async login({dispatch, commit, state, getters}, { returnTo }) {
      let stateData = btoa(JSON.stringify({ returnTo: returnTo || '/sheets' }))
      if (state.GoogleAuth) {
        state.GoogleAuth.signIn({
          prompt: 'select_account',
          scope: 'profile email',
          ux_mode: 'redirect',
          redirect_uri: `${process.env.VUE_APP_DOMAIN}/callback`,
          state: stateData
        })
      }
    },
    async logout({dispatch, commit, state, getters}, params) {
      console.log(state.GoogleAuth)
      await state.GoogleAuth.signOut()
      commit('logoutUser')
      return true
    },
    async handleAuthentication({dispatch, commit, state, getters}, { params }) {
      while (!state.user) {
        await wait(250)
        console.log('wait')
      }
      let stateData = (new URLSearchParams(params)).get('state')
      let { returnTo } = stateData && JSON.parse(atob(stateData)) || { returnTo: '/sheets' }
      return { user: state.user, returnTo }
    },
    async checkSession({dispatch, commit, state, getters}, force) {
      if (force || !getters.isTokenValid()) {
        let reload = await state.GoogleAuth.currentUser.get().reloadAuthResponse()
        console.log('reload', reload)
        commit('setGoogleAuth', state.GoogleAuth)
      } else {
        console.log('token still valid')
      }
    },
    // SHEET ACTIONS
    async getSheets({dispatch, commit, state, getters}) {
      let sheets = (await state.axios.get(`sheets`)).data
      return sheets
    },
    async getSheet({dispatch, commit, state, getters}, { id, force }) {
      let sheet = (await state.axios.get(`${id}`)).data
      if (!sheet || !sheet.id) {
        commit('setSheet', { title: "Not Found" })
        return
      }
      commit('setSheet', sheet)
      let cache = await dispatch('getCacheInfo', { id })
      commit('setCache', cache)
      return state.sheet
    },
    async startLoad({dispatch, commit, state, getters}, { id }) {
      commit('updateLoadStatus', { message: "Loading ..." })
      let body = { token: getters.idptoken }
      let status = (await state.axios.post(`${id}/load`, body)).data
      commit('updateLoadStatus', { message: `Load started ...` })
      return status
    },
    async checkLoadStatus({dispatch, commit, state, getters}, { id, uuid }) {
      let status = (await state.axios.get(`${id}/load/${uuid}`)).data
      commit('updateLoadStatus', { num_sheets_loaded: status.num_sheets_loaded, sheets_loaded: status.sheets_loaded })
      return status
    },
    async endLoad({dispatch, commit, state, getters}, { id }) {
      await dispatch('deleteCache', { id })
      await dispatch('getSheet', { id })
    },
    async deleteSheet({dispatch, commit, state, getters}, { id }) {
      let res = (await state.axios.delete(`${id}`)).data
      commit('setSheet', { title: "Loading ..." })
      let deleteCache = await dispatch('deleteCache', { id })
      return { delete: res, deleteCache }
    },
    async saveSheet({dispatch, commit, state, getters}, { id, metadata }) {
      let sheet = (await state.axios.patch(`${id}`, metadata)).data
      commit('setSheet', sheet)
      return sheet
    },
    // CACHE ACTIONS
    async deleteCache({dispatch, commit, state, getters}, { id }) {
      try {
        let del = (await state.axios.delete(`${id}/find/cache`)).data
        let cache = { n: 0, ttl: -1, key: null }
        commit('setCache', cache)
        return cache
      } catch (err) {
        if (err.response.status == 404) {
          // this just means the cache is not initialized so we just don'
          let cache = { n: 0, ttl: -1, key: null }
          commit('setCache', cache)
          return cache
        } else {
          throw err
        }
      }
    },
    async getCacheInfo({dispatch, commit, state, getters}, { id, values }) {
      let url = `${id}/find/cache`
      if (values) {
        url = `${url}?values=true`
      }
      try {
        let info = (await state.axios.get(url)).data
        commit('setCache', info)
        return info
      } catch (err) {
        if (err.response.status == 404) {
          // this just means the cache is not initialized so we just don'
          return { n: 0, ttl: -1, key: null }
        } else {
          throw err
        }
      }
    },
    // GOOGLE PICKER ACTIONS
    async showGooglePicker({dispatch, commit, state, getters}, { google, callback }) {
      let view = new google.picker.DocsView()
      view.setIncludeFolders(true)
      view.setSelectFolderEnabled(false)
      let picker =  new google.picker.PickerBuilder()
        .addView(google.picker.ViewId.SPREADSHEETS)
        .addView(view)
        .addView(google.picker.ViewId.RECENTLY_PICKED)
        .setOAuthToken(getters.idptoken)
        .setCallback(callback)
        .build()
      picker.setVisible(true)
    }
  }
})

