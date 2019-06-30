<template>
  <div class="logout">
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'

export default {
  name: 'logout',
  async mounted() {
    console.log("Logout View")
    this.$store.commit('clearUser', null)
    this.$router.push('/')
  }
}
</script>