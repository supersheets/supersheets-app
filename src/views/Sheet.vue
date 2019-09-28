<template>
  <div class="sheet">
  <section class="section">
    <div class="container">
      <SheetHeader></SheetHeader>
    </div>
  </section>
  <section class="section main">
    <div class="container">
      <div class="tabs">
        <ul>
          <li :class="menuClass('Fields')"><a v-on:click="selectmenu('Fields')">Fields</a></li>
          <li :class="menuClass('History')" v-show="false"><a v-on:click="selectmenu('History')">History</a></li>
          <li :class="menuClass('Settings')"><a v-on:click="selectmenu('Settings')">Settings</a></li>
          <li :class="menuClass('Start')"><a v-on:click="selectmenu('Start')">Getting Started</a></li>
        </ul>
      </div>
    </div>
    <br/>
    <br/>
    <div class="container">
      <SheetStart v-show="isSelected('Start')" v-if="loaded"></SheetStart>
      <Overview v-show="isSelected('Fields')" v-if="loaded"></Overview>
      <SheetSettings v-show="isSelected('Settings')" v-if="loaded"></SheetSettings>
    </div>
  </section>
</div>
</template>
<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import SheetHeader from '@/components/SheetHeader.vue'
import SheetStart from '@/components/SheetStart.vue'
import SheetStats from '@/components/SheetStats.vue'
import SheetSettings from '@/components/SheetSettings.vue'
import Overview from '@/components/Overview.vue'

const moment = require('moment')

export default {
  name: 'sheet',
  props: [ 'id' ],
  components: {
    SheetHeader,
    SheetStart,
    Overview,
    SheetStats,
    SheetSettings
  },
  data: () => {
    return {
      loading: false,
      selected: "Fields",
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
    }
  },
  methods: {
    ...mapMutations([
      'addNotification',
      'removeNotification'
    ]),
    ...mapActions([
      'getSheet',
    ]),
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
