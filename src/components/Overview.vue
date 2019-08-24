<template>
<div class="overview">
<table class="table" v-if="columns">
  <thead>
    <tr>
      <th>Name</th>
      <th>Data Type</th>
      <th></th>
      <th>Sample Value</th>
      <th>Sheets</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="col in columns" v-bind:key="col.name" :class="{ 'highlight': (col.datatype != col.configdatatype) }">
      <th v-if="!col.embedded">{{ col.name }}</th>
      <th v-if="col.embedded">&rdsh; {{ col.name }}</th>
      <td>{{ col.datatype }}</td>
      <td>
        <div class="control">
          <div class="select is-small">
            <select v-model="col.configdatatype">
              <option>String</option>
              <option v-if="unformatted">Int</option>
              <option v-if="unformatted">Float</option>
              <option v-if="unformatted">Boolean</option>
              <option v-if="unformatted">Date</option>
              <option v-if="unformatted">Datetime</option>
              <option v-if="unformatted">StringList</option>
              <option v-if="unformatted">GoogleDoc</option>
              <option v-if="unformatted">JSON</option>
            </select>
          </div>
        </div>
      </td>
      <td><em>{{ formatSample(col) }}</em></td>
      <td>{{ col.sheets && col.sheets.join(', ') || '' }}</td>
    </tr>
  </tbody>
</table>
<nav class="level">
  <!-- Left side -->
  <div class="level-left">
    <div class="level-item">
      <a :class="{'button':true, 'is-success': true, 'is-loading': saving }" v-on:click="saveAction()">
        <span class="icon">
          <i class="fas fa-save"></i>
        </span>
        <span>Save Fields</span>
      </a>
    </div>
  </div>
  <!-- Right side -->
  <div class="level-right">
  </div>
</nav>
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
      saving: false,
      columns: [ ]
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
      return `${process.env.VUE_APP_SUPERSHEETSIO_ENDPOINT}/${this.sheet.id}/graphql`
    },
    playgroundurl: function () {
      if (!this.sheet || !this.sheet.id) return "?"
      return `${this.endpoint}/playground`
    },
    accessMode: function() {
      return this.sheet && this.sheet.config && this.sheet.config.access || 'public'
    },
    unformatted: function() {
      return this.sheet && this.sheet.config && this.sheet.config.mode == 'UNFORMATTED' || false
    }
  },
  watch: {
    sheet: function (newSheet, oldSheet) {
      this.columns = this.initColumns()
    }
  },
  methods: {
    ...mapMutations([
      'addNotification',
      'removeNotification'
    ]),
    ...mapActions([
      'saveSheet',
      'getSheet'
    ]),
    async saveAction() {
      this.saving = true
      let datatypes = convertToDatatypes(this.columns)
      let config = Object.assign({ }, this.sheet.config, { datatypes })
      console.log("Saving metadata", { config })
      try {
        await this.saveSheet({ id: this.sheet.id, metadata: { config } })
        await this.getSheet({ id: this.sheet.id })
        this.columns = this.initColumns()
        this.addNotification({
          message: `Updated fields successfully`,
          level: "success"
        })
      } catch (err) {
        this.addNotification({
          message: `Error: ${err.message}`,
          level: "danger"
        })
      } finally {
        this.saving = false
      }
    },
    initColumns() {
      if (!this.sheet || !this.sheet.id) {
        return [ ]
      }
      if (!this.sheet.schema) {
        return this.initOldColumns()
      }
      let datatypes = this.sheet && this.sheet.config && this.sheet.config.datatypes || { }
      let columns = JSON.parse(JSON.stringify(this.sheet.schema.columns))
      for (let col of columns) {
        if (datatypes[col.name]) {
          col.configdatatype = datatypes[col.name]
        } else {
          col.configdatatype = "String"
        }
      }
      columns = insertGoogleDocColumns(columns, this.sheet.schema.docs, datatypes)
      return columns
    },
    initOldColumns() {
      let names = { }
      let columns = [ ]
      for (let sheet of this.sheet.sheets) {
        for (let name of sheet.columns) {
          if (!names[name]) {
            columns.push({
              name: name,
              datatype: "String",
              configdatatype: "String"
            })
            names[name] = true
          }
        }
      }
      console.log('initOldColumns', columns)
      return columns
    },
    formatSample(col) {
      if (col.datatype == "String") {
        if (col.sample && col.sample.length > 20) {
          return `${col.sample.substring(0, 17)}...`
        } else {
          return col.sample
        }
      } else if (col.datatype == "GoogleDoc") {
        if (typeof col.sample == "object") {
          return `${JSON.stringify(col.sample).substring(0, 47)}...`
        } else {
          return `${col.sample.substring(0, 47)}...`
        }
      } else {
        return col.sample
      }
    }
  },
  async created() {
    this.columns = this.initColumns()
  }
}

function insertGoogleDocColumns(columns, docs, datatypes) {
  if (!docs) return columns
  let newcolumns = [ ]
  for (let i=0; i<columns.length; i++) {
    let column = columns[i]
    newcolumns.push(column)
    if (column.datatype != "GoogleDoc" || !docs[column.name]) continue
    let doccolumns = docs[column.name].columns
    for (let doccolumn of doccolumns) {
      let copy = JSON.parse(JSON.stringify(doccolumn))
      copy.name = `${copy.name}`
      copy.embedded = column.name
      if (datatypes[`${column.name}.${copy.name}`]) {
        copy.configdatatype = datatypes[`${column.name}.${copy.name}`]
      } else {
        copy.configdatatype = "String"
      }
      newcolumns.push(copy)
    }
  }
  return newcolumns
}

function convertToDatatypes(columns) {
  let datatypes = { }
  for (let col of columns) {
    if (col.embedded) {
      datatypes[`${col.embedded}.${col.name}`] = col.configdatatype
    } else {
      datatypes[col.name] = col.configdatatype
    }
  }
  return datatypes
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

tr.highlight {
  background: #FFC;
}
</style>


