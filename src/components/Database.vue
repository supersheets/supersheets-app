<template>
<div class="schema">
  <h2 class="title is-3">Database</h2>
  <p>Coming soon</p>
</div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
const moment = require('moment')

export default {
  name: 'sheet-schema',
  components: {
  },
  data: () => {
    return {
    }
  },
  computed: {
    ...mapState([
      'user',
      'sheet'
    ])
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


