<template>
<div class="overview">
  <h2 class="title is-3">Source</h2>
  <p>
    The datasource of this Supersheet is a Google Spreadsheet: <em><a :href="sheet.url" target="_blank">{{ sheet.title }}</a></em>. 
    It has a total of <strong>{{ sheet.nrows }} rows</strong> across  <strong>{{ sheet.sheets && sheet.sheets.length || -1 }} sheets</strong>. 
    It is based in the <strong>{{ sheet.local }}</strong> locale and <strong>{{ sheet.tz }}</strong> timezone.
  </p>
  <br/>
  <div class="tabs">
    <ul>
      <li v-for="s in sheet.sheets" v-bind:key="s.title" :class="menuClass(s.title)">
        <a v-on:click="selectmenu(s.title)">{{ s.title }}</a>
      </li>
    </ul>
  </div>

  <div class="sheetdata" v-show="sheetdata.title">
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
          <td>String</td>
        </tr>
      </tbody>
    </table>
    <h4 class="title is-5">Rows ({{ sheetdata.nrows }})</h4>
    <p>Below is the first row of data in the sheet in JSON format:</p>
    <br/>
    <pre><code>{{ JSON.stringify(sheetdata.preview, null, 2) }}</code></pre>
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
      loading: false,
      selected: '',
      sheetdata: { }
    }
  },
  computed: {
    ...mapState([
      'user',
      'sheet'
    ]),
  },
  methods: {
    ...mapMutations([
      'addNotification',
      'removeNotification'
    ]),
    ...mapActions([
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
    async reload() {
      this.loading = true
      try {
        await this.reloadSheet({ id: this.id })
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
    }
  },
  async created() {
    this.sheetdata = this.sheet.sheets[0]
    this.selected = this.sheetdata.title
  }
}
</script>

<style scoped>
p.updated-at .help {
  padding: .4rem 0 .4rem 0
}
</style>


