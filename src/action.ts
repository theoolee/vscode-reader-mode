import vscode from 'vscode'
import { closeActiveEditor } from './util/editor'
import { toFileUri, toReaderModeUri } from './util/uri'

export async function showReaderModeDocument(
  document: vscode.TextDocument,
  options?: Omit<vscode.TextDocumentShowOptions, 'preview'>
) {
  const readerModeDocument = await vscode.workspace.openTextDocument(
    toReaderModeUri(document.uri)
  )

  await closeActiveEditor(document)
  await vscode.window.showTextDocument(readerModeDocument, {
    ...options,
    preview: false,
  })
}

export async function showFileDocument(
  document: vscode.TextDocument,
  options?: Omit<vscode.TextDocumentShowOptions, 'preview'> & {
    bypassAutoReaderMode?: boolean
  }
) {
  const fileDocument = await vscode.workspace.openTextDocument(
    toFileUri(document.uri, options?.bypassAutoReaderMode)
  )

  await closeActiveEditor(document)
  await vscode.window.showTextDocument(fileDocument, {
    ...options,
    preview: false,
  })
}
