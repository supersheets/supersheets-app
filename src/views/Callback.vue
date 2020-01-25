<template>
  <div class="callback">
  </div>
</template>

<script>

import { mapState, mapMutations, mapActions } from 'vuex'

export default {
  name: 'callback',
  props: [ 'stateDecoded' ],
  async mounted() {
    console.log(`callback component mounted, stateDecoded=${this.stateDecoded}`)
    let { user } = await this.$store.dispatch('handleAuthentication',  { gapi })
    this.$router.push(this.stateDecoded && this.stateDecoded.returnTo || '/')
  }
}
</script>