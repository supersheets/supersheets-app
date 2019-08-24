<template>
<div class="sheet-start">
  <div class="columns">
    <div class="column">
      <h4 class="title is-4">Contents</h4>
      <ul class="toc">
        <li><a href="#access">Accessing Your Data</a></li>
        <li><a href="#query">Querying Your Data</a></li>
        <li><a href="https://docs.google.com/document/d/1wyuvWnr9WnIKP8Wh_d0ycLRQ-jYgeYr-O98hfHAMJZA/edit?usp=sharing" target="_blank">Full Documentation &rarr;</a></li>
      </ul>
      <br/>
      <hr/>
      <h4 class="title is-4"><a id="access"/>Accessing Your Data</h4>
      <p>
        One huge benefit of GraphQL is that it is widely supported. 
        That means the data from your Supersheet will be easily accessible from a variety of languages and frameworks. 
      </p>
      <br/>
      <br/>
      <h5 class="title is-5">Manual Access</h5>
      <p>
        You can manually query your data using your Supersheet's custom instance of <strong><a :href="playgroundurl" target="_blank">GraphQL Playground</a></strong>. 
      </p>
      <br/>
      <p>
        <a :class="{'button':true, 'is-info': true }" target="_blank" :href="playgroundurl">
          <span>GraphQL Playground</span>
          <span class="icon">
            <i class="fas fa-play"></i>
          </span>
        </a>
        <br/>
        <br/>
        <span class="help is-italic">
         You can also access your data using <a href="https://www.graphqlbin.com/v2/new" target="_blank">GraphQLbin</a> or download the <a href="https://electronjs.org/apps/graphql-playground" target="_blank">desktop version</a> of GraphQL Playground. 
         Use the Graph URL of your Supersheet to enable access from these 3rd party GraphQL tools.
        </span>
      </p>
      <br/>
      <br/>
      <h5 class="title is-5">Javascript Frontend Integrations</h5>
      <p>
        We recommend using 
        <a href="https://www.apollographql.com/docs/react/" target="_blank">Apollo Client</a> 
        which features <a href="https://www.apollographql.com/docs/react/integrations" target="_blank">integrations</a> with React, React Native, Angular, Vue, Meteor, and Ember. 
        Apollo's <a href="https://www.apollographql.com/docs/react/essentials/get-started/" target="_blank">Getting Started Guide</a> 
        will take you step-by-step in using Apollo Client with a React app.
      </p>
      <br/>
      <br/>
      <h5 class="title is-5">Backend Servers Libraries</h5>
      <p>
        There <a href="https://graphql.org/code/">server libraries</a> supporting a wide variety of languages such as Java, Go, Ruby, Python and C# / .NET.
      </p>
      <br/>
      <br/>
      <hr/>
      <h4 class="title is-4"><a id="query"/>Querying Your Data</h4>
      <p>
        GraphQL makes it very intuitive to query data regardless of your level of programming experience – including no programming experience!
      </p>
      <br/>
      <br/>
      <h5 class="title is-5">Breaking Down a Query</h5>
      <p>
        Let’s deconstruct a simple query to better understand its components. 
      </p>
      <br/>
      <p>
        <prism language="graphql" class="content">{{ code.simple.trim() }}</prism>
        <div class="run-playground">
          <a :href="getPlaygroundUrl({ name: 'find', query: code.simple.trim() })" class="button is-small is-danger" target="_blank">
            <span>Run in GraphQL Playground</span>
            <span class="icon">
              <i class="fas fa-play"></i>
            </span>
          </a>
        </div>
      </p>
      <br/>
      <p>
        <strong>query { … }</strong>
        <br/>
        This communicates to GraphQL that we want to execute a query – we want to find data that meets a particular criteria. 
        Within the <code>{ }</code> will be the content of our query.
      </p>
      <br/>
      <p>
        <strong>find (...) { … }</strong>
        <br/>
        <code>find</code> is the name of the query we want to execute. 
        Inside the <code>( )</code> is where we'll describe the specific criteria of the data we are looking for. 
        Inside the <code>{ }</code> is where we'll list the specific data fields we want to have returned for the records
        which meet our criteria.
      </p>
      <br/>
      <p>
        <strong>filter: { _row: { lt: 5 } }</strong> 
        <br/>
        The <code>find</code> query accepts an argument named <code>filter</code>. 
        <code>filter</code> will return data that meets the criteria specified inside the <code>{ }</code>.
        In this case, we are telling <code>filter</code> that we only want 
        records where the field <code>_row</code> is less than 5 (<code>lt: 5</code>).
      </p>
      <br/>
      <p>
        <strong>{ _id, _row, _sheet }</strong>
        <br/>
        Finally, we tell GraphQL what specific fields we want to be returned from records that match. 
        In this case, we want to return the <code>_id</code>, <code>_row</code>, <code>_sheet</code> fields 
        which are reserved fields autopopulated by Supersheets.
      </p>
      <br/>
      <br/>
      <h5 class="title is-5">Types of Queries</h5>
      <p>
        Currently, Supersheets supports two types of queries: <code>find</code> and <code>findOne</code>.
      </p>
      <br/>
      <h6 class="title is-6">find</h6>
      <p>
        <code>find</code> will return all records (up to 1000) that match the filter criteria. 
        In addition to <code>filter</code>, 
        it supports the arguments <code>limit</code>, <code>skip</code>, and <code>sort</code>. 
      </p>
      <br/>
      <p>
        <prism language="graphql" class="content">{{ code.find.trim() }}</prism>
        <div class="run-playground">
          <a :href="getPlaygroundUrl({ name: 'find', query: code.find.trim() })" class="button is-small is-danger" target="_blank">
            <span>Run in GraphQL Playground</span>
            <span class="icon">
              <i class="fas fa-play"></i>
            </span>
          </a>
        </div>
      </p>
      <br/>
      <h6 class="title is-6">findOne</h6>
      <p>
        <code>findOne</code> takes the same arguments as <code>find</code> 
        except that it will always return the first matching record. 
        <code>limit</code> is ignored since it is always implied to be <code>1</code>.
      </p>
      <br/>
      <p>
        <prism language="graphql" class="content">{{ code.findOne.trim() }}</prism>
        <div class="run-playground">
          <a :href="getPlaygroundUrl({ name: 'find', query: code.findOne.trim() })" class="button is-small is-danger" target="_blank">
            <span>Run in GraphQL Playground</span>
            <span class="icon">
              <i class="fas fa-play"></i>
            </span>
          </a>
        </div>
      </p>
      <br/>
      <!-- SCRATCH -->
      <article class="message is-warning" v-show="false">
        <div class="message-header">
          <p>GraphQL Endpoint URL</p>
        </div>
        <div class="message-body">
          <strong>{{ graphqlendpoint }}</strong>
          <br/>
          <br/>
          <p class="help">
            <em>Note that the structure of this URL is {{ supersheetsbaseurl }}/<strong>[Google Sheet Document Id]</strong>/graphql</em>
          </p>
        </div>
      </article>
      <hr/>
      <h4 class="title is-4">Learning More</h4>
      <p>
        Check out the <a href="https://docs.google.com/document/d/1wyuvWnr9WnIKP8Wh_d0ycLRQ-jYgeYr-O98hfHAMJZA/edit?usp=sharing" target="_blank">full documentation &rarr;</a> to learn how to get the most out of your Supersheet.
      </p>
    </div>
    <div class="column is-4"></div>
  </div>
