import vscode from 'vscode'
import { showOriginalDocument, showReaderModeDocument } from '../action'
import { isUriMatchAutoReaderMode } from '../util/uri'
import { config } from '../config'
import { BaseRegister } from './base'
import { isTabHasUri } from '../util/misc'

// Bypass is designed to bypass files that match the rules when manually toggling.
export class AutoReaderModeRegister extends BaseRegister {
  private static bypassedUriSet = new Set<string>()

  static addBypassUri(uri: vscode.Uri) {
    AutoReaderModeRegister.bypassedUriSet.add(uri.toString())
  }

  static removeBypassUri(uri: vscode.Uri) {
    AutoReaderModeRegister.bypassedUriSet.delete(uri.toString())
  }

  static clearBypassUri() {
    AutoReaderModeRegister.bypassedUriSet.clear()
  }

  protected doRegister() {
    this.context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        if (!editor) {
          return
        }

        const document = editor.document

        // Only switch to reader mode for `file` scheme.
        if (document.uri.scheme !== 'file') {
          return
        }

        if (
          !AutoReaderModeRegister.bypassedUriSet.has(document.uri.toString()) &&
          isUriMatchAutoReaderMode(document.uri)
        ) {
          showReaderModeDocument(document)
        }
      }),
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('reader-mode.auto.glob')) {
          vscode.window.tabGroups.all.forEach(async (tabGroup) => {
            for (const tab of tabGroup.tabs) {
              if (isTabHasUri(tab)) {
                const uri = tab.input.uri

                if (
                  uri.scheme === config['schemeName'] &&
                  !isUriMatchAutoReaderMode(uri)
                ) {
                  await showOriginalDocument(
                    await vscode.workspace.openTextDocument(uri)
                  )
                } else if (
                  !AutoReaderModeRegister.bypassedUriSet.has(uri.toString()) &&
                  isUriMatchAutoReaderMode(uri)
                ) {
                  await showReaderModeDocument(
                    await vscode.workspace.openTextDocument(uri)
                  )
                }
              }
            }
          })
        }
      })
    )
  }
}
