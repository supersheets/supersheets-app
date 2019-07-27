<template>
  <div class="sheet">
    <section class="section header">
      <div class="container">
        <h1 class="title is-2">Account</h1>
        <div class="columns">
          <div class="column">
            <pre><code>{{ account }}</code></pre>
          </div>
          <div class="column is-4">
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
const moment = require('moment')
const docidRegex = new RegExp("/spreadsheets/d/([a-zA-Z0-9-_]+)")

export default {
  name: 'home',
  components: {
  },
  data: () => {
    return {
    }
  },
  computed: {
    ...mapState([
      'user',
      'account'
    ]),
  },
  methods: {
    ...mapMutations([
      'addNotification',
      'removeNotification'
    ]),
    ...mapActions([
    ])
  },
  async created() {
  }
}
</script>

<style scoped>
</style>
