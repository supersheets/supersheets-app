<template>
<div class="sheet-header">
  <h1 class="title is-2">{{ sheet.title }}</h1>
  <div class="field is-grouped" v-show="sheet.id">
    <p class="control">
      <a :class="{'button':true, 'is-loading':loading, 'is-info': true }" v-on:click="reload">
        <span class="icon">
          <i class="fas fa-sync-alt"></i>
        </span>
        <span>Reload Sheet</span>
      </a>
    </p>
    <p class="control updated-at">
      <span class="help" v-show="!loading">Last updated {{ updated }} by {{ updated_by }} ({{ updated_date }})</span>
      <span class="help" v-show="loading">Loading ...</span>
    </p>
  </div>
</div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
const moment = require('moment')

export default {
  name: 'sheet-header',
  components: {
  },
  data: () => {
    return {
      loading: false,
    }
  },
  computed: {
    ...mapState([
      'user',
      'sheet'
    ]),
    updated: function () {
      if (!this.sheet || !this.sheet.updated_at) return "..."
      let d = moment(this.sheet.updated_at)
      return `${d.fromNow()}`
    },
    updated_by: function () {
      return (this.sheet.updated_by_email || this.sheet.created_by_email || "Unknown@email.com").split('@')[0]
    },
    updated_date: function() {
      if (!this.sheet || !this.sheet.updated_at) return "..."
      let d = moment(this.sheet.updated_at)
      return `${d.format('llll')}`
    },
    endpoint: function () {
      if (!this.sheet || !this.sheet.id) return "?"
      return `${process.env.VUE_APP_SUPERSHEETSIO_ENDPOINT}/${this.sheet.id}`
    },
  },
  methods: {
    ...mapMutations([
      'addNotification',
      'removeNotification'
    ]),
    ...mapActions([
      'reloadSheet',
    ]),
    async reload() {
      this.loading = true
      try {
        await this.reloadSheet({ id: this.sheet.id })
        this.addNotification({
          message: `Reloaded successfully`,
          level: "success"
        })
      } catch (err) {
        console.log(err.response)
        this.addNotification({
          message: `${err.response.status} ${err.response.data.errorMessage}`,
          level: "danger"
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
p.updated-at .help {
  padding: .4rem 0 .4rem 0
}

.field.endpoint {
  margin-top: 1.5rem;
}
</style>


