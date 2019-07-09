import Vue from 'vue'
import Vuex from 'vuex'

const axios = require('axios')
const uuidV4 = require('uuid/v4')

Vue.use(Vuex)

// Auth0 Configuration
import auth0 from 'auth0-js'
import router from './router';
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
    sheet: { title: "Loading ..." },
    axios: axios.create({
      baseURL: process.env.VUE_APP_SUPERSHEETSIO_ENDPOINT,
      // timeout: 1000,
      // headers: { 'X-Custom-Header': 'foobar'}
    }),
    notifications: [ ]
  },
  getters: {
    isAuthenticated: (state, getters) => {
      return state.user
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
    setSheet(state, sheet) {
      state.sheet = sheet
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
      var stateInfo = authResult.state && JSON.parse(atob(authResult.state)) 
      var returnTo = stateInfo && stateInfo.returnTo || '/sheets'
      return { user: state.user, returnTo }
    },
    async checkSession({dispatch, commit, state, getters}, force) {
      var authResult = await checkSessionPromise()
      console.log("checkSession", authResult)
      if (authResult) {
        commit('setUser', authResult)
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
      return state.sheet
    },
    async reloadSheet({dispatch, commit, state, getters}, { id }) {
      await state.axios.get(`${id}/meta`)
      let sheet = (await state.axios.get(`${id}/load`)).data
      commit('setSheet', sheet)
      return state.sheet
    },
    async deleteSheet({dispatch, commit, state, getters}, { id }) {
      let res = (await state.axios.delete(`${id}`)).data
      commit('setSheet', { title: "Loading ..." })
      return res
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
