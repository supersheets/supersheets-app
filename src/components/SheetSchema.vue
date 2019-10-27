<template>
<div class="schema">
<div class="columns">
  <div class="column is-3">
    <aside class="menu" v-if="schema">
      <p class="menu-label">
        Sheets
      </p>
      <ul class="menu-list">
        <li v-for="s in schemas.filter(s => s.title != 'Rows')" v-bind:key="`menu-${s.title}`">
          <a :class="{ 'is-active': s == schema }" v-on:click="selectschema(s)">{{ s.title }}</a>
        </li>
      </ul>
      <p class="menu-label">
        System
      </p>
      <ul class="menu-list">
        <li v-for="s in schemas.filter(s => s.title == 'Rows')" v-bind:key="`menu-${s.title}`">
          <a :class="{ 'is-active': s == schema }" v-on:click="selectschema(s)">{{ s.title }}</a>
        </li>
      </ul>
    </aside>
  </div>
  <div class="column" v-if="schema">
    <h3 class="title is-3">{{ schema.title }}</h3>
    <div class="tabs">
      <ul>
        <li :class="tabClass('fields')"><a v-on:click="selectTab('fields')">Fields</a></li>
        <li :class="tabClass('queries')"><a v-on:click="selectTab('queries')">Queries</a></li>
      </ul>
    </div>
    <div class="fieldscontent" v-show="isTabSelected('fields')">
      <nav class="level">
        <div class="level-left">
          <div class="level-item">
            <h5 class="title is-5">Fields</h5>
          </div>
        </div>
        <div class="level-right">
          <div class="level-item">
            <div class="field">
              <div class="control">
                <label class="checkbox">
                  <input type="checkbox" v-model="showreserved">
                  Show reserved fields
                </label>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>GraphQL Type</th>
            <th>Supersheets Type</th>
            <th>Sample Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="col in schema.rows" v-bind:key="`row-${col.name}`" :class="{ 'reserved': col.reserved }" v-show="!col.reserved || showreserved">
            <th v-if="!col.embedded">{{ col.name }}</th>
            <th v-if="col.embedded">&rdsh; {{ col.name }}</th>
            <td>{{ col.datatype }}</td>
            <td>{{ col.graphql }}</td>
            <td><em>{{ col.sample }}</em></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="queriescontent" v-show="isTabSelected('queries')">
      <div class="graphqlquery" v-for="query in queries" v-bind:key="`query-${query.name}`">
        <nav class="level">
          <div class="level-left">
            <div class="level-item">
              <h5 class="title is-5">{{ query.name }} </h5>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item" >
              <a :href="getPlaygroundUrl({ name: query.name, query: query.query })" class="button is-small is-danger" target="_blank">
                <span>Run in GraphQL Playground</span>
                <span class="icon">
                  <i class="fas fa-play"></i>
                </span>
              </a>
            </div>
          </div>
        </nav>
        <prism language="graphql" class="content">{{ query.query }}</prism>
        <br/>
        <br/>
      </div>
    </div>
  </div>
</div>
</div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { buildQueriesForSchema } from '@/lib/queryutil.js'

import Prism from 'vue-prismjs'
const pluralize = require('pluralize')

const moment = require('moment')

export default {
  name: 'sheet-schema',
  components: {
    Prism
  },
  data: () => {
    return {
      selectedtab: "fields",
      selectedschema: null,
      showreserved: false
    }
  },
  computed: {
    ...mapState([
      'sheet'
    ]),
    ...mapGetters([
      'graphqlendpoint',
      'schemas'
    ]),
    playgroundurl: function () {
      if (!this.sheet || !this.sheet.id) return "..."
      return `${this.graphqlendpoint}/playground`
    },
    queries: function () {
      return this.schema && buildQueriesForSchema(this.schema) || [ ]
    },
    schema: function () {
      return this.selectedschema || this.schemas.find(s => s.title != "Rows")
    }
  },
  methods: {
    ...mapMutations([
      'addNotification',
      'removeNotification'
    ]),
    ...mapActions([
      'saveSheet',
      'getSheet'
    ]),
    tabClass(name) {
      return {
        "is-active": this.isTabSelected(name)
      }
    },
    isTabSelected(name) {
      return this.selectedtab == name
    },
    selectTab(name) {
      this.selectedtab = name
    },
    selectschema(schema) {
      this.selectedschema = schema
    },
    getPlaygroundUrl({ name, query }) {
      let endpoint = this.graphqlendpoint
      let tabs = [ { endpoint, query, name } ]
      return `${this.playgroundurl}?tabs=${stringifyAndEncode(tabs)}`
    }
  }
}

function stringifyAndEncode(obj) {
  let data = JSON.stringify(obj)
  return (new Buffer(data)).toString('base64')
}

</script>

<style scoped>
tr.reserved {
  color: #999;
}

tr.reserved th {
  color: #999;
}
</style>


