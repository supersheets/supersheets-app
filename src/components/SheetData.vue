<template>
<div class="overview">
  <h2 class="title is-3">Source</h2>
  <table class="table is-striped">
    <tbody>
      <tr>
        <th>Datasource</th>
        <td><span class="tag is-info datasource-type">Google Spreadsheet</span> <a :href="sheet.url" target="_blank">{{ sheet.title }}</a></td>
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
  <h3 class="title is-4">Sheets</h3>
  <div class="tabs is-boxed">
    <ul>
      <li v-for="s in sheet.sheets" v-bind:key="s.title" :class="menuClass(s.title)">
        <a v-on:click="selectmenu(s.title)">{{ s.title }}</a>
      </li>
    </ul>
  </div>
  <div class="sheetdata" v-show="sheetdata.title">
    <div class="columns">
      <div class="column">
        <h4 class="title is-5">Columns ({{ sheetdata.ncols }})</h4>
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Data Type</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="col of sheetdata.columns">
                <td>{{ col }}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
      </div>
      <div class="column">
        <h4 class="title is-5">Rows ({{ sheetdata.nrows }})</h4>
        <p>Below is the first row of data in the sheet in JSON format:</p>
        <br/>
        <pre><code>{{ JSON.stringify(sheetdata.preview, null, 2) }}</code></pre>
      </div>
    </div>
  </div>
  <br/>
  <hr/>
  <h3 class="title is-4">Settings</h3>
  <div class="columns">
    <div class="column">
      
    </div>
    <div class="column"></div>
  </div>
</div>

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
      selected: '',
      sheetdata: { },
      access: 'public'
    }
  },
  computed: {
    ...mapState([
      'user',
      'sheet'
    ]),
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
      'saveSheet'
    ]),
    selectmenu(title) {
      this.sheetdata = this.sheet.sheets.find(s => s.title == title)
      this.selected = title
    },
    menuClass(title) {
      return {
        "is-active": this.isSelected(title)
      }
    },
    isSelected(title) {
      return this.selected == title
    },
    async saveAction() {
      this.saving = true
      let metadata = this.convertToConfig(this.access)
      let res = await this.saveSheet({ id: this.sheet.id, metadata })
      this.saving = false
    },
    convertToConfig(access) {
      let config = this.sheet.config || { }
      config.access = access
      return { config }
    },
  },
  async created() {
    this.sheetdata = this.sheet.sheets[0]
    this.selected = this.sheetdata.title
    this.access = this.accessMode
  }
}
</script>

<style scoped>
span.tag.datasource-type {
  margin-right: .5rem;
}
</style>


