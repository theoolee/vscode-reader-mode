import vscode from 'vscode'
import { isReaderModeUriFromFileUri, toFileUri } from '../util/uri'
import { BaseRegister } from './base'

class FileSystemProvider implements vscode.FileSystemProvider {
  private onDidChangeFileEmitter = new vscode.EventEmitter<
    vscode.FileChangeEvent[]
  >()
  private onBeforeOpenFileEmitter = new vscode.EventEmitter<vscode.Uri>()

  onDidChangeFile = this.onDidChangeFileEmitter.event
  onBeforeOpenFile = this.onBeforeOpenFileEmitter.event

  readFile(uri: vscode.Uri) {
    this.onBeforeOpenFileEmitter.fire(uri)
    return vscode.workspace.fs.readFile(toFileUri(uri))
  }

  watch() {
    return { dispose: () => {} }
  }

  stat() {
    return {
      type: vscode.FileType.File,
      ctime: 0,
      mtime: 0,
      size: 0,
    }
  }

  readDirectory() {
    return []
  }

  createDirectory() {}
  writeFile() {}
  delete() {}
  rename(): void {}
}

export class FileSystemRegister extends BaseRegister {
  private fileSystemProvider = new FileSystemProvider()

  private onDidSaveTextDocumentHandler(savedDocument: vscode.TextDocument) {
    vscode.workspace.textDocuments.some((document) => {
      if (!isReaderModeUriFromFileUri(document.uri, savedDocument.uri)) {
        return false
      }

      const workspaceEdit = new vscode.WorkspaceEdit()
      workspaceEdit.replace(
        document.uri,
        new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(
            document.lineCount - 1,
            document.lineAt(document.lineCount - 1).text.length
          )
        ),
        savedDocument.getText()
      )

      vscode.workspace.applyEdit(workspaceEdit)
      return true
    })
  }

  private onDidDeleteFilesHandler(event: vscode.FileDeleteEvent) {
    event.files.some((file) => {
      vscode.workspace.textDocuments.some((document) => {
        if (!isReaderModeUriFromFileUri(document.uri, file)) {
          return false
        }

        vscode.window.showTextDocument(document).then(() => {
          vscode.commands.executeCommand('workbench.action.closeActiveEditor')
        })
        return true
      })
    })
  }

  private registerFileChangeHandler() {
    this.context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(this.onDidSaveTextDocumentHandler),
      vscode.workspace.onDidDeleteFiles(this.onDidDeleteFilesHandler)
    )
  }

  protected doRegister() {
    this.context.subscriptions.push(
      vscode.workspace.registerFileSystemProvider(
        this.documentSelector.scheme,
        this.fileSystemProvider,
        {
          isReadonly: true,
          isCaseSensitive: true,
        }
      )
    )
    this.registerFileChangeHandler()
  }

  onBeforeOpenFile(handler: (uri: vscode.Uri) => any) {
    this.fileSystemProvider.onBeforeOpenFile(handler)
  }
}
