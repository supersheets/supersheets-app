<template>
  <div class="sheet">
  <section class="section">
    <div class="container">
      <SheetHeader></SheetHeader>
    </div>
  </section>
  <section class="section main">
    <div class="container">
      <div class="tabs is-boxed">
        <ul>
          <li :class="menuClass('Overview')"><a v-on:click="selectmenu('Overview')">About</a></li>
          <li :class="menuClass('Stats')"><a v-on:click="selectmenu('Stats')">Stats</a></li>
          <li :class="menuClass('Settings')"><a v-on:click="selectmenu('Settings')">Settings</a></li>
        </ul>
      </div>
    </div>
    <br/>
    <br/>
    <div class="container">
      <Overview v-show="isSelected('Overview')" v-if="loaded"></Overview>
      <SheetStats v-show="isSelected('Stats')" v-if="loaded"></SheetStats>
      <SheetSettings v-show="isSelected('Settings')" v-if="loaded"></SheetSettings>
    </div>
  </section>
 
</div>
</template>
<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import SheetHeader from '@/components/SheetHeader.vue'
import SheetStats from '@/components/SheetStats.vue'
import SheetSettings from '@/components/SheetSettings.vue'
import Overview from '@/components/Overview.vue'

const moment = require('moment')

export default {
  name: 'sheet',
  props: [ 'id' ],
  components: {
    SheetHeader,
    Overview,
    SheetStats,
    SheetSettings
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
    loaded: function () {
      return this.sheet && this.sheet.id || false
    },
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

section.section.main {
  margin-top: 0;
  padding-top: 0;
}
</style>
