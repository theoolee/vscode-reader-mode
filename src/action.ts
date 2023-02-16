import vscode from 'vscode'
import { config } from './config'
import {
  closeActiveEditor,
  getActiveEditorSelection,
  getActiveTabIndex,
  setActiveTabIndex,
} from './util/misc'
import { toFileUri, toReaderModeUri } from './util/uri'

async function switchTextDocument(
  sourceUri: vscode.Uri,
  targetUri: vscode.Uri
) {
  const [sourceDocument, targetDocument] = await Promise.all([
    vscode.workspace.openTextDocument(sourceUri),
    vscode.workspace.openTextDocument(targetUri),
  ])

  await vscode.window.showTextDocument(sourceDocument)
  const tabIndex = getActiveTabIndex()
  const selection = getActiveEditorSelection()
  await closeActiveEditor()

  await vscode.window.showTextDocument(targetDocument, {
    preview: false,
    selection,
  })

  await setActiveTabIndex(tabIndex)
}

export async function showReaderModeDocument(document: vscode.TextDocument) {
  if (document.uri.scheme !== 'file') {
    return
  }

  await switchTextDocument(document.uri, toReaderModeUri(document.uri))
}

export async function showFileDocument(
  document: vscode.TextDocument,
  bypassAutoReaderMode = false
) {
  if (document.uri.scheme !== config['schemeName']) {
    return
  }

  await switchTextDocument(
    document.uri,
    toFileUri(document.uri, bypassAutoReaderMode)
  )
}
