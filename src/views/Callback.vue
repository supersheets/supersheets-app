<template>
  <div class="callback">
  </div>
</template>

<script>

import { mapState, mapMutations, mapActions } from 'vuex'

export default {
  name: 'callback',
  props: [ 'state' ],
  async mounted() {
    await this.$store.dispatch('initGoogleOAuth', { gapi })
    console.log('state', this.state)
    let { user, returnTo } = await this.$store.dispatch('handleAuthentication', { returnTo: this.state.returnTo || '/' })
    console.log('returnTo', returnTo)
    this.$router.push(returnTo)
  }
}
</script>