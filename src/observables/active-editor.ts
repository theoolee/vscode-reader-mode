import vscode from 'vscode'
import { Observable } from 'rxjs'

export const activeEditorObservable = new Observable<
  vscode.TextEditor | undefined
>((subscriber) => {
  subscriber.next(vscode.window.activeTextEditor)

  const disposable = vscode.window.onDidChangeActiveTextEditor((editor) => {
    subscriber.next(editor)
  })

  return () => {
    disposable.dispose()
  }
})
