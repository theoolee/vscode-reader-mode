import vscode from 'vscode'
import { CommandRegister } from './register/command'
import { EventHandlerRegister } from './register/event-handler'
import { FileSystemRegister } from './register/file-system'
import {
  GeneralLanguageFeatureRegister,
  SpecificLanguageFeatureRegister,
} from './register/language-feature'

export function activate(context: vscode.ExtensionContext) {
  const fileSystemRegister = new FileSystemRegister(context)
  const generalLanguageFeatureRegister = new GeneralLanguageFeatureRegister(
    context
  )
  const specificLanguageFeatureRegister = new SpecificLanguageFeatureRegister(
    context
  )
  const commandRegister = new CommandRegister(context)
  const eventHandlerRegister = new EventHandlerRegister(context)

  fileSystemRegister.register()
  generalLanguageFeatureRegister.register()
  fileSystemRegister.onBeforeOpenFile((uri) => {
    specificLanguageFeatureRegister.register(uri)
  })
  eventHandlerRegister.register()
  commandRegister.register()
}
