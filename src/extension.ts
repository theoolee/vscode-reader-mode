import vscode from 'vscode'
import { AutoReaderModeRegister } from './register/auto-reader-mode'
import { ToggleCommandRegister } from './register/toggle-command'
import { CommentHighlightRegister } from './register/comment-highlight'
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
  const autoReaderModeRegister = new AutoReaderModeRegister(context)
  const commentHighlightRegister = new CommentHighlightRegister(context)
  const toggleCommandRegister = new ToggleCommandRegister(context)

  fileSystemRegister.register()
  generalLanguageFeatureRegister.register()
  fileSystemRegister.onBeforeOpenFile((uri) => {
    specificLanguageFeatureRegister.register(uri)
  })
  autoReaderModeRegister.register()
  commentHighlightRegister.register()
  toggleCommandRegister.register()
}
