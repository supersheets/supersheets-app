<template>
  <div class="login">
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'login',
  props: [ 'returnTo' ],
  computed: {
    ...mapGetters([
      'isAuthenticated'
    ])
  },
  methods: {
    ...mapMutations([
      'addNotification',
      'removeNotification'
    ]),
    ...mapActions([
      'login'
    ]),
  },
  async mounted() {
    let returnTo = this.returnTo || '/'
    console.log('login', this.returnTo)
    await this.login({ gapi, returnTo })
    if (this.isAuthenticated) {
      this.$router.push(returnTo)
    } else {
      console.log("Google Auth failed")
    }
  }
}
</script>