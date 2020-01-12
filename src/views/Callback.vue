<template>
  <div class="callback">
  </div>
</template>

<script>

import { mapState, mapMutations, mapActions } from 'vuex'

export default {
  name: 'callback',
  async mounted() {
    let { user, returnTo } = await this.$store.dispatch('handleAuthentication', { params: location.hash.substring(1) })
    console.log('returnTo', returnTo)
    this.$router.push(returnTo)
  }
}
</script>