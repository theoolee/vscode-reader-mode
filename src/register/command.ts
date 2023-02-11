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
          const activeTextEditor = vscode.window.activeTextEditor

          if (!activeTextEditor) {
            return
          }

          const document = activeTextEditor?.document

          switch (document.uri.scheme) {
            case 'file':
              showReaderModeDocument(document, {
                selection: activeTextEditor.selection,
              })
              break
            case config['schemeName']:
              showFileDocument(document, {
                selection: activeTextEditor.selection,
                bypassAutoReaderMode: true,
              })
          }
        }
      )
    )
  }

  protected doRegister() {
    this.registerToggleReaderModeCommand()
  }
}