</div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import Prism from 'vue-prismjs'

export default {
  name: 'sheet-start',
  components: {
    Prism
  },
  data: () => {
    return {
      code: {
        simple: simpleCode,
        find: findCode,
        findOne: findOneCode
      }
    }
  },
  computed: {
    ...mapState([
      'user',
      'sheet'
    ]),
     ...mapGetters([
      'supersheetsbaseurl',
      'graphqlendpoint'
    ]),
    playgroundurl: function() {
      return `${this.graphqlendpoint}/playground`
    }
  },
  methods: {
    ...mapMutations([
    ]),
    ...mapActions([
    ]),
    getPlaygroundUrl({ name, query }) {
      let endpoint = this.graphqlendpoint
      let tabs = [ { endpoint, query, name } ]
      return `${this.playgroundurl}?tabs=${stringifyAndEncode(tabs)}`
    }
  },
  async created() {
  }
}

function stringifyAndEncode(obj) {
  let data = JSON.stringify(obj)
  return (new Buffer(data)).toString('base64')
}

/**
 * GRAPHQL CODE SAMPLES
 */

const simpleCode = `
# Return the fields _id, _row, and _sheet
# for all records where row number is less than 5
query {
  find (filter: { _row: { lt: 5 } }) {
    _id
    _row
    _sheet
  }
}
`

const findCode = `
# Return the fields _id, _row, and _sheet
# where row number is less than 10
# and sort them by row number in descending order (highest to lowest)
# skip the first record (skip: 1)
# and return the next two (limit: 2)
query {
  find (
    filter: { _row: { lt: 10 } }
    sort: { fields: [ _row ], order: [ DESC ] }
    skip: 1
    limit: 2
  ) {
    _id, 
    _row, 
    _sheet
  }
}
`

const findOneCode = `
# Return the first record's _id, _row, and _sheet
# where row number is less than 10
# and sorted by row number in descending order (highest to lowest)
# skip the first record (skip: 1)
query {
  findOne (
    filter: { _row: { lt: 10 } }
    sort: { fields: [ _row ], order: [ DESC ] }
    skip: 1
  ) {
    _id, 
    _row, 
    _sheet
  }
}
`
</script>

<style scoped>
.run-playground {
  padding: .5rem 0 1rem .5rem;
  background: #f5f2f0;
}

ul.toc li {
  list-style-type: disc;
  margin-left: 2rem;
}

/* iframe {
  max-width: 100% !important;
  width: auto !important;
  height: auto !important;
} */
</style>