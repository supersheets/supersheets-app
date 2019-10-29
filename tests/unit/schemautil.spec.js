const fs = require('fs')
const path = require('path')

import { 
  makeSchemaRowsEditable,
  convertSpreadsheetToSchemaTables,
  convertSheetToSchemaRows,
  excerptString,
  generateGraphQLNames,
  convertEmbeddedDocToSchemaRows,
  convertToGraphQLType
} from '@/lib/schemautil.js'

describe('makeSchemaRowsEditable', async () => {
  it ('should convert embedded google doc types correctly', async () => {
    let rows = [ { name: "published_at", fullname: "content___published_at", datatype: "String", embedded: true  } ]
    let datatypes = { "content.published_at": "Datetime" }
    let editable = makeSchemaRowsEditable(rows, datatypes)
    expect(editable).toEqual([ { 
      configdatatype: "Datetime" , name: "published_at", fullname: "content___published_at", datatype: "String", embedded: true 
    } ])
  })
})

describe('convertSpreadsheetToSchemaTables', async () => {
  it ('should convert an entire spreadsheet into its sheet schemas', async () => {
    let spreadsheet = getTestSpreadsheet()
    let schemas = convertSpreadsheetToSchemaTables(spreadsheet)
    expect(schemas.length).toEqual(4)
    expect(schemas.map(s => s.title)).toEqual([
      'Rows',
      'Site',
      'Posts',
      'Authors'
    ])
    expect(schemas[0]).toMatchObject({
      title: "Rows",
      names: expect.anything(),
      rows: expect.anything()
    })
  })
})

describe('convertSheetSchemaToRows', () => {
  it ('should convert a GoogleDoc column and its embedded fields', async () => {
    let { title, schema } = getTestSheet()
    let names = generateGraphQLNames({ title, schema })
    let rows = convertSheetToSchemaRows({ title, schema, names })
    expect(rows.length).toEqual(16)
    expect(rows.find(row => row.name == 'content')).toEqual({
      name: 'content',
      fullname: 'content',
      datatype: 'GoogleDoc',
      graphql: 'PostsContentDoc',
      embedded: false,
      reserved: false,
      sample: "{\"_docid\":\"1XAuHv67nEg8G5EoMq..."  
    })
    expect(rows.find(row => row.fullname == 'content___body')).toEqual({
      name: 'body',
      fullname: 'content___body',
      datatype: 'Markdown',
      graphql: 'String',
      embedded: true,
      reserved: false,
      sample: "This is my first post on my n..."
    })
  })
})

describe('convertEmbeddedDocToSchemaRows', () => {
  it ('should generate schema rows for a doc schema', async () => {
    let doc = {
      name: "content",
      fields: [ {
        name: "_docid",
        datatype: "String",
        reserved: true,
        sample: "my-google-doc-id",
      }, {
        name: "body",
        datatype: "Markdown",
        reserved: false,
        sample: "# Title",
      }]
    }
    let rows = convertEmbeddedDocToSchemaRows(doc, { })
    expect(rows).toEqual([
      {
        "name": "_docid",
        "fullname": "content____docid",
        "datatype": "String",
        "graphql": "String",
        "embedded": true,
        "reserved": true,
        "sample": "my-google-doc-id"
      },
      {
        "name": "body",
        "fullname": "content___body",
        "datatype": "Markdown",
        "graphql": "String",
        "embedded": true,
        "reserved": false,
        "sample": "# Title"
      }
    ])
  })
})

describe('excerptString', () => {
  it('should noop if string is equal or shorter than maxlength', async () => {
    let s = "hello"
    let maxlength = 5
    expect(excerptString(s, maxlength)).toEqual(s)
  })
  it ('should return null if sample if falsy', async () => {
    let s = ''
    let maxlength = 5
    expect(excerptString(s, maxlength)).toEqual(null)
  })
  it ('should exerpt a string over maxlength', async () => {
    let s = 'hello!'
    let maxlength = 5
    expect(excerptString(s, maxlength)).toEqual('he...')
  })
})

describe('generateGraphQLNames', () => {
  let sheet = getTestSheet()
  let s = generateGraphQLNames(sheet)
  expect(s).toEqual({ 
    name: 'Posts',
    type: 'Posts',
    docs: { 
      "content": { 
        name: 'content',
        type: 'PostsContentDoc',
        input: 'PostsContentDocFilterInput',
        sort: 'PostsContentDocSortInput'
      } 
    },
    connection: 'PostsConnection',
    enumfields: 'PostsFieldsEnum',
    edge: 'PostsEdge',
    input: 'PostsFilterInput',
    find: 'findPosts',
    findOne: 'findOnePosts',
    sort: 'PostsSortInput'
  })
})

describe('convertGraphQLType', () => {
  it ('should convert a GoogleDoc type to GraphQL type name', async () => {
    let col = { name: "content", datatype: "GoogleDoc" }
    let names = { docs: { "content": { type: "PostContentDoc" } } }
    let graphqltype = convertToGraphQLType(col, { names })
    expect(graphqltype).toEqual("PostContentDoc")
  })
})

function getTestSheet() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'sheet.json')).toString('utf8'))
}

function getTestSpreadsheet() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'spreadsheet.json')).toString('utf8'))
}
