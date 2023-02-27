import vscode from 'vscode'
import { AutoReaderModeRegister } from './feature-register/auto-reader-mode'
import { ToggleCommandRegister } from './feature-register/toggle-command'
import { CommentHighlightRegister } from './feature-register/comment-highlight'
import { FileSystemRegister } from './feature-register/file-system'
import {
  GeneralLanguageFeatureRegister,
  SpecificLanguageFeatureRegister,
} from './feature-register/language-feature'

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
