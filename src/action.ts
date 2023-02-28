import vscode from 'vscode'
import { SpecificLanguageFeatureRegister } from './feature-register/language-feature'
import {
  closeTextDocument,
  getTextDocumentSelection,
  getTextDocumentTabIndex,
  setActiveTabIndex,
  isTextDocumentInTabGroup,
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

  const isTargetDocumentInTabGroup = isTextDocumentInTabGroup(targetDocument)
  const tabIndex = getTextDocumentTabIndex(sourceDocument)
  const selection = getTextDocumentSelection(sourceDocument)
  closeTextDocument(sourceDocument)

  await vscode.window.showTextDocument(targetDocument, {
    preview: false,
    selection,
  })

  // Some language servers with special implementation would result vscode not to request semantic tokens.
  // So we need to force vscode to request semantic tokens.
  SpecificLanguageFeatureRegister.documentSemanticTokensProvider.onDidChangeSemanticTokensEmitter.fire()

  isTargetDocumentInTabGroup || (await setActiveTabIndex(tabIndex))
}

export async function showReaderModeDocument(document: vscode.TextDocument) {
  await switchTextDocument(document.uri, toReaderModeUri(document.uri))
}

export async function showOriginalDocument(document: vscode.TextDocument) {
  await switchTextDocument(document.uri, toOriginalUri(document.uri))
}
