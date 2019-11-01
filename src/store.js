import Vue from 'vue'
import Vuex from 'vuex'

const axios = require('axios')
const uuidV4 = require('uuid/v4')
const { convertSpreadsheetToSchemaTables } = require('@/lib/schemautil.js') 

Vue.use(Vuex)

// Auth0 Configuration
import auth0 from 'auth0-js'

const config = {
  domain: process.env.VUE_APP_AUTH0_DOMAIN,
  clientID: process.env.VUE_APP_AUTH0_CLIENTID,
  redirectUri: `${process.env.VUE_APP_DOMAIN}/callback`,
  audience: process.env.VUE_APP_AUTH0_AUDIENCE, 
  responseType: 'token id_token',
  scope: 'openid profile email'
}
const webAuth = new auth0.WebAuth(config)

export default new Vuex.Store({
  state: {
    user: null,
    account: null,
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
    idptoken: (state, getters) => {
      if (!state.account) return null
      return getGoogleIDPTokenFromAccount(state.account)
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
    setUser(state, auth) {
      state.user = {
        email: auth.idTokenPayload.email,
        name: auth.idTokenPayload.name,
        sub: auth.idTokenPayload.sub,
        provider: auth.idTokenPayload.sub.split('|')[0],
        domain: calcUserDomain(auth.idTokenPayload),
        token: auth.idToken, // so backend gets user info like email, 
        expiresIn: auth.expiresIn,
        expiresAt: calcExpiresAt(new Date(), auth.expiresIn),
      }
      state.axios.defaults.headers.common['Authorization'] = `Bearer ${state.user.token}`
    },
    setAccount(state, account) {
      state.account = account
      //state.axios.defaults.headers.common['X-Supersheets-IDP-Authorization'] = `Bearer ${getGoogleIDPTokenFromAccount(state.account)}`
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
    // AUTHENTICATION ACTIONS
    async login({dispatch, commit, state, getters}, { returnTo }) {
      var stateData = btoa(JSON.stringify({ returnTo: returnTo || '/sheets' }))
      webAuth.authorize({ state: stateData })
    },
    async logout({dispatch, commit, state, getters}, params) {
      //commit('clearAuth')
      // I think we need to explicitly state this otherwise Auth0 doesn't know which
      // Logout url to use when there are multiple allowed.
      var returnTo = `${process.env.VUE_APP_DOMAIN}/logout`
      webAuth.logout({ returnTo })
    },
    async handleAuthentication({dispatch, commit, state, getters}) {
      console.log('handleAuthentication', authResult)
      var authResult = await parseHashPromise()
      commit('setUser', authResult)
      await dispatch('getAccountInfo')
      var stateInfo = authResult.state && JSON.parse(atob(authResult.state)) 
      var returnTo = stateInfo && stateInfo.returnTo || '/sheets'
      return { user: state.user, returnTo }
    },
    async checkSession({dispatch, commit, state, getters}, force) {
      var authResult = await checkSessionPromise()
      console.log("checkSession", authResult)
      if (authResult) {
        commit('setUser', authResult)
        await dispatch('getAccountInfo')
      }
    },
    async getAccountInfo({dispatch, commit, state, getters}) {
      let account = (await state.axios.get(`oauth/idp`)).data
      if (account) {
        commit('setAccount', account)
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
    // async reloadSheet({dispatch, commit, state, getters}, { id }) {
    //   let params = { idptoken: getters.idptoken }
    //   await state.axios.get(`${id}/meta`, { params })
    //   let sheet = (await state.axios.get(`${id}/load`, { params })).data
    //   commit('setSheet', sheet)
    //   let deleteCache = await dispatch('deleteCache', { id })
    //   return { sheet: state.sheet, deleteCache }
    // },
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

function calcUserDomain(user) {
  return "goalbookapp.com"
}

function calcExpiresAt(t, expiresInSeconds) {
  var ms = t.getTime() + (expiresInSeconds*1000)
  return new Date(ms)
}

function parseHashPromise() {
  return new Promise(function(resolve, reject) {  
    webAuth.parseHash(function(err, authResult) {
      if (err) reject(err)
      resolve(authResult)
    })  
  })
}

function checkSessionPromise() {
  return new Promise(function(resolve, reject) {
    webAuth.checkSession({}, function(error, authResult) {
      if (error) reject(error)
      resolve(authResult)
    })
  })
}

function getGoogleIDPTokenFromAccount(account) {
  let identity = account.identities.find(idp => idp.provider == "google-oauth2")
  return identity && identity.access_token || null
}