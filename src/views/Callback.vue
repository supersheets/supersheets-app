<template>
  <div class="callback">
  </div>
</template>

<script>

import { mapState, mapMutations, mapActions } from 'vuex'

export default {
  name: 'callback',
  async mounted() {
    console.log("CALLBACK View")
    try {
      var { user, returnTo } = await this.$store.dispatch('handleAuthentication')
      this.$router.push(returnTo)
    } catch (err) {
      console.error(err)
    }
  }
}
</script>