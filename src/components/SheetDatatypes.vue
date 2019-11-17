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
    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label">Sheet</label>
      </div>
      <div class="field-body">
        <div class="field">
          <p class="control">
            <div class="select is-small" v-if="columns">
              <select v-model="selected">
                <option v-for="schema in schemas" v-bind:key="`schema-${schema.title}`">{{ schema.title }}</option>
              </select>
            </div>
          </p>
        </div>
      </div>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>Field</th>
          <th>Supersheets</th>
          <th></th>
          <th>GraphQL</th>
          <th>Sample Value</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="col in columns" v-bind:key="`datatype-${col.fullname}`" :class="{ 'highlight': (col.datatype != col.configdatatype), 'reserved': col.reserved }">
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
            <a class="button is-small" v-if="!col.relationship && !col.embedded && col.datatype != 'GoogleDoc'"  v-on:click="showModal(col)">
              + Relationship
            </a>
          </td>
          <td>{{ convertToGraphQL(col) }}</td>
          <td><em>{{ col.sample }}</em></td>
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
        {{ selected }}:{{ modalcol.name }}:{{ modalcol.sample }}
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
import { makeSchemaRowsEditable, convertToGraphQLType, generateGraphQLNames } from '@/lib/schemautil.js'

const moment = require('moment')

export default {
  name: 'sheet-datatypes',
  components: {
  },
  data: () => {
    return {
      saving: false,
      selected: null,
      columns: [ ],
      showmodal: false,
      modalcol: { relationship: { } }
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
      return this.schemas.find(s => s.title == this.selected).rows.filter(r => !r.reserved)
    },
    unformatted: function() {
      return this.sheet && this.sheet.config && this.sheet.config.mode == 'UNFORMATTED' || false
    },
    selectedfields: function() {
      let title = this.modalcol && this.modalcol.relationship && this.modalcol.relationship.sheet || this.selected
      return this.schemas.find(s => s.title == title).rows.filter(r => !r.reserved)
    }
  },
  watch: {
    sheet: function (newSheet, oldSheet) {
      this.columns = this.initColumns()
    },
    selected: function(newSelected, oldSelected) {
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
      let col = this.columns.find(col => col.name == this.modalcol.name)
      if (remove === false) {
        col.relationship = false
      } else {
        col.relationship = this.modalcol.relationship
      }
      console.log('col', col)
      this.closeModal()
      this.modalcol = { relationship: { } }
    },
    async saveAction() {
      this.saving = true
      let datatypes = convertToDatatypes(this.columns)
      let relationships = convertToRelationships(this.columns)
      let config = mergeSheetDatatypesIntoConfig(this.sheet.config, this.selected, datatypes, relationships)
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
      let datatypes = getSheetDatatypes(this.sheet, this.selected)
      let relationships = getSheetRelationships(this.sheet, this.selected)
      return makeSchemaRowsEditable(this.editablerows, datatypes, relationships)
    },
    initModal(col) {
      console.log(this.selectedfields)
      return {
        sheet: this.selected,
        field: this.selectedfields && this.selectedfields[0] && this.selectedfields[0].name,
        operator: "eq"
      }
    }
  },
  async created() {
    this.selected = this.schemas[0] && this.schemas[0].title
    this.columns = this.initColumns()
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


