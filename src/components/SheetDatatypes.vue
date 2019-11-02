<template>
<div class="datatypes">
<div class="columns" v-if="columns">
  <div class="column is-9">
    <nav class="level">
      <div class="level-left">
        <div class="level-item">
          <h3 class="title is-3">Data Types</h3>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <a :class="{'button':true, 'is-danger': true, 'is-loading': saving }" v-on:click="saveAction()">
            <span class="icon">
              <i class="fas fa-save"></i>
            </span>
            <span>Save Data Types</span>
          </a>
        </div>
      </div>
    </nav>
    <table class="table">
      <thead>
        <tr>
          <th>Field</th>
          <th>Supersheets Type</th>
          <th></th>
          <th>Current Value</th>
          <th>GraphQL Type</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="col in columns" v-bind:key="`datatype-${col.fullname}`" :class="{ 'highlight': (col.datatype != col.configdatatype), 'reserved': col.reserved }">
          <th v-if="!col.embedded">{{ col.name }}</th>
          <th v-if="col.embedded">&rdsh; {{ col.name }}</th>
          <td>{{ col.datatype }}</td>
          <td>
            <div class="control">
              <div class="select is-small" v-if="!col.reserved">
                <select v-model="col.configdatatype">
                  <option>String</option>
                  <option v-if="unformatted">Int</option>
                  <option v-if="unformatted">Float</option>
                  <option v-if="unformatted">Boolean</option>
                  <option v-if="unformatted">Date</option>
                  <option v-if="unformatted">Datetime</option>
                  <option v-if="unformatted">StringList</option>
                  <option v-if="unformatted && !col.embedded">GoogleDoc</option>
                  <option v-if="unformatted && col.embedded">Markdown</option>
                  <option v-if="unformatted && col.embedded">PlainText</option>
                  <option v-if="unformatted && col.embedded">Google JSON</option>
                </select>
              </div>
              <span class="help is-italic" v-if="col.reserved">Reserved</span>
            </div>
          </td>
          <td><em>{{ col.sample }}</em></td>
          <td>{{ convertToGraphQL(col) }}</td>
        </tr>
      </tbody>
    </table>
    <nav class="level">
      <div class="level-lefft">
        <div class="level-item">
          <a :class="{'button':true, 'is-danger': true, 'is-loading': saving }" v-on:click="saveAction()">
            <span class="icon">
              <i class="fas fa-save"></i>
            </span>
            <span>Save Data Types</span>
          </a>
        </div>
      </div>
      <div class="level-right">
      </div>
    </nav>
  </div> 
  <div class="column">
    
  </div>
</div>
</div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { makeSchemaRowsEditable, convertToGraphQLType, generateGraphQLNames } from '@/lib/schemautil.js'

const moment = require('moment')

export default {
  name: 'sheet-datatypes',
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
    ...mapGetters([
      'schemas'
    ]),
    editablerows: function() {
      return this.schemas.find(s => s.title == "Rows").rows.filter(r => !r.reserved)
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
    convertToGraphQL(col) {
      let names = generateGraphQLNames({
        title: "*", // RowContentDoc => *ContentDoc
        schema: this.sheet.schema
      })
      return convertToGraphQLType(col, { names })
    },
    initColumns() {
      let datatypes = this.sheet.config && this.sheet.config.datatypes || { }
      return makeSchemaRowsEditable(this.editablerows, datatypes)
    }
  },
  async created() {
    this.columns = this.initColumns()
  }
}

function insertGoogleDocColumns(columns, datatypes) {
  let newcolumns = [ ]
  for (let i=0; i<columns.length; i++) {
    let column = columns[i]
    newcolumns.push(column)
    if (column.fields) {
      for (let field of column.fields) {
        let copy = JSON.parse(JSON.stringify(field))
        copy.embedded = column.name
        copy.configdatatype = datatypes[`${column.name}.${copy.name}`] || copy.datatype || "String"
        newcolumns.push(copy)
      }
    }
  }
  return newcolumns
}

function convertToDatatypes(columns) {
  let datatypes = { }
  for (let col of columns.filter(col => !col.reserved)) {
    if (col.embedded) {
      datatypes[col.fullname] = col.configdatatype
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
tr.reserved {
  background: #f6f6f6;
}
</style>


