<template>
  <div class="sheet">
    <section class="section header">
      <div class="container">
        <div class="columns">
          <div class="column">
            <nav class="level">
              <div class="level-left">
                <div class="level-item">
                  <h1 class="title is-2">My Supersheets</h1>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <div class="field">
                    <div class="control">
                      <a :class="{ 'button':true, 'is-danger':true, 'is-loading':loading }" v-on:click="showPicker" :disabled="!pickerloaded">
                        <span class="icon is-medium" style="margin-right:.4rem;">
                          <i class="fas fa-table"></i>
                        </span>
                        New Supersheet
                      </a>
                    </div>
                    <p class="help" v-show="!loading">&nbsp;</p>
                    <p class="help" v-show="loading">{{ message }}</p>
                  </div>
                </div>
              </div>
            </nav>
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
          <div class="column is-3">
            <div class="field" v-if="false">
              <div class="control">
                <a :class="{ 'button':true, 'is-medium':true, 'is-danger':true, 'is-loading':loading }" v-on:click="showPicker" :disabled="!pickerloaded">
                 <span class="icon is-medium" style="margin-right:.4rem;">
                    <i class="fas fa-table"></i>
                  </span>
                  New Supersheet
                </a>
              </div>
              <p class="help" v-show="!loading">
                Select a Google Spreadsheet from your Google Drive to create a Supersheet. Your sheet must have public access: <em>Anyone with the link can view</em>.
              </p>
              <p class="help" v-show="loading">{{ message }}</p>
            </div>
            <article class="message is-success" v-if="false">
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
                      <button :class="{'button':true, 'is-success':true, 'is-loading': loading }" :disabled="!docid" v-on:click="load">Create</button>
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
      pickedid: null,
      sheets: [ ],
      pickerloaded: false
    }
  },
  computed: {
    ...mapState([
      'user',
      'loadstatus'
    ]),
    ...mapGetters([
    ]),
    docid: function() {
      return this.pickedid || this.url && docidRegex.exec(this.url)[1] || ''
    },
    message: function () {
      return `${this.loadstatus.message}`
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
      this.showGooglePicker({ google, callback: this.pickerCallback })
    },
    async pickerCallback(data) {
      if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
        console.log("selected spreadsheet:", data.docs && data.docs[0]);
        this.pickedid = data.docs && data.docs[0] && data.docs[0].id || null
        await this.load()
      }
    }
  },
  async created() {
    try {
      this.sheets = await this.getSheets()
      this.sheets.forEach(sheet => sheet.updated_at = moment(sheet.updated_at))
      this.loadingsheets = false
    } catch (err) {
      console.error(err)
    }
    gapi.load("picker", () => {
      console.log("picker loaded")
      this.pickerloaded = true
    })
  }
}
</script>

<style scoped>
.card {
  margin-bottom:1rem;
}
</style>
