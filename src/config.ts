import vscode from 'vscode'
import packageJson from '../package.json'
import { convertLanguageId } from '../res/gen'

type ConfigDefinitionToConfig<
  T extends Record<string, any>,
  S extends string = '',
  C extends Record<string, any> = T['properties']
> = {
  [K in keyof C as K extends `${S}${infer P}`
    ? P
    : never]: C[K]['properties'] extends Record<string, any>
    ? ConfigDefinitionToConfig<C[K]>
    : C[K]['default']
}

type Config = ConfigDefinitionToConfig<
  typeof packageJson.contributes.configuration,
  'reader-mode.'
> & {
  schemeName: string
  toggleReaderModeCommandId: string
  hijackLanguageId: (languageId: string) => string | undefined
}

const hijackedLanguageIds = packageJson.contributes.languages.map(
  (language) => language.id
)

export const config = new Proxy<Config>({} as any, {
  get(target, key: keyof Config) {
    switch (key) {
      case 'schemeName':
        return packageJson.name
      case 'toggleReaderModeCommandId':
        return packageJson.contributes.commands[0].command
      case 'hijackLanguageId':
        return (languageId: string) =>
          hijackedLanguageIds.find(
            (hijackedLanguageId) =>
              hijackedLanguageId === convertLanguageId(languageId)
          )
      default:
        return vscode.workspace.getConfiguration(packageJson.name).get(key)
    }
  },
})
