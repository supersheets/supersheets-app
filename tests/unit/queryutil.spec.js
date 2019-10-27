const fs = require('fs')
const path = require('path')

import { 
  buildQueriesForSchema,
  buildQueryFields
} from '@/lib/queryutil.js'

describe('buildQueryFields', async () => {
  it('should buildQueryFields with no GoogelDoc types', async () => {
    let rows = [ {
      name: "excluded",
      datatype: "String",
      reserved: true
    }, { 
      name: "id",
      datatype: "String"
    }, {
      name: "title",
      datatype: "String"
    } ]
    let query = buildQueryFields(rows, 2)
    expect(query).toEqual(`  id\n  title\n`)
  })
  it ('should buildQueryFields with GoogleDoc types', async () => {
    let rows = [ { 
      name: "content",
      datatype: "GoogleDoc"
    }, {
      name: "description",
      datatype: "String",
      embedded: true
    }, {
      name: "body",
      datatype: "String",
      embedded: true
    } ]
    let query = buildQueryFields(rows, 2)
    expect(query).toEqual(`  content {\n    description\n    body\n  }\n`)
    rows.push({
      name: "published_at",
      datatype: "Datetime",
    })
    query = buildQueryFields(rows, 2)
    console.log(query)
    expect(query).toEqual(`  content {\n    description\n    body\n  }\n  published_at\n`)
  })
})

describe('buildQueriesForSchema', async () => {
  it ('should convert an entire spreadsheet into its sheet schemas', async () => {
    let schema = {
      rows: [ {
        name: 'id'
      }, {
        name: 'published_at'
      } ],
      names: {
        'find': 'findPosts',
        'findOne': 'findOnePost'
      }
    }
    let queries = buildQueriesForSchema(schema)
    expect(queries).toMatchObject([ {
      name: 'findOnePost',
      query: expect.anything()
    }, {
      name: 'findPosts',
      query: expect.anything()
    } ])
    console.log(JSON.stringify(queries, null, 2))
  })
})
