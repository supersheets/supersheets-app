<template>
<nav class="navbar is-white" role="navigation" aria-label="main navigation">
  <div class="container">
    <div class="navbar-brand">
      <router-link class="navbar-item logo" to="/" v-show="user">Supersheets</router-link>
      <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>
    <div class="navbar-menu">
      <div class="navbar-start">
        <div class="navbar-item" v-if="mode != 'production'">
          <span class="tag is-warning">{{ mode }}</span>
        </div>
      </div>
      
      <div class="navbar-end">
        <div class="navbar-item" v-if="!user">
          Loading ...
          <div class="buttons" v-if="false">
            <a class="button is-info" v-if="false">
              Sign up
            </a>
            <a class="button is-info" v-on:click="loginClick">
              Log in
            </a>
          </div>
        </div>
        <div class="navbar-item has-dropdown is-hoverable" v-if="user">
          <a class="navbar-link">
            {{ user.email }}
          </a>
          <div class="navbar-dropdown">
            <router-link class="navbar-item" to="/account">Account</router-link>
            <a class="navbar-item" v-on:click="logoutClick">
              Log out
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</nav>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'navbar',
  components: {
  },
  computed: {
    ...mapState([
      'user',
      'mode'
    ]),
    ...mapGetters([
      'isAuthenticated'
    ])
  },
  data: () => {
    return { 
    }
  },
  methods: {
    ...mapMutations([
    ]),
    ...mapActions([
      'login',
      'logout'
    ]),
    async loginClick() {
      await this.login({})
      this.$router.push('/')
    },
    async logoutClick() {
      console.log('logout')
      await this.logout()
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.logo {
  /* font-weight: bold */
  font-family: 'Luckiest Guy', cursive;
  font-size: 150%;
  padding-top: 10%;
}
</style>