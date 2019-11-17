<template>
<div class="schema">
<div class="columns">
  <div class="column is-2">
    <aside class="menu" v-if="schema">
      <p class="menu-label">
        Sheets
      </p>
      <ul class="menu-list">
        <li v-for="s in schemas.filter(s => s.title != 'Rows')" v-bind:key="`menu-${s.title}`">
          <a :class="{ 'is-active': s == schema }" v-on:click="selectschema(s)">{{ s.title }}</a>
        </li>
      </ul>
      <p class="menu-label">
        System
      </p>
      <ul class="menu-list">
        <li v-for="s in schemas.filter(s => s.title == 'Rows')" v-bind:key="`menu-${s.title}`">
          <a :class="{ 'is-active': s == schema }" v-on:click="selectschema(s)">{{ s.title }}</a>
        </li>
      </ul>
    </aside>
  </div>
  <div class="column" v-if="schema">
    <h3 class="title is-3">{{ schema.title }}</h3>
    <div class="tabs">
      <ul>
        <li :class="tabClass('fields')"><a v-on:click="selectTab('fields')">Fields</a></li>
        <li :class="tabClass('queries')"><a v-on:click="selectTab('queries')">Queries</a></li>
      </ul>
    </div>
    <div class="fieldscontent" v-show="isTabSelected('fields')">
      <nav class="level">
        <div class="level-left">
          <div class="level-item">
            <a :class="{'button':true, 'is-danger': true, 'is-loading': saving, 'is-small': true }" v-on:click="saveAction()">
              <span class="icon">
                <i class="fas fa-save"></i>
              </span>
              <span>Save Data Types</span>
            </a>
          </div>
        </div>
        <div class="level-right">
          <div class="level-item">
            <div class="field">
              <div class="control">
                <label class="checkbox">
                  <input type="checkbox" v-model="showreserved">
                  Show reserved fields
                </label>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Supersheets Type</th>
            <th></th>
            <th>GraphQL Type</th>
            <th>Sample Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="col in editable" v-bind:key="`row-${col.name}`" :class="{ 'reserved': col.reserved }" v-show="!col.reserved || showreserved">
            <th v-if="!col.embedded">{{ col.name }}</th>
            <th v-if="col.embedded">&rdsh; {{ col.name }}</th>
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
                    <option v-if="unformatted">ImageUrl</option>
                    <option v-if="unformatted && !col.embedded">GoogleDoc</option>
                  </select>
                </div>
                <span class="help is-italic" v-if="col.reserved">Reserved</span>
              </div>
            </td>
            <td>
              <a class="button is-small is-danger" v-if="col.relationship" v-on:click="showModal(col)">
                {{ col.relationship.sheet }}:{{ col.relationship.field }}:{{ col.relationship.operator }}
              </a>
              <a class="button is-small" v-if="!col.relationship && !col.embedded && col.datatype != 'GoogleDoc' && !col.reserved"  v-on:click="showModal(col)">
                + Relationship
              </a>
            </td>
            <td>{{ col.graphql }}</td>
            <td class="sample"><em>{{ col.sample }}</em></td>
          </tr> 
        </tbody>
      </table>
    </div>
    <div class="queriescontent" v-show="isTabSelected('queries')">
      <div class="graphqlquery" v-for="query in queries" v-bind:key="`query-${query.name}`">
        <nav class="level">
          <div class="level-left">
            <div class="level-item">
              <h5 class="title is-5">{{ query.name }} </h5>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item" >
              <a :href="getPlaygroundUrl({ name: query.name, query: query.query })" class="button is-small is-danger" target="_blank">
                <span>Run in GraphQL Playground</span>
                <span class="icon">
                  <i class="fas fa-play"></i>
                </span>
              </a>
            </div>
          </div>
        </nav>
        <prism language="graphql" class="content">{{ query.query }}</prism>
        <br/>
        <br/>
      </div>
    </div>
  </div>
  <div class="column is-2"></div>
</div>
<div :class="{'modal':true, 'is-active': showmodal }">
  <div class="modal-background"></div>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Update Relationship</p>
      <button class="delete" aria-label="close" v-on:click="closeModal"></button>
    </header>
    <section class="modal-card-body">
      <div class="field">
        <label class="label">Sheet</label>
        <div class="control">
          <div class="select">
            <select v-model="modalcol.relationship.sheet">
              <option v-for="schema in schemas" v-bind:key="`relationship-${schema.title}`">{{ schema.title }}</option>
            </select>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label">Field</label>
        <div class="control">
          <div class="select">
            <select v-model="modalcol.relationship.field">
              <option v-for="row in selectedfields" v-bind:key="`field-${modalcol.relationship.sheet}-${row.name}`">{{ row.name }}</option>
            </select>
          </div>
        </div>
        <p class="help">{{ modalcol.relationship.field && selectedfields.find(r => r.name == modalcol.relationship.field).sample   }}</p>
      </div>
      <div class="field">
        <label class="label">Operator</label>
        <div class="control">
          <div class="select">
            <select v-model="modalcol.relationship.operator">
              <option>eq</option>
              <option>in</option>
            </select>
          </div>
        </div>
      </div>
      <p>
        {{ schema.title }}:{{ modalcol.name }}:{{ modalcol.sample }}
      </p>
    </section>
    <footer class="modal-card-foot">
      <button :class="{'button':true, 'is-danger':true }" v-on:click="editRelationshipAction">Update Relationship</button>
      <button :class="{'button':true, 'is-danger':true, 'is-outlined': true }" v-on:click="editRelationshipAction(false)">Remove Relationship</button>
      <button class="button" v-on:click="closeModal">Cancel</button>
    </footer>
  </div>
