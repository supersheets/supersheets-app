import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Account from './views/Account.vue'
import Sheet from './views/Sheet.vue'
import Login from './views/Login.vue'
import Callback from './views/Callback.vue'
import Logout from './views/Logout.vue'
import store from './store'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      props: (route) => {
        return { returnTo: route.query['returnTo'] }
      }
    },
    {
      path: '/callback',
      name: 'callback',
      component: Callback,
      props: (route) => {
        return { state: decodeState(route) }
      }
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
      beforeEnter: checkAuthentication
    },
    {
      path: '/sheets/:id',
      name: 'sheet',
      props: true,
      component: Sheet,
      beforeEnter: checkAuthentication
    },
    {
      path: '/account',
      name: 'account',
      props: true,
      component: Account,
      beforeEnter: checkAuthentication
    }
  ]
})

async function checkAuthentication(to, from, next)  {
  if (store.getters['isAuthenticated']) {
    console.log('checkRoute isAuthenticated top')
    next()
  } else {
    console.log('checkRoute sending to /login', to.path)
    next({ path: '/login', query: { returnTo: to.path } })
    // await store.dispatch('login', { gapi, returnTo: to.path })
    // if (store.getters['isAuthenticated']) {
    //   console.log('checkRoute isAuthenticated after login')
    //   next({ path:})
    // }
  }
}

function decodeState(route) {
  let stateParam = (new URLSearchParams(route.hash.substring(1))).get('state')
  return stateParam && JSON.parse(atob(stateParam)) || null
}

