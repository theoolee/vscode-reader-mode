/* eslint-disable @typescript-eslint/naming-convention */
import vscode from 'vscode'
import { config } from '../config'
import { parseComment } from '../parser'
import { BaseRegister } from './base'

export class CommentHighlightRegister extends BaseRegister {
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

  protected doRegister() {
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
}
