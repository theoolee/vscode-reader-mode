const fs = require('fs')
const { glob } = require('glob')
const path = require('path')

const packageJsonPath = path.resolve(__dirname, '../', 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath))

const files = glob.sync('*/package.json', {
  cwd: __dirname,
})

const convertLanguageId = (id) => {
  return `__${id}__`
}

packageJson.contributes.languages = []
packageJson.contributes.grammars = []
packageJson.contributes.semanticTokenScopes = []

files.forEach((file) => {
  const contributes = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, file), 'utf8')
  ).contributes

  const convertPath = (_path) => {
    return `./${path.join('res', file, '../', _path)}`
  }

  packageJson.contributes.languages.push(
    ...(contributes.languages?.map((language) => ({
      id: language.id && convertLanguageId(language.id),
      configuration:
        language.configuration && convertPath(language.configuration),
      aliases: language.aliases,
      mimetypes: language.mimetypes,
    })) ?? [])
  )

  packageJson.contributes.grammars.push(
    ...(contributes.grammars?.map((grammar) => ({
      ...grammar,
      language: grammar.language && convertLanguageId(grammar.language),
      path: grammar.path && convertPath(grammar.path),
    })) ?? [])
  )

  packageJson.contributes.semanticTokenScopes.push(
    ...(contributes.semanticTokenScopes?.map((semanticTokenScope) => ({
      ...semanticTokenScope,
      language:
        semanticTokenScope.language &&
        convertLanguageId(semanticTokenScope.language),
    })) ?? [])
  )
})

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

module.exports.convertLanguageId = convertLanguageId
