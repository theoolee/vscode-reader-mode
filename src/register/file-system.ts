import vscode from 'vscode'
import { toFileUri } from '../util/uri'
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

  watch(uri: vscode.Uri) {
    const watcher = vscode.workspace.createFileSystemWatcher(
      toFileUri(uri).path
    )

    watcher.onDidChange(() => {
      this.onDidChangeFileEmitter.fire([
        {
          type: vscode.FileChangeType.Changed,
          uri,
        },
      ])
    })

    watcher.onDidCreate(() => {
      this.onDidChangeFileEmitter.fire([
        {
          type: vscode.FileChangeType.Created,
          uri,
        },
      ])
    })

    watcher.onDidDelete(() => {
      this.onDidChangeFileEmitter.fire([
        {
          type: vscode.FileChangeType.Deleted,
          uri,
        },
      ])
    })

    return watcher
  }

  stat(uri: vscode.Uri) {
    return vscode.workspace.fs.stat(toFileUri(uri))
  }

  readDirectory(uri: vscode.Uri) {
    return vscode.workspace.fs.readDirectory(toFileUri(uri))
  }

  createDirectory(uri: vscode.Uri) {
    return vscode.workspace.fs.createDirectory(toFileUri(uri))
  }

  writeFile(uri: vscode.Uri, content: Uint8Array) {
    return vscode.workspace.fs.writeFile(toFileUri(uri), content)
  }

  delete(uri: vscode.Uri, options: { readonly recursive: boolean }) {
    return vscode.workspace.fs.delete(toFileUri(uri))
  }

  rename(oldUri: vscode.Uri, newUri: vscode.Uri) {
    return vscode.workspace.fs.rename(toFileUri(oldUri), toFileUri(newUri))
  }
}

export class FileSystemRegister extends BaseRegister {
  private fileSystemProvider = new FileSystemProvider()

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
  }

  onBeforeOpenFile(handler: (uri: vscode.Uri) => any) {
    this.fileSystemProvider.onBeforeOpenFile(handler)
  }
}
