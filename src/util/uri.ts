import vscode from 'vscode'
import { config } from '../config'
import { minimatch } from 'minimatch'

const bypassedAutoReaderModePathSet = new Set<string>()

export function shouldUriAutoReaderMode(uri: vscode.Uri) {
  if (uri.scheme !== 'file' || bypassedAutoReaderModePathSet.has(uri.path)) {
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

  return isOutOfWorkspaceFolder || isMatchPattern
}

export function toFileUri(uri: vscode.Uri, bypassAutoReaderMode = false) {
  let uriToReturn = uri

  if (uri.scheme !== 'file') {
    uriToReturn = uri.with({
      scheme: 'file',
    })
  }

  if (bypassAutoReaderMode) {
    bypassedAutoReaderModePathSet.add(uriToReturn.path)
  }

  return uriToReturn
}

export function toReaderModeUri(uri: vscode.Uri) {
  let uriToReturn = uri

  if (uri.scheme !== config['schemeName']) {
    uriToReturn = uri.with({
      scheme: config['schemeName'],
    })
  }

  bypassedAutoReaderModePathSet.delete(uriToReturn.path)

  return uriToReturn
}
