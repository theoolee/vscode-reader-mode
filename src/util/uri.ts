import vscode from 'vscode'
import { config } from '../config'
import { minimatch } from 'minimatch'

const originalUriSchemeMap: Record<string, string> = {}

export function isUriMatchAutoReaderMode(uri: vscode.Uri) {
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

export function toOriginalUri(uri: vscode.Uri) {
  if (uri.scheme !== config['schemeName']) {
    return uri
  }

  const originalUri = uri.with({
    scheme: originalUriSchemeMap[uri.toString()],
  })

  return originalUri
}

export function toReaderModeUri(uri: vscode.Uri) {
  if (uri.scheme === config['schemeName']) {
    return uri
  }

  const readerModeUri = uri.with({
    scheme: config['schemeName'],
  })

  originalUriSchemeMap[readerModeUri.toString()] = uri.scheme

  return readerModeUri
}
