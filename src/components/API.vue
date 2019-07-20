<template>
<div class="cache">
  <h2 class="title is-3">API</h2>
  <article class="tile is-child notification is-warning">
    <p><strong>Endpoint</strong></p>
    <p>{{ endpoint }}</p>
  </article>
</div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
const moment = require('moment')

export default {
  name: 'sheet-cache',
  components: {
  },
  data: () => {
    return {
      loading: false
    }
  },
  computed: {
    ...mapState([
      'user',
      'sheet'
    ]),
    endpoint: function () {
      if (!this.sheet || !this.sheet.id) return "?"
      return `${process.env.VUE_APP_SUPERSHEETSIO_ENDPOINT}/${this.sheet.id}`
    }
  },
  methods: {
    ...mapMutations([
      'addNotification',
      'removeNotification'
    ]),
    ...mapActions([
    ]),
  }
}
</script>

<style scoped>
p.updated-at .help {
  padding: .4rem 0 .4rem 0
}
</style>


