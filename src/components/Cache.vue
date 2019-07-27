<template>
<div class="cache">
  <h2 class="title is-3">Cache</h2>
  <p v-show="!cache">Loading ...</p>
  <table class="table is-striped" v-if="cache">
    <tbody>
      <tr>
        <th>Key</th>
        <td>{{ cache.key || 'Uninitialized' }}</td>
      </tr>
      <tr>
        <th>Number of Items</th>
        <td class="num-items">
          <span class="value">{{ cache && cache.n }}</span>
          <a :class="{'button':true, 'is-info': true, 'is-loading': loading, 'is-small': true }" v-on:click="cacheInfoAction(true)">Show</a>
          <a :class="{'button':true, 'is-danger': true, 'is-loading': clearing, 'is-small': true }" v-on:click="clearCacheAction()">Clear</a>
        </td>
      </tr>
      <tr>
        <th>Expiration</th>
        <td>{{ expires }}</td>
      </tr>
    </tbody>
  </table>
  
  <br/>
  <h3 class="title is-4" v-if="cache && cache.values">Items ({{ cache.n }})</h3>
  <div class="bd-snippet-code highlight-full bd-is-more" v-if="cache && cache.values">
    <figure class="highlight"><pre><code class="language-html" data-lang="html">{{ cache.values }}</code></pre></figure>
  </div>
</div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
const moment = require('moment')

export default {
  name: 'sheet-cache',
  components: {
  },
  data: () => {
    return {
      loading: false,
      clearing: false,
      cache: null
    }
  },
  computed: {
    ...mapState([
      'user',
      'sheet'
    ]),
    expires() {
      if (!this.cache) return '...'
      if (this.cache.ttl == -1) {
        return 'Never'
      } 
      return `${moment().add(this.cache.ttl, 'seconds').fromNow()}`
    }
  },
  methods: {
    ...mapMutations([
      'addNotification',
      'removeNotification'
    ]),
    ...mapActions([
      'deleteCache',
      'getCacheInfo'
    ]),
    async clearCacheAction() {
      this.clearing = true
      this.cache = await this.deleteCache({ id: this.sheet.id })
      this.clearing = false
    },
    async cacheInfoAction(values) {
      this.loading = true
      this.cache = await this.getCacheInfo({ id: this.sheet.id, values})
      this.loading = false
    }
  },
  async created() {
    this.cache = await this.getCacheInfo({ id: this.sheet.id })
  }
}
</script>

<style scoped>
td.num-items span.value {
  margin-right:2rem;
}
td.num-items a.button {
  margin-right: .5rem;
}
</style>


