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
    <p class="control">
      <a :class="{'button':true, 'is-loading':loading, 'is-info': true }" v-on:click="load">
        <span class="icon">
          <i class="fas fa-sync-alt"></i>
        </span>
        <span>Start Load</span>
      </a>
    </p>
    <p class="control updated-at">
      <span class="help" v-show="!loading">Last updated {{ updated }} by {{ updated_by }} ({{ updated_date }})</span>
      <span class="help" v-show="loading">{{ progress }}</span>
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
      'sheet',
      'loadstatus'
    ]),
    progress: function () {
      if (!this.loadstatus) return "Loading ..."
      return `${this.loadstatus.loaded}/${this.loadstatus.total}`
    },
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
      'clearLoadStatus',
      'addNotification',
      'removeNotification'
    ]),
    ...mapActions([
      'reloadSheet',
      'startLoad',
      'checkLoadStatus'
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
    },
    async load() {
      this.clearLoadStatus()
      this.loading = true
      try {
        let status = await this.startLoad({ id: this.sheet.id })
        let interval = setInterval(async () => {
          try {
            console.log("interval")
            let update = await this.checkLoadStatus({ id: this.sheet.id, uuid: status.uuid })
            if (!this.loadstatus) return
            if (this.loadstatus.completed_at) {
              console.log("clear interval")
              clearInterval(interval)
              this.loading = false
            }
            if (this.loadstatus.status == "SUCCESS") {
              this.addNotification({
                message: `Loaded successfully`,
                level: "success"
              })
            } else if (this.loadstatus.status == "FAILURE") {
              this.addNotification({
                message: `${this.loadstatus.error}`,
                level: "danger"
              })
            }
          } catch (err) {
            this.addNotification({
              message: `${err.message}`,
              level: "danger"
            })
          }
        }, 5 * 1000)
      } catch (err) {
        console.log(err.response)
        this.addNotification({
          message: `${err.response.status} ${err.response.data.errorMessage}`,
          level: "danger"
        })
      } finally {
        // this.loading = false
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


