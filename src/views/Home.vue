<template>
  <div class="sheet">
    <section class="section header">
      <div class="container">
        <h1 class="title is-2">Home</h1>
      </div>
    </section>
    <section class="section newsheet">
      <div class="container">
        Create New Sheet
      </div>
    </section>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
const moment = require('moment')

export default {
  name: 'home',
  components: {
  },
  data: () => {
    return {
      loading: false
    }
  },
  computed: {
    ...mapState([
      'user'
    ])
  },
  methods: {
    ...mapActions([
      'reloadSheet'
    ])
  },
  async created() {
    
  }
}
</script>

<style>
</style>
