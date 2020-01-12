<template>
  <div class="sheet">
    <section class="section header">
      <div class="container">
        <h1 class="title is-2">Account</h1>
        <div class="columns">
          <div class="column">
            <div class="card">
              <div class="card-content">
                <div class="media">
                  <div class="media-left">
                    <figure class="image is-128x128">
                      <img :src="user.image_url">
                    </figure>
                  </div>
                  <div class="media-content">
                    <p class="title is-4">{{ user.name }}</p>
                    <p class="subtitle is-6">{{ user.email }}</p>
                    <p class="help">Domain: {{ user.domain }}</p>
                    <p class="help">ID: {{ user.sub }}</p>
                    <p></p>
                  </div>
                </div>
                <hr/>
                <div class="content">
                  <p class="help" style="word-break:break-all;">
                    <b>ID Token</b><br/>
                    {{ user.token }}<br/><br/>
                    <b>Access Token</b><br/>
                    {{ user.access }}<br/><br/>
                    Issued: {{ issuedAt }} ({{ issuedAt.fromNow() }})<br/>
                    Expires: {{ expiresAt }} ({{ expiresAt.fromNow() }})<br/><br/>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="column is-4">
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
const moment = require('moment')
const docidRegex = new RegExp("/spreadsheets/d/([a-zA-Z0-9-_]+)")

export default {
  name: 'home',
  components: {
  },
  data: () => {
    return {
    }
  },
  computed: {
    ...mapState([
      'user'
    ]),    
    issuedAt: function() {
      return moment(this.user.issuedAt)
    },
    expiresAt: function() {
      return moment(this.user.expiresAt)
    }
  },
  methods: {
    ...mapMutations([
      'addNotification',
      'removeNotification'
    ]),
    ...mapActions([
    ])
  },
  async created() {
  }
}
</script>

<style scoped>
</style>
