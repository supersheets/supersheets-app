<template>
<div class="overview">
  <h3 class="title is-4">API Endpoint</h3>
  <div class="columns">
    <div class="column">
      <p>{{ endpoint }}</p>
    </div>
    <div class="column is-4">
    </div>
  </div>
  <br/>
  <h3 class="title is-4" v-if="sheet.schema">Schema</h3>
  <table class="table is-striped" v-if="sheet.schema">
    <thead>
      <tr>
        <th>Field Name</th>
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
  <h3 class="title is-4">Google Spreadsheet</h3>
  <table class="table is-striped">
    <tbody>
      <tr>
        <th>Datasource</th>
        <td>
          <a :href="sheet.url" target="_blank">{{ sheet.title }}</a>
        </td>
      </tr>
       <tr>
        <th>Access Mode</th>
        <td>{{ accessMode }}</td>
      </tr>
      <tr>
        <th>Number of Sheets</th>
        <td>{{ sheet.sheets && sheet.sheets.length || -1 }}</td>
      </tr>
      <tr>
        <th>Number of Rows</th>
        <td>{{ sheet.nrows }}</td>
      </tr>
      <tr>
        <th>Timezone</th>
        <td>{{ sheet.tz }}</td>
      </tr>
      <tr>
        <th>Locale</th>
        <td>{{ sheet.local }}</td>
      </tr>
    </tbody>
  </table>
  <br/>

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
    accessMode: function() {
      return this.sheet && this.sheet.config && this.sheet.config.access || 'public'
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

.field.endpoint {
  margin-top: 1.5rem;
}

.column.note {
  background: #f6f6f6;
}
</style>


