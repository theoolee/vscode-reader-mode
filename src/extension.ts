import vscode from 'vscode'
import { Subscription } from 'rxjs'
import { activeEditorObservable } from './observables/active-editor'
import { observeUriReaderMode } from './observables/uri-reader-mode'
import { commentDecorationTypeObservable } from './observables/comment-decoration-type'
import { CommentRecords, parseComment } from './parser'
import path from 'path'

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    new Extension(),
    vscode.commands.registerCommand('reader-mode.toggleWorkspace', async () => {
      const uri = vscode.window.activeTextEditor?.document.uri

      if (!uri) {
        return
      }

      const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri)

      if (!workspaceFolder) {
        return
      }

      const pattern = path.resolve(workspaceFolder.uri.path, '**')
      const configuration = vscode.workspace.getConfiguration(
        undefined,
        workspaceFolder.uri
      )
      const autoGlob: string[] =
        configuration.get('reader-mode.auto.glob') ?? []
      const isOn = autoGlob.findIndex((_pattern) => _pattern === pattern) !== -1

      configuration.update(
        'reader-mode.auto.glob',
        isOn
          ? autoGlob.filter((_pattern) => _pattern !== pattern)
          : [...autoGlob, pattern]
      )
    })
  )
}

class Extension {
  private activeEditorSubscription: Subscription | undefined
  private uriReaderModeSubscription: Subscription | undefined
  private commentDecorationTypeSubscription: Subscription | undefined
  private onTextChangeListener: vscode.Disposable | undefined
  private toggleFileCommand: vscode.Disposable | undefined
  private statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    -999
  )

  constructor() {
    this.statusBarItem.name = 'Reader Mode'
    this.statusBarItem.text = '$(book)'
    this.statusBarItem.command = 'reader-mode.temporarilyToggleFile'
    this.activeEditorSubscription = activeEditorObservable.subscribe(
      (editor) => {
        this.setStatusBarMode(false)
        this.uriReaderModeSubscription?.unsubscribe()
        this.commentDecorationTypeSubscription?.unsubscribe()
        this.onTextChangeListener?.dispose()
        this.toggleFileCommand?.dispose()
        this.statusBarItem.hide()

        if (!editor) {
          return
        }

        const uri = editor.document.uri
        this.statusBarItem.show()
        this.uriReaderModeSubscription = observeUriReaderMode(uri).subscribe(
          (isReaderMode) => {
            let comments: CommentRecords | undefined

            const disable = () => {
              this.setStatusBarMode(false)
              this.commentDecorationTypeSubscription?.unsubscribe()
              this.onTextChangeListener?.dispose()
              this.toggleFileCommand?.dispose()
              this.toggleFileCommand = vscode.commands.registerCommand(
                'reader-mode.temporarilyToggleFile',
                enable
              )
              comments = undefined
            }

            const enable = () => {
              const updateCommentDecoration = () => {
                this.commentDecorationTypeSubscription =
                  commentDecorationTypeObservable.subscribe(
                    ([partialDecoration, wholeLineDecoration]) => {
                      comments ??= parseComment(editor.document)
                      editor.setDecorations(partialDecoration, comments.partial)
                      editor.setDecorations(
                        wholeLineDecoration,
                        comments.wholeLine
                      )
                    }
                  )
              }

              updateCommentDecoration()
              this.setStatusBarMode(true)
              this.toggleFileCommand?.dispose()
              this.toggleFileCommand = vscode.commands.registerCommand(
                'reader-mode.temporarilyToggleFile',
                disable
              )

              this.onTextChangeListener =
                vscode.workspace.onDidChangeTextDocument(async (event) => {
                  if (event.document.uri.path !== uri.path) {
                    return
                  }

                  this.commentDecorationTypeSubscription?.unsubscribe()
                  updateCommentDecoration()
                  await vscode.commands.executeCommand('undo')
                  vscode.commands.executeCommand(
                    'editor.action.goToLocations',
                    uri,
                    new vscode.Position(
                      vscode.window.activeTextEditor!.selection.active.line,
                      vscode.window.activeTextEditor!.selection.active.character
                    ),
                    [],
                    '',
                    'File is read-only'
                  )
                })
            }

            // disable for last state
            disable()

            if (isReaderMode) {
              enable()
            }
          }
        )
      }
    )
  }

  setStatusBarMode(isOn: boolean) {
    if (isOn) {
      this.statusBarItem.tooltip = 'Reader Mode is On'
      this.statusBarItem.backgroundColor = new vscode.ThemeColor(
        'statusBarItem.warningBackground'
      )
      this.statusBarItem.color = new vscode.ThemeColor(
        'statusBarItem.warningForeground'
      )
    } else {
      this.statusBarItem.tooltip = 'Reader Mode is Off'
      this.statusBarItem.backgroundColor = undefined
      this.statusBarItem.color = undefined
    }
  }

  dispose(): void {
    this.activeEditorSubscription?.unsubscribe()
    this.uriReaderModeSubscription?.unsubscribe()
    this.commentDecorationTypeSubscription?.unsubscribe()
    this.statusBarItem?.dispose()
    this.onTextChangeListener?.dispose()
    this.toggleFileCommand?.dispose()
  }
}
