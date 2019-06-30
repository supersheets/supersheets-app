import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Sheet from './views/Sheet.vue'
import Callback from './views/Callback.vue'
import Logout from './views/Logout.vue'
import store from './store'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/callback',
      name: 'callback',
      component: Callback
    },
    {
      path: '/logout',
      name: 'logout',
      component: Logout
    },
    {
      path: '/',
      name: 'home',
      props: true,
      component: Home,
      beforeEnter: (to, from, next) => {
        if (store.getters['isAuthenticated']) {
          next()
        } else {
          store.dispatch('login', { returnTo: to.path })
        }
      }
    },
    {
      path: '/sheets/:id',
      name: 'sheet',
      props: true,
      component: Sheet,
      beforeEnter: (to, from, next) => {
        if (store.getters['isAuthenticated']) {
          next()
        } else {
          store.dispatch('login', { returnTo: to.path })
        }
      }
    },
  ]
})
