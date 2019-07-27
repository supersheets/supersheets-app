<template>
<div class="schema">
  <h2 class="title is-3">Database</h2>
  <table class="table is-striped">
    <tbody>
      <tr>
        <th>Google Spreadsheet Id</th>
        <td>{{ sheet.id }}</td>
      </tr>
      <tr>
        <th>Supersheet UUID</th>
        <td>{{ sheet.uuid }}</td>
      </tr>
      <tr>
        <th>Collection UUID</th>
        <td>{{ sheet.datauuid }}</td>
      </tr>
    </tbody>
  </table>
  <h3 class="title is-4">Metadata</h3>
  <div class="bd-snippet-code highlight-full bd-is-more" v-if="db">
    <figure class="highlight"><pre><code class="language-html" data-lang="html">{{ sheet }}</code></pre></figure>
  </div>
  <br/>
  <h3 class="title is-4">Stats</h3>
  <p v-show="!db">Loading ...</p>
  <div class="bd-snippet-code highlight-full bd-is-more" v-if="db">
    <figure class="highlight"><pre><code class="language-html" data-lang="html">{{ db }}</code></pre></figure>
  </div>
</div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
const moment = require('moment')

export default {
  name: 'sheet-schema',
  components: {
  },
  data: () => {
    return {
      db: null
    }
  },
  computed: {
    ...mapState([
      'user',
      'sheet'
    ])
  },
  methods: {
    ...mapMutations([
      'addNotification',
      'removeNotification'
    ]),
    ...mapActions([
    ]),
    async getDbInfo() {
      return { hello: "world" }
    }
  },
  async created() {
    this.db = await this.getDbInfo()
  }
}
</script>

<style scoped>
</style>


