<template>
<div class="sheet-settings">
<div class="form">
  <h3 class="title is-4">Google Spreadsheet</h3>
  <div class="field">
    <label class="label">Access Mode</label>
    <div class="control">
      <div class="select">
        <select v-model="config.access">
          <option value="public">Public Access</option>
          <option value="private">Private Access</option>
        </select>
      </div>
    </div>
  </div>
  <br/>
  <div class="field">
    <label class="label">Value Render Option</label>
    <div class="control">
      <div class="select">
        <select v-model="config.mode">
          <option value="FORMATTED">FORMATTED</option>
          <option value="UNFORMATTED">UNFORMATTED</option>
        </select>
      </div>
    </div>
  </div>
  <br/>
  <h3 class="title is-4">Data Types</h3>
  <p v-show="!sheet">Loading ...</p>
  <div class="schema-form">
    <table class="table">
      <thead>
        <tr>
          <th>Field Name</th>
          <th>Data Type</th>
          <th>Sample Value</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="col in config.columns" v-bind:key="col.name">
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
  <br/>
  <nav class="level">
    <!-- Left side -->
    <div class="level-left">
      <div class="level-item">
        <a :class="{'button':true, 'is-info': true, 'is-loading': saving }" v-on:click="saveAction()">
          <span class="icon">
            <i class="fas fa-save"></i>
          </span>
          <span>Save Settings</span>
        </a>
      </div>
    </div>
    <!-- Right side -->
    <div class="level-right">
      <p class="level-item">
        <p class="control">
          <a class="button is-danger is-outlined" v-on:click="showDelete" v-if="sheet.id">Delete Supersheet</a>
        </p>
      </p>
    </div>
  </nav>
</div>
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

export default {
  name: 'sheet-settings',
  components: {
  },
  data: () => {
    return {
      deleting: false,
      showdelete: false,
      saving: false,
      config: { }
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
      'saveSheet',
      'deleteSheet'
    ]),
    async saveAction() {
      this.saving = true
      let metadata = this.convertToConfig(this.config)
      let res = await this.saveSheet({ id: this.sheet.id, metadata })
      this.saving = false
    },
    async deleteAction() {
      this.deleting = true
      try {
        await this.deleteSheet({ id: this.sheet.id })
        this.$router.push(`/`)
        this.addNotification({
          message: `Deleted successfully`,
          level: "success"
        })
      } catch (err) {
        console.log(err.response)
        this.addNotification({
          message: `${err.response.status} ${err.response.data.errorMessage}`,
          level: "danger"
        })
      } finally {
        this.deleting = false
        this.showdelete = false
      }
    },
    showDelete() {
      this.showdelete = true
    },
    closeDelete() {
      this.showdelete = false
    },
    convertToConfig(config) {
      let current = this.sheet.config || { }
      current.access = config.access
      current.mode = config.mode
      let datatypes = { }
      for (let col of config.columns) {
        datatypes[col.name] = col.datatype
      }
      current.datatypes = datatypes
      return { config: current }
    },
    initmetadata() {
      if (!this.sheet || !this.sheet.id) {
        return { access: 'public', mode: '', columns: [ ] }
      }
      let access = this.accessMode
      let mode = this.sheet && this.sheet.config && this.sheet.config.mode || 'FORMATTED'
      let datatypes = this.sheet && this.sheet.config && this.sheet.config.datatypes || { }
      let columns = JSON.parse(JSON.stringify(this.sheet.schema.columns))
      for (let col of columns) {
        if (datatypes[col.name]) {
          col.datatype = datatypes[col.name]
        }
      }
      return { access, mode, columns }
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
    this.config = this.initmetadata()
  }
}
</script>

<style scoped>
p.updated-at .help {
  padding: .4rem 0 .4rem 0
}

section.section.main {
  margin-top: 0;
  padding-top: 0;
}
</style>