/* eslint-disable @typescript-eslint/naming-convention */
import vscode from 'vscode'
import { showReaderModeDocument } from '../action'
import { config } from '../config'
import { parseComment } from '../parser'
import { shouldUriAutoReaderMode } from '../util/uri'
import { BaseRegister } from './base'

export class EventHandlerRegister extends BaseRegister {
  private computeCommentDecorationType(isWholeLine = false) {
    const fontStyle = {
      'font-family': config['commentStyle.fontFamily'],
      'font-style': config['commentStyle.fontStyle'],
      'font-size': config['commentStyle.fontSize'],
      'font-weight': config['commentStyle.fontWeight'],
      opacity: config['commentStyle.opacity'],
    }

    return vscode.window.createTextEditorDecorationType({
      isWholeLine,
      backgroundColor: config['commentStyle.backgroundColor'],
      textDecoration:
        'none; ' +
        Object.entries(fontStyle)
          .filter(([_, value]) => !!value)
          .map(([key, value]) => `${key}: ${value}`)
          .join(';'),
    })
  }

  private registerAutoReaderModeHandler() {
    this.context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        if (!editor) {
          return
        }

        const document = editor.document

        if (shouldUriAutoReaderMode(document.uri)) {
          showReaderModeDocument(document, {
            selection: editor.selection,
          })
        }
      })
    )
  }

  private registerHighlightCommentHandler() {
    this.context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        const document = editor?.document

        if (document && document.uri.scheme === config['schemeName']) {
          const comments = parseComment(document)

          editor.setDecorations(
            this.computeCommentDecorationType(),
            comments.partial
          )
          editor.setDecorations(
            this.computeCommentDecorationType(true),
            comments.wholeLine
          )
        }
      })
    )
  }

  protected doRegister() {
    this.registerAutoReaderModeHandler()
    this.registerHighlightCommentHandler()
  }
}
