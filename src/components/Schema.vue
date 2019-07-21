<template>
<div class="schema">
  <h2 class="title is-3">Schema</h2>
  <p v-show="!sheet">Loading ...</p>
  <div class="schema-form">
    <div class="field">
      <label class="label">Mode</label>
      <div class="control">
        <label class="radio">
          <input type="radio" value="FORMATTED" v-model="metadata.mode">
          String only 
        </label>
        <label class="radio">
          <input type="radio" value="UNFORMATTED" v-model="metadata.mode">
          Typed
        </label>
      </div>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Data Type</th>
          <th>Sample Value</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="col in metadata.columns" v-bind:key="col.name">
          <th>{{ col.name }}</th>
          <td>
            <div class="control">
              <div class="select is-small">
                <select v-model="col.datatype">
                  <option>String</option>
                  <option>Number</option>
                  <option>Datetime</option>
                </select>
              </div>
            </div>
          </td>
          <td><em>{{ formatSample(col) }}</em></td>
        </tr>
      </tbody>
    </table>
  </div>
  <br/>
  <div class="field is-grouped">
    <p class="control">
      <a :class="{'button':true, 'is-success': true, 'is-loading': saving }" v-on:click="saveSchemaAction()">Save Schema</a>
    </p>
  </div>
</div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
const moment = require('moment')

export default {
  name: 'sheet-schema',
  components: {
  },
  data: () => {
    return {
      saving: false,
      metadata: { mode: '', columns: [ ] },
      selectedmode: 'FORMATTED'
    }
  },
  computed: {
    ...mapState([
      'user',
      'sheet'
    ])
  },
  methods: {
    ...mapMutations([
      'addNotification',
      'removeNotification'
    ]),
    ...mapActions([
      'saveSheet'
    ]),
    async saveSchemaAction() {
      this.saving = true
      let metadata = this.convertToConfig(this.metadata)
      let res = await this.saveSheet({ id: this.sheet.id, metadata })
      console.log("SAVE", res)
      this.saving = false
    },
    initmetadata() {
      if (!this.sheet || !this.sheet.id) {
        return { mode: '', columns: [ ] }
      }
      let mode = this.sheet && this.sheet.config && this.sheet.config.mode || 'FORMATTED'
      let datatypes = this.sheet && this.sheet.config && this.sheet.config.datatypes || { }
      let columns = JSON.parse(JSON.stringify(this.sheet.schema.columns))
      for (let col of columns) {
        if (datatypes[col.name]) {
          col.datatype = datatypes[col.name]
        }
      }
      return { mode, columns }
    },
    convertToConfig(metadata) {
      let mode = metadata.mode
      let datatypes = { }
      for (let col of metadata.columns) {
        datatypes[col.name] = col.datatype
      }
      return { config: { mode, datatypes } }
    },
    formatSample(col) {
      if (col.datatype == "String") {
        if (col.sample && col.sample.length > 50) {
          return `${col.sample.substring(0, 47)}...`
        } else {
          return col.sample
        }
      } else {
        return col.sample
      }
    }
  },
  async created() {
    this.metadata = this.initmetadata()
  }
}
</script>

<style scoped>
p.updated-at .help {
  padding: .4rem 0 .4rem 0
}
</style>


