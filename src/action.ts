import vscode from 'vscode'
import { config } from './config'
import {
  closeActiveEditor,
  getActiveEditorSelection,
  getActiveTabIndex,
  setActiveTabIndex,
} from './util/misc'
import { toFileUri, toReaderModeUri } from './util/uri'

export async function showReaderModeDocument(document: vscode.TextDocument) {
  if (document.uri.scheme !== 'file') {
    return
  }

  await vscode.window.showTextDocument(document)
  const tabIndex = getActiveTabIndex()
  const selection = getActiveEditorSelection()
  await closeActiveEditor()

  const readerModeDocument = await vscode.workspace.openTextDocument(
    toReaderModeUri(document.uri)
  )

  await vscode.window.showTextDocument(readerModeDocument, {
    preview: false,
    selection,
  })

  setActiveTabIndex(tabIndex)
}

export async function showFileDocument(
  document: vscode.TextDocument,
  bypassAutoReaderMode = false
) {
  if (document.uri.scheme !== config['schemeName']) {
    return
  }

  await vscode.window.showTextDocument(document)
  const tabIndex = getActiveTabIndex()
  const selection = getActiveEditorSelection()
  await closeActiveEditor()

  const fileDocument = await vscode.workspace.openTextDocument(
    toFileUri(document.uri, bypassAutoReaderMode)
  )

  await vscode.window.showTextDocument(fileDocument, {
    preview: false,
    selection,
  })

  setActiveTabIndex(tabIndex)
}
