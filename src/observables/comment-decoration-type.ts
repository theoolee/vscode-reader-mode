/* eslint-disable @typescript-eslint/naming-convention */
import { Observable, combineLatest } from 'rxjs'
import vscode from 'vscode'
import { observeConfig } from './config'

export const commentDecorationTypeObservable = new Observable<
  [vscode.TextEditorDecorationType, vscode.TextEditorDecorationType]
>((subscriber) => {
  let partialDecoration: vscode.TextEditorDecorationType | undefined
  let wholeLineDecoration: vscode.TextEditorDecorationType | undefined

  const configSubscription = combineLatest([
    observeConfig('commentStyle.fontFamily') as Observable<string>,
    observeConfig('commentStyle.fontStyle'),
    observeConfig('commentStyle.fontSize'),
    observeConfig('commentStyle.fontWeight'),
    observeConfig('commentStyle.opacity'),
    observeConfig('commentStyle.backgroundColor'),
  ]).subscribe(
    ([
      fontFamily,
      fontStyle,
      fontSize,
      fontWeight,
      opacity,
      backgroundColor,
    ]) => {
      const fontStyleObject = {
        'font-family': fontFamily,
        'font-style': fontStyle,
        'font-size': fontSize,
        'font-weight': fontWeight,
        opacity,
      }
      const textDecoration =
        'none; ' +
        Object.entries(fontStyleObject)
          .filter(([_, value]) => !!value)
          .map(([key, value]) => `${key}: ${value}`)
          .join(';')
      partialDecoration = vscode.window.createTextEditorDecorationType({
        isWholeLine: false,
        backgroundColor,
        textDecoration,
      })
      wholeLineDecoration = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor,
        textDecoration,
      })

      subscriber.next([partialDecoration, wholeLineDecoration])
    }
  )

  return () => {
    configSubscription.unsubscribe()
    partialDecoration?.dispose()
    wholeLineDecoration?.dispose()
  }
})
