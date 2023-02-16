import vscode from 'vscode'
import { showFileDocument, showReaderModeDocument } from '../action'
import { config } from '../config'
import { BaseRegister } from './base'

export class CommandRegister extends BaseRegister {
  private registerToggleReaderModeCommand() {
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
              await showFileDocument(document, true)
              break
            default:
              await showReaderModeDocument(document)
              break
          }
        }
      )
    )
  }

  protected doRegister() {
    this.registerToggleReaderModeCommand()
  }
}
