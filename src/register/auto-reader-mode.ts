import vscode from 'vscode'
import { showReaderModeDocument } from '../action'
import { isUriMatchAutoReaderMode } from '../util/uri'
import { config } from '../config'
import { BaseRegister } from './base'

// Bypass is designed to bypass files that match the rules when manually toggling.
export class AutoReaderModeRegister extends BaseRegister {
  private static bypassedUriSet = new Set<string>()

  static addBypassUri(uri: vscode.Uri) {
    AutoReaderModeRegister.bypassedUriSet.add(uri.toString())
  }

  static removeBypassUri(uri: vscode.Uri) {
    AutoReaderModeRegister.bypassedUriSet.delete(uri.toString())
  }

  protected doRegister() {
    this.context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        if (!editor) {
          return
        }

        const document = editor.document

        if (editor.document.uri.scheme === config['schemeName']) {
          return
        }

        if (
          !AutoReaderModeRegister.bypassedUriSet.has(document.uri.toString()) &&
          isUriMatchAutoReaderMode(document.uri)
        ) {
          showReaderModeDocument(document)
        }
      })
    )
  }
}
