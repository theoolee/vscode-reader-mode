import vscode from 'vscode'
import packageJson from '../../package.json'
import { Observable } from 'rxjs'

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

export type Config = ConfigDefinitionToConfig<
  typeof packageJson.contributes.configuration,
  'reader-mode.'
>

const getValue = <T extends keyof Config>(key: T): Config[T] =>
  vscode.workspace.getConfiguration(packageJson.name).get(key) as Config[T]

export function observeConfig<T extends keyof Config>(key: T) {
  return new Observable<Config[T]>((subscriber) => {
    subscriber.next(getValue(key))

    const disposable = vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(packageJson.name)) {
        subscriber.next(getValue(key))
      }
    })

    return () => {
      disposable.dispose()
    }
  })
}
