<template>
  <div class="sheet">
  <section class="section">
    <div class="container">
      <div class="columns">
        <div class="column is-2">
           <aside class="menu">
              <ul class="menu-list">
                <li><a :class="menuClass('Overview')" v-on:click="selectmenu('Overview')">Overview</a></li>
                <li><a :class="menuClass('API')" v-on:click="selectmenu('API')">API</a></li>
                <li><a :class="menuClass('Schema')" v-on:click="selectmenu('Schema')">Schema</a></li>
                <li><a :class="menuClass('Source')" v-on:click="selectmenu('Source')">Source</a></li>
                <li><a :class="menuClass('Cache')" v-on:click="selectmenu('Cache')">Cache</a></li>
              </ul>
            </aside>
        </div>
        <div class="column">
          <Overview v-show="isSelected('Overview')"></Overview>
          <API v-show="isSelected('API')"></API>
          <Schema v-show="isSelected('Schema')"></Schema>
          <SheetData v-show="isSelected('Source')"></SheetData>
          <Cache v-show="isSelected('Cache')"></Cache>
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

import Overview from '@/components/Overview.vue'
import Cache from '@/components/Cache.vue'
import SheetData from '@/components/SheetData.vue'
import Schema from '@/components/Schema.vue'
import API from '@/components/API.vue'

const moment = require('moment')

export default {
  name: 'sheet',
  props: [ 'id' ],
  components: {
    Overview,
    Cache,
    SheetData,
    Schema,
    API
  },
  data: () => {
    return {
      loading: false,
      deleting: false,
      showdelete: false,
      selected: "Overview",
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
    ...mapMutations([
      'addNotification',
      'removeNotification'
    ]),
    ...mapActions([
      'getSheet',
      'reloadSheet',
      'deleteSheet'
    ]),
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
    },
    async deleteAction() {
      this.deleting = true
      try {
        await this.deleteSheet({ id: this.id })
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
    async selectmenu(name) {
      this.selected = name
    },
    menuClass(name) {
      return {
        "is-active": this.isSelected(name)
      }
    },
    isSelected(name) {
      return this.selected == name
    }
  },
  async created() {
    console.log("created")
    try {
      await this.getSheet({ id: this.id, force: true })
    } catch (err) {
      console.log(err.response)
      this.addNotification({
        message: `${err.response.status} ${err.response.data.errorMessage}`,
        level: "danger"
      })
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
p.updated-at .help {
  padding: .4rem 0 .4rem 0
}
</style>
