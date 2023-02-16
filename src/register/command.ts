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
            case 'file':
              await showReaderModeDocument(document)
              break
            case config['schemeName']:
              await showFileDocument(document, true)
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
