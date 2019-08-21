<template>
<div class="sheet-start">
  <div class="columns">
    <div class="column is-2">
      <aside class="menu">
        <p class="menu-label">
          General
        </p>
        <ul class="menu-list">
          <li><a>Dashboard</a></li>
          <li><a>Customers</a></li>
        </ul>
        <p class="menu-label">
          Administration
        </p>
        <ul class="menu-list">
          <li><a>Team Settings</a></li>
          <li>
            <a class="is-active">Manage Your Team</a>
            <ul>
              <li><a>Members</a></li>
              <li><a>Plugins</a></li>
              <li><a>Add a member</a></li>
            </ul>
          </li>
          <li><a>Invitations</a></li>
          <li><a>Cloud Storage Environment Settings</a></li>
          <li><a>Authentication</a></li>
        </ul>
        <p class="menu-label">
          Transactions
        </p>
        <ul class="menu-list">
          <li><a>Payments</a></li>
          <li><a>Transfers</a></li>
          <li><a>Balance</a></li>
        </ul>
      </aside>
    </div>
    <div class="column is-1"></div>
    <div class="column">
      <h3 class="title is-3">Getting Started</h3>
      <p>
        Congratulations! You can now access the data in your Google Sheet,
        <a :href="sheet.url" target="_blank"><em>{{ sheet.title }}</em></a>, using GraphQL. The data was last loaded from your sheet on ${last loaded date} (${}).
      </p>
      <br/>
      <article class="message is-warning">
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
      <br/>
      <hr/>
      <h4 class="title is-4">Accessing Data</h4>
      <p>
        One great benefit of having your data available in GraphQL is that now it can be easily accessed across a variety of platforms using a consistent query language and structure without any additional work. 
      </p>
      <br/>
      <br/>
      <h5 class="title is-5">Manual Access</h5>
      <p>
        You can start manually querying your data using your Supersheet's custom <strong><a :href="playgroundurl" target="_blank">GraphQL Playground</a></strong>. 
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
        </span>
      </p>
      <br/>
      <br/>
      <h5 class="title is-5">Javascript Frontends</h5>
      <p>
        We recommend using 
        <a href="https://www.apollographql.com/docs/react/" target="_blank">Apollo Client</a> 
        which features <a href="https://www.apollographql.com/docs/react/integrations" target="_blank">integrations</a> with React, React Native, Angular, Vue, Meteor, and Ember. 
        Apollo's <a href="https://www.apollographql.com/docs/react/essentials/get-started/" target="_blank">Getting Started Guide</a> 
        will take you step-by-step in using Apollo Client with a React app.
      </p>
      <br/>
      <br/>
      <h5 class="title is-5">Backend Servers</h5>
      <p>
        There <a href="https://graphql.org/code/">server libraries</a> supporting a wide variety of languages such as Java, Go, Ruby, Python and C# / .NET.
      </p>
      <br/>
      <br/>
      <hr/>
      <h4 class="title is-4">Querying Data</h4>
      <p>
        GraphQL makes it very intuitive to query data regardless of your level of programming experience – including no programming experience!
      </p>
      <br/>
      <br/>
      <h5 class="title is-5">Breaking Down a Query</h5>
      <p>
        Let’s first look at a simple query and deconstruct it to see how it works. 
      </p>
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
       <strong>query { … }:</strong> this tells GraphQL that we want to query or fetch data. What we put inside the braces will be the content of our query.
      </p>
      <br/>
      <p>
       <strong>find (...) { … }:</strong> this is the name of the query we want to execute. Inside the paretheses (...) we will define the criteria of the data we are looking for. Find will return all of the data that matches the criteria. Inside the { … } is which specific fields of the matching data GraphQL should return back.
      </p>
      <br/>
      <p>
       <strong>filter: { … }:</strong> this definitely the most complicated part of the query. Filter means that GraphQL should only return data that meets these criteria within the { … }
      </p>
      <br/>
      <p>
        <strong>${first filed name}: { eq: ${first field sample value} }:</strong> this definitely the most complicated part of the query. Filter means that GraphQL should only return data that meets these criteria within the { … }
      </p>
      <br/>
      <p>
        <strong>${first filed name}: { eq: ${first field sample value} }:</strong>
      </p>

: 



We are setting up a criteria for the ${first field name} field. Here we are using the eq operator meaning that we are looking for all records whose ${} exactly equals the value of  ${first field sample value}. See the general documentation for all the different filter operations supported.

{
  ${first field}
  ${second field}
}

Within the { } of our find query are selectors. In this case we are asking GraphQL to only return the ${} and ${} fields in the matching data.  You’ll notice that we can ask for different selectors than filter criteria. 

      </p>
      <br/>
      <br/>
      <hr/>
      <h4 class="title is-4">Learning More</h4>
    </div>
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
        simple: simpleCode
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
# this is a comment
query {
  find (filter: { _row: { lt: 10, gt: "A" } }) {
    _id
    _row
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

/* iframe {
  max-width: 100% !important;
  width: auto !important;
  height: auto !important;
} */
</style>