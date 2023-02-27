import vscode from 'vscode'
import { toOriginalUri } from '../util/uri'
import { BaseRegister } from './base'

class FileSystemProvider implements vscode.FileSystemProvider {
  private onDidChangeFileEmitter = new vscode.EventEmitter<
    vscode.FileChangeEvent[]
  >()
  private onBeforeOpenFileEmitter = new vscode.EventEmitter<vscode.Uri>()

  onDidChangeFile = this.onDidChangeFileEmitter.event
  onBeforeOpenFile = this.onBeforeOpenFileEmitter.event

  async readFile(uri: vscode.Uri) {
    this.onBeforeOpenFileEmitter.fire(uri)
    const originalUri = toOriginalUri(uri)

    if (originalUri.scheme !== 'file') {
      return Buffer.from(
        (await vscode.workspace.openTextDocument(originalUri)).getText()
      )
    }

    return vscode.workspace.fs.readFile(originalUri)
  }

  watch(uri: vscode.Uri) {
    const originalUri = toOriginalUri(uri)

    if (originalUri.scheme !== 'file') {
      return new vscode.Disposable(() => {})
    }

    const watcher = vscode.workspace.createFileSystemWatcher(originalUri.path)

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
    const originalUri = toOriginalUri(uri)

    if (originalUri.scheme !== 'file') {
      return {
        type: vscode.FileType.File,
        ctime: 0,
        mtime: 0,
        size: 0,
      }
    }

    return vscode.workspace.fs.stat(originalUri)
  }

  readDirectory(uri: vscode.Uri) {
    const originalUri = toOriginalUri(uri)

    if (originalUri.scheme !== 'file') {
      return []
    }

    return vscode.workspace.fs.readDirectory(originalUri)
  }

  createDirectory() {}
  writeFile() {}
  delete() {}
  rename() {}
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
