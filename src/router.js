import Vue from 'vue'
import Router from 'vue-router'
import UserTemplate from '@/templates/UserTemplate'
import AuthTemplate from '@/templates/AuthTemplate'
import SheetsTemplate from '@/templates/SheetsTemplate'
import Home from './views/Home.vue'
import Account from './views/Account.vue'
import Sheet from './views/Sheet.vue'
import Login from './views/Login.vue'
import Callback from './views/Callback.vue'
import Logout from './views/Logout.vue'
import store from './store'
import { encodeState, decodeState } from '@/lib/oauth'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: '/sheets'
    },
    {
      path: '/sheets',
      component: SheetsTemplate,
      beforeEnter: checkAuthentication,
      children: [
        {
          name: 'sheets',
          path: '',
          props: true,
          component: Home,
        },
        {
          name: 'sheet',
          path: ':id',
          props: true,
          component: Sheet,
        }
      ]
    },
    {
      path: '/user',
      component: UserTemplate,
      beforeEnter: checkAuthentication,
      children: [
        {
          path: 'account',
          name: 'account',
          component: Account,
        }
      ]
    },
    {
      path: '/auth',
      component: AuthTemplate,
      children: [
        {
          path: 'login',
          name: 'login',
          component: Login,
          props: (route) => {
            // pass the state prop to the Login component
            return { stateEncoded: route.query['stateEncoded'] }
          }
        },
        {
          path: 'callback',
          name: 'callback',
          component: Callback,
          props: (route) => {
            // Google will return the state query parameter back to 
            // us as part of the route.hash param named 'state'
            let stateParamValue = (new URLSearchParams(route.hash.substring(1))).get('state')
            return { stateDecoded: decodeState(stateParamValue) }
          }
        },
        {
          path: 'logout',
          name: 'logout',
          component: Logout
        }
      ]
    },
  ]
})

async function checkAuthentication(to, from, next)  {
  if (store.getters['isAuthenticated']) {
    // User is already authenticated, go to the requested route
    console.log('User currently authenticated')
    next()
  } else {
    let stateEncoded = encodeState({ returnTo: to.path || '/sheets' })
    // User is not authenticated, send user to /login rout
    console.log(`User is currently unauthenticated, sending to /auth/login, returnTo=${to.path}, stateEncoded=${stateEncoded}`)
    next({ path: '/auth/login', query: { stateEncoded } })
  }
}

