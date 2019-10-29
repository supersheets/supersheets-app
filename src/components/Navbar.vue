<template>
<nav class="navbar is-white" role="navigation" aria-label="main navigation">
  <div class="container">
    <div class="navbar-brand">
      <router-link class="navbar-item logo" to="/" v-show="user">Supersheets</router-link>
      <a role="button" v-on:click="toggleBurger" :class="{ 'navbar-burger':true, 'burger':true, 'is-active':burger }" aria-label="menu" aria-expanded="false" data-target="navbarMain" >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>
    <div id="navbarMain" :class="{'navbar-menu':true, 'is-active':burger}">
      <div class="navbar-start">
        <div class="navbar-item" v-if="user">
          <router-link to="/">My Supersheets</router-link>
        </div>
        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">
            Docs
          </a>
          <div class="navbar-dropdown">
            <a class="navbar-item" href="https://docs.google.com/document/d/18ElzHxn9DgITDM55Rpz5NGEWpbM8oyKIBswkkrr0jfM/edit#" target="_blank">
              Creating a Supersheet
            </a>
            <a class="navbar-item" href="https://docs.google.com/document/d/1MwXzWWKM4gSm1VELfQWFifiwHGgO8Ca3mxmg6T5GIhU/edit#" target="_blank">
              Querying a Supersheet
            </a>
          </div>
        </div>
      </div>
      
      <div class="navbar-end">
        <div class="navbar-item" v-if="mode != 'production'">
          <span class="tag is-warning">{{ mode }}</span>
        </div>
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
      burger: false
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
    },
    toggleBurger() {
      this.burger = !this.burger
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