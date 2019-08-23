<template>
<div class="sheet-settings">
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
<table class="table" v-if="cache">
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
<br/>
<div class="form">
  <h3 class="title is-4">Google Spreadsheet</h3>
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
  <nav class="level">
    <!-- Left side -->
    <div class="level-left">
      <div class="level-item">
        <a :class="{'button':true, 'is-success': true, 'is-loading': saving, 'is-small': true }" v-on:click="saveAction()">
          <span class="icon">
            <i class="fas fa-save"></i>
          </span>
          <span>Save Settings</span>
        </a>
      </div>
    </div>
    <!-- Right side -->
    <div class="level-right">
    </div>
  </nav>
</div>
<br/>
<hr/>

<nav class="level">
  <!-- Left side -->
  <div class="level-left">
    <div class="level-item">
      <p class="control">
        <a class="button is-danger is-outlined" v-on:click="showDelete" v-if="sheet.id">Delete Supersheet</a>
      </p>
    </div>
  </div>
  <!-- Right side -->
  <div class="level-right">
  </div>
</nav>
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
      clearing: false,
      loading: false,
      config: { }
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
  watch: {
    sheet: function (newSheet, oldSheet) {
      this.config = this.initmetadata()
    }
  },
  methods: {
    ...mapMutations([
      'addNotification',
      'removeNotification'
    ]),
    ...mapActions([
      'saveSheet',
      'deleteSheet',
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
    async saveAction() {
      this.saving = true
      let config = Object.assign({ }, this.sheet.config, this.config)
      console.log("CONFIG", config)
      let res = await this.saveSheet({ id: this.sheet.id, metadata: { config } })
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
    initmetadata() {
      if (!this.sheet || !this.sheet.id) {
        return { mode: '' }
      }
      let mode = this.sheet && this.sheet.config && this.sheet.config.mode || 'FORMATTED'
      return { mode  }
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

tr.embedded {
  background: #fafafa;
}
</style>