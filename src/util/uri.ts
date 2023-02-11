import vscode from 'vscode'
import { config } from '../config'
import { minimatch } from 'minimatch'

const bypassAutoReaderModeUriSet = new Set<string>()

export function shouldUriAutoReaderMode(uri: vscode.Uri) {
  if (uri.scheme !== 'file') {
    return false
  }

  const isOutOfWorkspaceFolder =
    config['auto.outOfWorkspace'] &&
    !vscode.workspace.workspaceFolders?.some((folder) =>
      uri.path.startsWith(folder.uri.path)
    )

  const isMatchPattern = config['auto.glob'].some((pattern) =>
    minimatch(uri.path, pattern, { dot: true })
  )

  return (
    !bypassAutoReaderModeUriSet.delete(uri.toString()) &&
    (isOutOfWorkspaceFolder || isMatchPattern)
  )
}

export function toFileUri(uri: vscode.Uri, bypassAutoReaderMode = false) {
  const fileUri = uri.with({
    scheme: 'file',
  })

  if (bypassAutoReaderMode) {
    bypassAutoReaderModeUriSet.add(fileUri.toString())
  }

  return fileUri
}

export function toReaderModeUri(uri: vscode.Uri) {
  return uri.with({
    scheme: config['schemeName'],
  })
}

export function isReaderModeUriFromFileUri(
  readerModeUri: vscode.Uri,
  fileUri: vscode.Uri
) {
  return (
    readerModeUri.scheme === config['schemeName'] &&
    fileUri.scheme === 'file' &&
    readerModeUri.path === fileUri.path
  )
}
