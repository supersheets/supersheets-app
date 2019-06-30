<template>
  <div class="sheet">
    <section class="section header">
      <div class="container">
        <h1 class="title">{{ sheet.title }}</h1>
        <div class="field is-grouped">
          <p class="control">
            <a class="button is-info" v-on:click="preview">Preview Data</a>
          </p>
          <p class="control">
            <a :class="{'button':true, 'is-loading':loading, 'is-success': true }" v-on:click="reload">Reload Data</a>
          </p>
          <p class="control">
            <span>Last updated on {{ updated }}</span>
          </p>
          <p class="control">
            <a :class="{'button':true, 'is-info': true, 'is-outlined': true }" :href="sheet.url" target="_blank">
              <span class="icon">
                <i class="fas fa-external-link-alt"></i>
              </span>
              <span>Google Sheet</span>
            </a>
          </p>
          <p class="control">
            <a class="button is-danger is-outlined" v-on:click="deleteAction">Delete Supersheet</a>
          </p>
        </div>

      </div>
    </section>
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
      loading: false
    }
  },
  computed: {
    ...mapState([
      'user',
      'sheet'
    ]),
    updated: function () {
      return this.sheet && moment(this.sheet.updated_at) || "Unknown"
    }
  },
  methods: {
    ...mapActions([
      'getSheet',
      'reloadSheet',
      'deleteSheet'
    ]),
    async preview() {
      console.log("preview")
    },
    async reload() {
      console.log("reload")
      this.loading = true
      await this.reloadSheet({ id: this.id })
      this.loading = false
    },
    async deleteAction() {
      console.log("delete")
    }
  },
  async created() {
    let sheet = await this.getSheet({ id: this.id, force: true })
  }
}
</script>
