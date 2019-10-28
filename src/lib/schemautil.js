const pluralize = require('pluralize')

const SUPERSHEETS_TYPES = [
  'Boolean',
  'Int', 'Float',
  'Date', 'Datetime',
  'String', 'StringList',
  'GoogleDoc', 'PlainText', 'Markdown', 'GoogleJSON'
]

const capitalize = (s) => {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// TODO: Handle backward compat with old sheets that don't have schemas
// initOldColumns() {
//   let names = { }
//   let columns = [ ]
//   for (let sheet of this.sheet.sheets) {
//     for (let name of sheet.columns) {
//       if (!names[name]) {
//         columns.push({
//           name: name,
//           datatype: "String",
//           configdatatype: "String"
//         })
//         names[name] = true
//       }
//     }
//   }
//   console.log('initOldColumns', columns)
//   return columns
// }

export function makeSchemaRowsEditable(rows, datatypes) {
  let copy = JSON.parse(JSON.stringify(rows))
  datatypes = datatypes || { }
  copy.forEach(row => {
    row.configdatatype = datatypes[row.fullname.replace('___', '.')] || row.datatype || "String" 
  })
  return copy
}

export function convertSpreadsheetToSchemaTables(spreadsheet) {
  let sheetschemas = [ {
    title: "Rows",
    schema: spreadsheet.schema,
    names: { find: 'find', findOne: 'findOne' }
  } ]
  sheetschemas = sheetschemas.concat(spreadsheet.sheets.map(s => { 
    return {
      title: s.title,
      schema: s.schema
    }
  }))
  sheetschemas.forEach(sheet => {
    sheet.names = Object.assign(generateGraphQLNames(sheet), sheet.names || { })
  })
  return sheetschemas.map(sheet => {
    return {
      title: sheet.title,
      names: sheet.names,
      rows: convertSheetToSchemaRows(sheet)
    } 
  })
}

export function convertSheetToSchemaRows({ title, schema, names }) {
  let rows = [ ]
  schema.columns.forEach(col => {
    rows.push({
      name: col.name,
      fullname: col.name,
      datatype: col.datatype,
      graphql: convertToGraphQLType(col, { names }),
      embedded: false,
      reserved: col.reserved || false,
      sample: col.sample
    })
    if (col.datatype == "GoogleDoc") {
      let doc = schema.docs && schema.docs[col.name]
      if (doc) {
        rows = rows.concat(convertEmbeddedDocToSchemaRows(doc, { names }))
      }
    }
  })
  rows.forEach(row => {
    row.sample = formatSampleValue(row)
  })
  return rows
}

export function convertEmbeddedDocToSchemaRows({ name, fields }, { names }) {
  let rows = fields.map(field => {
    return {
      name: field.name,
      fullname: `${name}___${field.name}`,
      datatype: field.datatype,
      graphql: convertToGraphQLType(field, { names }),
      embedded: true,
      reserved: field.reserved || false,
      sample: field.sample
    }
  })
  return rows
}

function formatSampleValue({ datatype, graphql, sample }) {
  if (graphql == "String") {
    return excerptString(sample, 32)
  }
  if (datatype == "GoogleDoc") {
    if (sample && typeof sample == "object") {
      return excerptString(JSON.stringify(sample), 32)
    } 
  }
  return sample
}

export function convertToGraphQLType({ name, datatype }, options) {
  options = options || { }
  let names = options.names || { docs: { } }
  if (name == "_id") return "ID!"
  switch(datatype) {
    case "Int":
      return "Int"
    case "Float":
      return "Float"
    case "Boolean":
      return "Boolean"
    case "String":
    case "Markdown":
    case "PlainText":
    case "JSON":
    case "GoogleJSON":
    case "Date":
    case "Datetime":
      return "String"
    case "StringList":
      return "[String!]"
    case "GoogleDoc":
      return names.docs[name].type || "Unknown"
    default: 
      return "Unknown"
  }
}

export function excerptString(s, maxlength, options) {
  if (!s) return null
  options = options || { }
  maxlength = maxlength || 47 // Why 47?
  let suffix = options.suffix || '...'
  let n = maxlength - suffix.length
  if (s.length > maxlength) {
    return `${s.substring(0, n)}${suffix}`
  }
  return s
}

// straight copy from graphql-db function
export function generateGraphQLNames(sheet, options) {
  options = options || { }
  let name = sheet.title
  let typeSingular = capitalize(pluralize.singular(name))
  let typePlural = capitalize(pluralize.plural(name))
  
  let type = typeSingular
  let input = `${typeSingular}FilterInput`
  let sort = `${typeSingular}SortInput`
  let enumfields = `${typeSingular}FieldsEnum`
  let connection = `${typeSingular}Connection`
  let edge = `${typeSingular}Edge`
  let find = `find${typePlural}`
  let findOne = `findOne${typeSingular}`

  let docs = { }
  for (let name in sheet.schema.docs) {
    let type = `${typeSingular}${capitalize(pluralize.singular(name))}Doc`
    let input = `${type}FilterInput`
    let sort = `${type}SortInput`
    docs[name] = { name, type, input, sort }
  }
  return {
    name,
    type,
    connection,
    enumfields,
    edge,
    input,
    sort,
    find,
    findOne,
    docs
  }
}