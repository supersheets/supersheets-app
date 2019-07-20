<template>
<div class="overview">
  <h1 class="title is-2">{{ sheet.title }}</h1>
  <div class="field is-grouped" v-show="sheet.id">
    <p class="control">
      <a :class="{'button':true, 'is-info': true }" :href="sheet.url" target="_blank">
        <span class="icon">
          <i class="fas fa-external-link-alt"></i>
        </span>
        <span>Google Sheet</span>
      </a>
    </p>
    <p class="control">
      <a :class="{'button':true, 'is-loading':loading, 'is-success': true }" v-on:click="reload">Reload Data</a>
    </p>
    <p class="control updated-at">
      <span class="help" v-show="!loading">Last updated {{ updated }} by {{ updated_by }}</span>
      <span class="help" v-show="loading">Loading ...</span>
    </p>
  </div>
  <br/>
  <h3 class="title is-4">API</h3>
  <article class="tile is-child notification is-warning">
    <p><strong>Endpoint</strong></p>
    <p>{{ endpoint }}</p>
  </article>
  <br/>
  <br/>
  <h3 class="title is-4" v-if="sheet.schema">Schema</h3>
  <table class="table" v-if="sheet.schema">
    <thead>
      <tr>
        <th>Name</th>
        <th>Data Type</th>
        <th>Sample Value</th>
        <th>Sheets</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="col in sheet.schema.columns" v-bind:key="col.name">
        <th>{{ col.name }}</th>
        <td>{{ col.datatype }}</td>
        <td><em>{{ formatSample(col) }}</em></td>
        <td>{{ col.sheets && col.sheets.join(', ') || '' }}</td>
      </tr>
    </tbody>
  </table>

  <br/>
  <br/>  
  <h3 class="title is-4">Data Source</h3>
  <p>
    This Supersheet is backed by the Google Spreadsheet: <em><a :href="sheet.url" target="_blank">{{ sheet.title }}</a></em>. 
    It has a total of <strong>{{ sheet.nrows }} rows</strong> across  <strong>{{ sheet.sheets && sheet.sheets.length || -1 }} sheets</strong>. 
    It is based in the <strong>{{ sheet.local }}</strong> locale and <strong>{{ sheet.tz }}</strong> timezone.
  </p>
</div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
const moment = require('moment')

export default {
  name: 'sheet-overview',
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
      if (!this.sheet || !this.sheet.updated_at) return "?"
      let d = moment(this.sheet.updated_at)
      return `${d.fromNow()} on ${d.format('MMMM Do YYYY [at] h:mm:ss A')}`
    },
    updated_by: function () {
      return this.sheet.updated_by_email || this.sheet.created_by_email || "Unknown"
    },
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
    },
    formatSample(col) {
      if (col.datatype == "String") {
        if (col.sample && col.sample.length > 20) {
          return `${col.sample.substring(0, 17)}...`
        } else {
          return col.sample
        }
      } else {
        return col.sample
      }
    }
  },
  async created() {

  }
}
</script>

<style scoped>
p.updated-at .help {
  padding: .4rem 0 .4rem 0
}
</style>


