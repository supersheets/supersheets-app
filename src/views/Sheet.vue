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
          <li :class="menuClass('Schema')"><a v-on:click="selectmenu('Schema')">Schema</a></li>
          <li :class="menuClass('Datatypes')"><a v-on:click="selectmenu('Datatypes')">Data Types</a></li>
          <li :class="menuClass('History')" v-show="false"><a v-on:click="selectmenu('History')">History</a></li>
          <li :class="menuClass('Advanced')"><a v-on:click="selectmenu('Advanced')">Advanced</a></li>
        </ul>
      </div>
    </div>
    <br/>
    <br/>
    <div class="container">
      <SheetSchema v-show="isSelected('Schema')" v-if="loaded"></SheetSchema>
      <SheetDatatypes v-show="isSelected('Datatypes')" v-if="loaded"></SheetDatatypes>
      <SheetSettings v-show="isSelected('Advanced')" v-if="loaded"></SheetSettings>
    </div>
  </section>
</div>
</template>
<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import SheetHeader from '@/components/SheetHeader.vue'
import SheetSchema from '@/components/SheetSchema.vue'
import SheetDatatypes from '@/components/SheetDatatypes.vue'
// import SheetStats from '@/components/SheetStats.vue'
import SheetSettings from '@/components/SheetSettings.vue'

const moment = require('moment')

export default {
  name: 'sheet',
  props: [ 'id' ],
  components: {
    SheetHeader,
    SheetSchema,
    SheetDatatypes,
    // SheetStats,
    SheetSettings
  },
  data: () => {
    return {
      loading: false,
      selected: "Schema",
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
      let d = momgt(this.sheet.updated_at)
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
