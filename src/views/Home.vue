<template>
  <div class="sheet">
    <section class="section header">
      <div class="container">
        <h1 class="title is-2">All Sheets</h1>
        <div class="columns">
          <div class="column">
            <p v-show="loadingsheets">Loading ...</p>
            <div class="card" v-for="sheet in sheets">
              <div class="card-content">
                <p class="title is-4">
                  <router-link :to="`sheets/${sheet.id}`">{{ sheet.title }}</router-link>
                </p>
                <p class="help">
                  Last updated {{ sheet.updated_at.fromNow() }} on {{ sheet.updated_at.format('MMMM Do YYYY [at] h:mm:ss a') }} 
                </p>
              </div>
            </div>
          </div>
          <div class="column is-4">
            <article class="message is-success">
              <div class="message-header">
                <p>Create Supersheet</p>
              </div>
              <div class="message-body">
                <div class="new-form">
                  <div class="field">
                    <label class="label">Google Spreadsheet URL</label>
                    <div class="control">
                      <input class="input" type="text" placeholder="" v-model="url">
                    </div>
                    <p class="help">Paste the shareable link to your Google Sheet. Your sheet must have public access (i.e. Anyone with the link can view)</p>
                  </div>
                  <div class="field is-grouped">
                    <div class="control">
                      <button :class="{'button':true, 'is-success':true, 'is-loading': loading}" :disabled="!docid" v-on:click="reload">Create</button>
                    </div>
                    <div class="control">
                      <button class="button is-white" v-on:click="url = ''">Clear</button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
const moment = require('moment')
const docidRegex = new RegExp("/spreadsheets/d/([a-zA-Z0-9-_]+)")

export default {
  name: 'home',
  components: {
  },
  data: () => {
    return {
      loading: false,
      loadingsheets: true,
      url: "",
      sheets: [ ]
    }
  },
  computed: {
    ...mapState([
      'user'
    ]),
    docid: function() {
      return this.url && docidRegex.exec(this.url)[1] || ''
    }
  },
  methods: {
    ...mapActions([
      'getSheets',
      'reloadSheet'
    ]),
    async reload() {
      console.log("reload", this.docid)
      this.loading = true
      await this.reloadSheet({ id: this.docid })
      this.loading = false
      this.$router.push(`/sheets/${this.docid}`)
    }
  },
  async created() {
    this.sheets = await this.getSheets()
    this.sheets.forEach(sheet => sheet.updated_at = moment(sheet.updated_at))
    this.loadingsheets = false
  }
}
</script>

<style scoped>
.card {
  margin-bottom:1rem;
}
</style>
