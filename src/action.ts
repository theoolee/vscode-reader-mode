import vscode from 'vscode'
import {
  closeActiveEditor,
  getActiveEditorSelection,
  getActiveTabIndex,
  setActiveTabIndex,
} from './util/misc'
import { toOriginalUri, toReaderModeUri } from './util/uri'

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
  await switchTextDocument(document.uri, toReaderModeUri(document.uri))
}

export async function showOriginalDocument(document: vscode.TextDocument) {
  await switchTextDocument(document.uri, toOriginalUri(document.uri))
}
