import vscode from 'vscode'
import { config } from '../config'
import { minimatch } from 'minimatch'

const delimiter = `%__${config['schemeName']}__%`

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

  const [scheme, fragment] = uri.fragment.split(delimiter)

  const originalUri = uri.with({
    scheme,
    fragment,
  })

  return originalUri
}

export function toReaderModeUri(uri: vscode.Uri) {
  if (uri.scheme === config['schemeName']) {
    return uri
  }

  const readerModeUri = uri.with({
    scheme: config['schemeName'],
    fragment: `${uri.scheme}${delimiter}${uri.fragment}`,
  })

  return readerModeUri
}
