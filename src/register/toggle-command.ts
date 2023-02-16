import vscode from 'vscode'
import { AutoReaderModeRegister } from './auto-reader-mode'
import { showOriginalDocument, showReaderModeDocument } from '../action'
import { config } from '../config'
import { BaseRegister } from './base'
import { toOriginalUri } from '../util/uri'

export class ToggleCommandRegister extends BaseRegister {
  protected doRegister() {
    this.context.subscriptions.push(
      vscode.commands.registerCommand(
        config['toggleReaderModeCommandId'],
        async () => {
          const document = vscode.window.activeTextEditor?.document

          if (!document) {
            return
          }

          switch (document.uri.scheme) {
            case config['schemeName']:
              AutoReaderModeRegister.addBypassUri(toOriginalUri(document.uri))
              await showOriginalDocument(document)
              break
            default:
              AutoReaderModeRegister.removeBypassUri(document.uri)
              await showReaderModeDocument(document)
              break
          }
        }
      )
    )
  }
}
