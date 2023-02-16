import vscode from 'vscode'
import { config } from '../config'
import { minimatch } from 'minimatch'

const bypassedAutoReaderModePathSet = new Set<string>()
const originalUriSchemeMap: Record<string, string> = {}

export function shouldUriAutoReaderMode(uri: vscode.Uri) {
  if (bypassedAutoReaderModePathSet.has(uri.toString())) {
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

export function toOriginalUri(uri: vscode.Uri, bypassAutoReaderMode = false) {
  if (uri.scheme !== config['schemeName']) {
    return uri
  }

  const originalUri = uri.with({
    scheme: originalUriSchemeMap[uri.toString()],
  })

  if (bypassAutoReaderMode) {
    bypassedAutoReaderModePathSet.add(originalUri.toString())
  }

  return originalUri
}

export function toReaderModeUri(uri: vscode.Uri) {
  if (uri.scheme === config['schemeName']) {
    return uri
  }

  bypassedAutoReaderModePathSet.delete(uri.toString())

  const readerModeUri = uri.with({
    scheme: config['schemeName'],
  })

  originalUriSchemeMap[readerModeUri.toString()] = uri.scheme

  return readerModeUri
}
