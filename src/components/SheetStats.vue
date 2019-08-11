<template>
<div class="sheet-stats">
<h3 class="title is-4">Cache</h3>
<nav class="level">
  <!-- Left side -->
  <div class="level-left">
    <div class="level-item">
      <a :class="{'button':true, 'is-info': true, 'is-loading': loading, 'is-small': true }" v-on:click="cacheInfoAction(false)">
        <span class="icon">
          <i class="fas fa-sync-alt"></i>
        </span>
        <span>Refresh</span>
      </a>
    </div>
    <div class="level-item">
      <a :class="{'button':true, 'is-info': true, 'is-loading': loading, 'is-small': true }" v-on:click="cacheInfoAction(true)">
        <span class="icon">
          <i class="fas fa-eye"></i>
        </span>
        <span>Show Items</span>
      </a>
    </div>
  </div>
  <!-- Right side -->
  <div class="level-right">
    <p class="level-item">
      <a :class="{'button':true, 'is-danger': true, 'is-loading': clearing, 'is-small': true }" v-on:click="clearCacheAction()">
        <span class="icon">
          <i class="fas fa-trash-alt"></i>
        </span>
        <span>Clear Cache</span>
      </a>
    </p>
  </div>
</nav>

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
      </td>
    </tr>
    <tr>
      <th>Expiration</th>
      <td>{{ expires }}</td>
    </tr>
    <tr v-if="cache && cache.values">
      <th>Items</th>
      <td>
        <div class="bd-snippet-code highlight-full bd-is-more" v-if="cache && cache.values">
          <figure class="highlight"><pre><code class="language-html" data-lang="html">{{ cache.values }}</code></pre></figure>
        </div>
      </td>
    </tr>
  </tbody>
</table>
</div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'

export default {
  name: 'sheet-stats',
  components: {
  },
  data: () => {
    return {
      loading: false,
      clearing: false
    }
  },
  computed: {
    ...mapState([
      'user',
      'sheet',
      'cache'
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
      await this.deleteCache({ id: this.sheet.id })
      this.clearing = false
      
    },
    async cacheInfoAction(values) {
      this.loading = true
      await this.getCacheInfo({ id: this.sheet.id, values})
      this.loading = false
    },
  },
  async created() {
    // this.cache = await this.getCacheInfo({ id: this.sheet.id })
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