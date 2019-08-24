<template>
<div class="sheet-header">
  <h1 class="title is-2">{{ sheet.title }}</h1>
  <nav class="level">
  <!-- Left side -->
  <div class="level-left">
    <div class="level-item">
      <p class="control">
        <a :class="{'button':true, 'is-loading':loading, 'is-success': true, 'is-small': true }" v-on:click="load">
          <span class="icon">
            <i class="fas fa-sync-alt"></i>
          </span>
          <span>Reload Sheet</span>
        </a>
      </p>
    </div>
    <div class="level-item">
      <p class="control progress-bar" v-show="loading">
        <progress class="progress is-info" :max="progress.max" style="width: 15rem;" v-if="progress.value == 0"></progress>
        <progress class="progress is-info" :value="progress.value" :max="progress.max" style="width: 15rem;" v-if="progress.value > 0"></progress>
      </p>
    </div>
    <div class="level-item">
      <p class="control updated-at">
        <span class="help" v-show="!loading">Last updated {{ updated }} by {{ updated_by }} ({{ updated_date }})</span>
        <span class="help" v-show="loading">
          {{ message }}
        </span>
      </p>
    </div>
  </div>

  <!-- Right side -->
  <div class="level-right">
    <div class="level-item">
      <p class="control">
        <a :class="{'button':true, 'is-info': true, 'is-outlined': true, 'is-small': true }" target="_blank" :href="playgroundurl">
          <span>GraphQL Playground</span>
          <span class="icon">
            <i class="fas fa-play"></i>
          </span>
        </a>
      </p>
    </div>
    <div class="level-item">
      <p class="control">
        <a :class="{'button':true, 'is-info': true, 'is-outlined': true, 'is-small': true }" target="_blank" :href="this.sheet.url">
          <span>Google Sheet</span>
          <span class="icon">
            <i class="fas fa-external-link-alt"></i>
          </span>
        </a>
      </p>
    </div>
  </div>
  </nav>
  <div class="field is-grouped is-grouped-multiline">
    <div class="control">
      <div class="tags has-addons">
        <span class="tag">Fields:</span>
        <span class="tag">{{ numfields }}</span>
      </div>
    </div>
    <div class="control">
      <div class="tags has-addons">
        <span class="tag">Records:</span>
        <span class="tag">{{ numrows }}</span>
      </div>
    </div>
    <div class="control">
      <div class="tags has-addons">
        <span class="tag">Timezone:</span>
        <span class="tag">{{ sheet.tz }} ({{ sheet.local }})</span>
      </div>
    </div>
    <div class="control">
      <div class="tags has-addons">
        <span class="tag">URL:</span>
        <span class="tag">{{ endpoint }}</span>
      </div>
    </div>
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
    message: function () {
      return `${this.loadstatus.message}`
    },
    progress: function () {
      if (this.loadstatus.num_sheets_total == -1) return { value: 0, max: -1 }
      return { value: this.loadstatus.num_sheets_loaded, max: this.loadstatus.num_sheets_total }
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
      return `${process.env.VUE_APP_SUPERSHEETSIO_ENDPOINT}/${this.sheet.id}/graphql`
    },
    playgroundurl: function() {
      return `${this.endpoint}/playground`
    },
    numfields: function() {
      if (!this.sheet || !this.sheet.id) return -1
      return this.sheet.ncols
    },
    numrows: function() {
      if (!this.sheet || !this.sheet.id) return -1
      return this.sheet.nrows
    }
  },
  methods: {
    ...mapMutations([
      'clearLoadStatus',
      'addNotification',
      'removeNotification'
    ]),
    ...mapActions([
      'startLoad',
      'checkLoadStatus',
      'endLoad'
    ]),
    async load() {
      this.clearLoadStatus()
      this.loading = true
      try {
        let status = await this.startLoad({ id: this.sheet.id })
        let interval = setInterval(async () => {
          try {
            console.log("interval")
            let update = await this.checkLoadStatus({ id: this.sheet.id, uuid: status.uuid })
            if (update.completed_at) {
              clearInterval(interval)
            }
            if (update.status == "SUCCESS") {
              await this.endLoad({ id: this.sheet.id })
              this.loading = false
              this.addNotification({
                message: `Loaded successfully`,
                level: "success"
              })
            } else if (update.status == "FAILURE") {
              this.loading = false
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
        if (err.response) {
          console.log(err.response)
          this.addNotification({
            message: `${err.response.status} ${err.response.data.errorMessage}`,
            level: "danger"
          })
        } else {
          console.log(err)
          this.addNotification({
            message: `${err.message}`,
            level: "danger"
          })
        }
      } finally {
        // this.loading = false
      }
    }
  }
}
</script>

<style scoped>
p.progress-bar progress {
  margin-top: 0rem
}

.field.endpoint {
  margin-top: 1.5rem;
}
</style>


