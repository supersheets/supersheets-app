<template>
  <div class="logout">
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'

export default {
  name: 'logout',
  methods: {
    ...mapActions([
      'logout'
    ]),
  },
  async mounted() {
    console.log("logout component mounted")
    await this.logout()
    this.$router.push('/')
  }
}
</script>