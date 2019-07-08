<template>
  <div class="sheet">
    <section class="section header">
      <div class="container" v-show="!error">
        <h1 class="title is-2" v-show="!error">{{ sheet.title }}</h1>
        <div class="field is-grouped" v-show="sheet.id">
          <p class="control">
            <a :class="{'button':true, 'is-info': true, 'is-outlined': true }" :href="sheet.url" target="_blank">
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
            <span class="help">Last updated on {{ updated }}</span>
            <span class="help" v-show="loading">Loading ...</span>
          </p>
        </div>
      </div>
      <div class="container" v-show="error">
        <h1 class="title is-2" v-show="error">Error</h1>
        <article class="message is-danger">
          <div class="message-header">
            <p>{{ error.status }} {{ error.message }}</p>
          </div>
          <div class="message-body">
            <p>There was an error trying to load this Supersheet.</p> 
            <br/>
            <div class="field is-grouped">
              <p class="control">
                <router-link class="button is-info is-outlined" to="/" v-show="user">View Sheets</router-link>
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
    <section class="section metadata" v-show="sheet.id">
      <div class="container">
        <div class="columns">
          <div class="column is-2">
            <aside class="menu">
              <p class="menu-label">
                API
              </p>
              <ul class="menu-list">
                <li><a :class="menuClass('Documentation')" v-on:click="selectmenu('Documentation')">Documentation</a></li>
              </ul>
              <p class="menu-label">
                Sheet Data
              </p>
              <ul class="menu-list">
                <li><a :class="menuClass('Overview')" v-on:click="selectmenu('Overview')">Overview</a></li>
                <li v-for="s in sheet.sheets">
                  <a :class="menuClass(`sheet-${s.title}`)" v-on:click="selectmenu(`sheet-${s.title}`)">{{ s.title }}</a>
                </li>
              </ul>
            </aside>
          </div>
          <div class="column">
            <div class="documentation" v-show="selected == 'Documentation'">
              <h2 class="title is-4">API Documentation</h2>
              <article class="message is-warning">
                <div class="message-header">
                  <p>Endpoint</p>
                </div>
                <div class="message-body">
                  {{ endpoint }}
                </div>
              </article>
            </div>
            <div class="overview" v-show="selected == 'Overview'">
              <h2 class="title is-4">Overview</h2>
              <p>
                This Supersheet has <strong>{{ sheet.sheets && sheet.sheets.length || -1 }} sheets</strong> and a total of <strong>{{ sheet.nrows }} rows</strong> of data. It is based in the <strong>{{ sheet.local }}</strong> locale and <strong>{{ sheet.tz }}</strong> timezone.
              </p>
            </div>
            <div class="sheetdata" v-show="selected.startsWith('sheet')">
              <h2 class="title is-4">{{ sheetdata.title }}</h2>
              <p>
                This sheet has <strong>{{ sheetdata.ncols }} columns</strong> and <strong>{{ sheetdata.nrows }} rows</strong> of data.
              </p>
              <br/>
              <h3 class="title is-5">Columns</h3>
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
              <h3 class="title is-5">Rows</h3>
              <p>Below is the first row of data in the sheet in JSON format:</p>
              <br/>
              <pre><code>{{ JSON.stringify(sheetdata.preview, null, 2) }}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section dangerzone">
      <div class="container">
        <hr/>
        <div class="field is-grouped">
          <p class="control">
            <a class="button is-danger is-outlined" v-on:click="showDelete" v-if="sheet.id">Delete Supersheet</a>
          </p>
        </div>
      </div>
    </section>
    <div :class="{'modal':true, 'is-active': showdelete }">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Delete Confirmation</p>
          <button class="delete" aria-label="close" v-on:click="closeDelete"></button>
        </header>
        <section class="modal-card-body">
          <!-- Content ... -->
          <p>Are you sure you want to delete this Supersheet?</p>
        </section>
        <footer class="modal-card-foot">
          <button :class="{'button':true, 'is-danger':true, 'is-loading': deleting}" v-on:click="deleteAction">Delete Supersheet</button>
          <button class="button" v-on:click="closeDelete">Cancel</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
const moment = require('moment')

export default {
  name: 'sheet',
  props: [ 'id' ],
  components: {
  },
  data: () => {
    return {
      loading: false,
      deleting: false,
      showdelete: false,
      error: false,
      selected: "Documentation",
      sheetdata: { }
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
      return `${d.fromNow()} on ${d.format('MMMM Do YYYY [at] h:mm:ss a')}`
    },
    endpoint: function () {
      if (!this.sheet || !this.sheet.id) return "?"
      return `${process.env.VUE_APP_SUPERSHEETSIO_ENDPOINT}/${this.sheet.id}`
    }
  },
  methods: {
    ...mapActions([
      'getSheet',
      'reloadSheet',
      'deleteSheet'
    ]),
    async reload() {
      console.log('reload clicked')
      this.loading = true
      await this.reloadSheet({ id: this.id })
      this.loading = false
    },
    async deleteAction() {
      this.deleting = true
      await this.deleteSheet({ id: this.id })
      this.deleting = false
      this.showdelete = false
      this.$router.push(`/`)
    },
    showDelete() {
      this.showdelete = true
    },
    closeDelete() {
      this.showdelete = false
    },
    selectmenu(name) {
      if (name.startsWith("sheet-")) {
        let title = name.substring(6)
        console.log('selectmenu', name.substring(6))
        this.sheetdata = this.sheet.sheets.find(s => s.title == title)
      }
      this.selected = name
    },
    menuClass(name) {
      return {
        "is-active": (this.selected == name)
      }
    }
  },
  async created() {
    try {
      await this.getSheet({ id: this.id, force: true })
    } catch (err) {
      console.log(err.response)
      if (err.response && err.response.data) {
        this.error = {
          status: err.response.status,
          message: err.response.data.errorMessage
        }
      } else {
        this.error = {
          status: err.status,
          message: "Unknown Error"
        }
      }
    }
  }
}
</script>

<style scoped>
p.updated-at .help {
  padding: .4rem 0 .4rem 0
}
</style>
