<template>
  <div class="sheet">
    <section class="section header">
      <div class="container">
        <h1 class="title is-2">Sheets</h1>
        <div class="columns">
          <div class="column">
            <p v-show="loadingsheets">Loading ...</p>
            <div class="card" v-for="sheet in sheets">
              <div class="card-content">
                <p class="title is-4">
                  <router-link :to="`sheets/${sheet.id}`">{{ sheet.title }}</router-link>
                </p>
                <p class="help">
                 
                  <nav class="level">
                    <div class="level-left">
                      <div class="level-item">
                        Last updated {{ sheet.updated_at.fromNow() }} by danieljyoo ({{ sheet.updated_at.format('LLLL') }})
                      </div>
                    </div>
                    <div class="level-right">
                      danieljyoo
                    </div>
                  </nav>
                </p>
              </div>
            </div>
          </div>
          <div class="column is-4">
            <a class="button is-medium is-danger" v-on:click="showPicker">Import Google Sheet</a>
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
                      <button :class="{'button':true, 'is-success':true, 'is-loading': loading}" :disabled="!docid" v-on:click="load">Create</button>
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
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
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
    ...mapGetters([
      'idptoken'
    ]),
    docid: function() {
      return this.url && docidRegex.exec(this.url)[1] || ''
    }
  },
  methods: {
    ...mapMutations([
      'clearLoadStatus',
      'addNotification',
      'removeNotification'
    ]),
    ...mapActions([
      'getSheets',
      'startLoad',
      'checkLoadStatus',
      'endLoad',
      'showGooglePicker'
    ]),
    async load() {
      this.clearLoadStatus()
      this.loading = true
      try {
        let status = await this.startLoad({ id: this.docid })
        let interval = setInterval(async () => {
          try {
            console.log("interval")
            let update = await this.checkLoadStatus({ id: this.docid, uuid: status.uuid })
            if (update.completed_at) {
              clearInterval(interval)
            }
            if (update.status == "SUCCESS") {
              await this.endLoad({ id: this.docid })
              this.loading = false
              this.addNotification({
                message: `Loaded successfully`,
                level: "success"
              })
              this.$router.push(`/sheets/${this.docid}`)
            } else if (update.status == "FAILURE") {
              this.loading = false
              this.addNotification({
                message: `${this.loadstatus.error}`,
                level: "danger"
              })
            }
          } catch (err) {
            this.addNotification({
              message: `${err.message}`,
              level: "danger"
            })
          }
        }, 5 * 1000)
      } catch (err) {
        if (err.response) {
          console.log(err.response)
          this.addNotification({
            message: `${err.response.status} ${err.response.data.errorMessage}`,
            level: "danger"
          })
        } else {
          console.log(err)
          this.addNotification({
            message: `${err.message}`,
            level: "danger"
          })
        }
      } finally {
        // this.loading = false
      }
    },
    async showPicker() {
      this.showGooglePicker({ google })
    }
  },
  async created() {
    this.sheets = await this.getSheets()
    this.sheets.forEach(sheet => sheet.updated_at = moment(sheet.updated_at))
    this.loadingsheets = false

    gapi.load("picker", () => {
      console.log("Picker Loaded");
    })
  }
}
</script>

<style scoped>
.card {
  margin-bottom:1rem;
}
</style>
