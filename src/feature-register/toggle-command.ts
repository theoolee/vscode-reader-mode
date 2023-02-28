import vscode from 'vscode'
import { AutoReaderModeRegister } from './auto-reader-mode'
import { showOriginalDocument, showReaderModeDocument } from '../action'
import { config } from '../config'
import { BaseRegister } from './base'
import { toOriginalUri } from '../util/uri'
import path from 'path'

export class ToggleCommandRegister extends BaseRegister {
  protected doRegister() {
    this.context.subscriptions.push(
      vscode.commands.registerCommand(
        config['toggleFileReaderModeCommandId'],
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
    ),
      this.context.subscriptions.push(
        vscode.commands.registerCommand(
          config['toggleWorkspaceReaderModeCommandId'],
          async () => {
            vscode.workspace.workspaceFolders?.forEach((folder) => {
              const glob = path.resolve(folder.uri.path, '**')
              const configuration = vscode.workspace.getConfiguration(
                undefined,
                folder.uri
              )
              const before: string[] =
                configuration.get('reader-mode.auto.glob') ?? []
              const isOn = before.findIndex((_glob) => _glob === glob) !== -1

              configuration.update(
                'reader-mode.auto.glob',
                isOn
                  ? before.filter((_glob) => _glob !== glob)
                  : [...before, glob]
              )
            })
          }
        )
      )
  }
}
