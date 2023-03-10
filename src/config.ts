import vscode from 'vscode'
import packageJson from '../package.json'

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
  toggleFileReaderModeCommandId: string
  toggleWorkspaceReaderModeCommandId: string
  hijackedLanguageIds: string[]
}

export const config = new Proxy<Config>({} as any, {
  get(target, key: keyof Config) {
    switch (key) {
      case 'schemeName':
        return packageJson.name
      case 'toggleFileReaderModeCommandId':
        return packageJson.contributes.commands[0].command
      case 'toggleWorkspaceReaderModeCommandId':
        return packageJson.contributes.commands[1].command
      case 'hijackedLanguageIds':
        return packageJson.contributes.languages.map((language) => language.id)
      default:
        return vscode.workspace.getConfiguration(packageJson.name).get(key)
    }
  },
})
