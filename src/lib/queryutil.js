export function buildQueriesForSchema({ rows, names }) {
  let findOneName = names['findOne']
  let findOneQuery = buildFindOneQuery(findOneName, rows)
  let findName = names['find']
  let findQuery = buildFindQuery(findName, rows)
  return [ {
      name: findOneName,
      query: findOneQuery
    }, {
      name: findName,
      query: findQuery
    }
  ]
}

function buildFindQuery(name, rows) {
  return `# Find the first three rows of data in the sheet sorted by row number
query {
  ${name} (
    filter: { _row: { gte: 2 } }
    limit: 3
    sort: { fields: [ _row ], order: [ ASC ] }
  ) {
    rows {
      row {
${buildQueryFields(rows, 8)}      }
    }
  }
}`
}

function buildFindOneQuery(name, rows) {
  return `# Find the first row of data in the sheet 
query {
  ${name} (filter: { _row: { eq: 2 } }) {
${buildQueryFields(rows, 4)}  }
}`
}

export function buildQueryFields(rows, spaces) {
  let s = ''
  let embedded = false
  spaces = spaces || 4
  rows.filter(row => !row.reserved).forEach(row => {
    if (embedded && !row.embedded) { 
      // this row needs to "close" the previous embedded doc
      s += `${" ".repeat(spaces)}}\n`
      embedded = false
    }
    if (row.datatype == 'GoogleDoc') {
      s += `${" ".repeat(spaces)}${row.name} {\n`
      embedded = true
    } else if (row.embedded) {
      s += `${" ".repeat(spaces+2)}${row.name}\n`
    } else {
      s += `${" ".repeat(spaces)}${row.name}\n`
    }
  })
  if (embedded) {
    s += `${" ".repeat(spaces)}}\n`
  }
  return s
}

