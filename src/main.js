import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Third party dependencies
import auth0 from 'auth0-js'
import 'bulma/css/bulma.css'
import '@fortawesome/fontawesome-free/css/all.css'
import Prism from 'vue-prismjs'
import 'prismjs/themes/prism.css'

store.dispatch('initGoogleOAuth', { gapi })

setInterval(() => { 
  store.dispatch('checkSession') 
}, 5 * 60 * 1000)  // check every 5 minutes

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
