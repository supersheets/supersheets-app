<template>
  <div class="login">
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { decodeState } from '@/lib/oauth'

export default {
  name: 'login',
  props: [ 'stateEncoded' ],
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
    console.log(`login component mounted, stateEncoded=${this.stateEncoded}`)
    // IF the user needs to do a new Google sign-in then
    // we won't return here since Google will do a redirect to
    // Google's sign in page. The user will sign in, and then get redirected
    // to the /callback route.
    await this.login({ gapi, stateEncoded: this.stateEncoded })
    // If the user is already signed in with Google (and does not need to re-sign in)
    // then we come here
    if (this.isAuthenticated) {
      // Google has automatically signed in successfully
      let { returnTo } = decodeState(this.stateEncoded) || { }
      console.log(`Google automatically signed in, redirecting to ${returnTo}`)
      this.$router.push(returnTo)
    }
  }
}
</script>