</div>
</div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { buildQueriesForSchema } from '@/lib/queryutil.js'
import { makeSchemaRowsEditable, convertToGraphQLType, generateGraphQLNames } from '@/lib/schemautil.js'

import Prism from 'vue-prismjs'
const pluralize = require('pluralize')

const moment = require('moment')

export default {
  name: 'sheet-schema',
  components: {
    Prism
  },
  data: () => {
    return {
      selectedtab: "fields",
      selectedschema: null,
      showreserved: false,
      editable: [ ],
      showmodal: false,
      modalcol: { relationship: { } },
      saving: false
    }
  },
  computed: {
    ...mapState([
      'sheet'
    ]),
    ...mapGetters([
      'graphqlendpoint',
      'schemas'
    ]),
    playgroundurl: function () {
      if (!this.sheet || !this.sheet.id) return "..."
      return `${this.graphqlendpoint}/playground`
    },
    queries: function () {
      return this.schema && buildQueriesForSchema(this.schema) || [ ]
    },
    schema: function () {
      return this.selectedschema || this.schemas.find(s => s.title != "Rows")
    },
    unformatted: function() {
      return this.sheet && this.sheet.config && this.sheet.config.mode == 'UNFORMATTED' || false
    },
    selectedfields: function() {
      let title = this.modalcol && this.modalcol.relationship && this.modalcol.relationship.sheet || this.schema.title
      return this.schemas.find(s => s.title == title).rows.filter(r => !r.reserved)
    }
  },
  watch: {
    sheet: function (newSheet, oldSheet) {
      this.editable = this.initColumns()
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
    tabClass(name) {
      return {
        "is-active": this.isTabSelected(name)
      }
    },
    isTabSelected(name) {
      return this.selectedtab == name
    },
    selectTab(name) {
      this.selectedtab = name
    },
    selectschema(schema) {
      this.selectedschema = schema
      this.editable = this.initColumns()
    },
    getPlaygroundUrl({ name, query }) {
      let endpoint = this.graphqlendpoint
      let tabs = [ { endpoint, query, name } ]
      return `${this.playgroundurl}?tabs=${stringifyAndEncode(tabs)}`
    },
    showModal(col) {
      console.log('open modal', col)
      this.modalcol = JSON.parse(JSON.stringify(col))
      if (!this.modalcol.relationship) {
        this.modalcol.relationship = this.initModal(col)
      }
      this.showmodal = true
    },
    closeModal() {
      this.showmodal = false
    },
    editRelationshipAction(remove) {
      console.log('edit relationshp', this.modalcol, remove)
      let schema = this.schemas.find(s => s.title == s.selected)
      let col = this.schema.rows.find(row => row.name == this.modalcol.name)
      if (remove === false) {
        col.relationship = false
      } else {
        col.relationship = this.modalcol.relationship
      }
      this.editable = this.initColumns()
      console.log('col', col)
      this.closeModal()
      this.modalcol = { relationship: { } }
    },
    async saveAction() {
      this.saving = true
      let datatypes = convertToDatatypes(this.editable)
      let relationships = convertToRelationships(this.editable)
      let config = mergeSheetDatatypesIntoConfig(this.sheet.config, this.schema.title, datatypes, relationships)
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
      let datatypes = getSheetDatatypes(this.sheet, this.schema.title)
      let relationships = getSheetRelationships(this.sheet, this.schema.title)
      return makeSchemaRowsEditable(this.schema.rows, datatypes, relationships)
    },
    initModal(col) {
      console.log(this.selectedfields)
      return {
        sheet: this.schema.title,
        field: this.selectedfields && this.selectedfields[0] && this.selectedfields[0].name,
        operator: "eq"
      }
    }
  },
  async created() {
    this.editable = this.initColumns()
  }
}

function getSheetDatatypes(sheet, title) {
  let config = sheet.config && sheet.config[title] || { }
  return config.datatypes || { }
}

function getSheetRelationships(sheet, title) {
  let config = sheet.config && sheet.config[title] || { }
  return config.relationships || { }
}

function mergeSheetDatatypesIntoConfig(config, title, datatypes, relationships) {
  config = JSON.parse(JSON.stringify(config))
  config[title] = config[title] || { datatypes: { }, relationships: { } }
  config[title].datatypes = datatypes
  config[title].relationships = relationships
  return config
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

function convertToRelationships(columns) {
  return columns.filter(col => !col.reserved).reduce((relationships, col) => {
    if (col.relationship) {
      relationships[col.name] = col.relationship
    }
    return relationships
  }, { })
}

function stringifyAndEncode(obj) {
  let data = JSON.stringify(obj)
  return (new Buffer(data)).toString('base64')
}

</script>

<style scoped>
tr.reserved {
  color: #999;
}

tr.reserved th {
  color: #999;
}

td.sample {
  font-size: .75rem;
}
</style>


