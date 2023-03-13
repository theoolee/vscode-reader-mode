import vscode from 'vscode'
import { SpecificLanguageFeatureRegister } from './feature-register/language-feature'
import {
  closeDocumentTab,
  getDocumentTabIndex,
  setActiveTabIndex,
  getDocumentEditor,
  getDocumentTab,
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
  const sourceEditor = getDocumentEditor(sourceDocument)
  const sourceTab = getDocumentTab(sourceDocument)
  const targetTab = getDocumentTab(targetDocument)
  const sourceTabIndex = getDocumentTabIndex(sourceDocument)
  const sourceSelection = sourceEditor?.selection
  const cursorSurroundingLines = (vscode.workspace
    .getConfiguration('editor')
    .get('cursorSurroundingLines') ?? 0) as number
  const sourceTopLine = sourceEditor?.visibleRanges[0].start.line
  const isTargetInTabGroup = !!targetTab
  const isSourcePreview = sourceTab?.isPreview
  closeDocumentTab(sourceDocument)

  await vscode.window.showTextDocument(
    targetDocument,
    isTargetInTabGroup
      ? undefined
      : {
          preview: isSourcePreview,
          selection: sourceSelection,
        }
  )

  if (!isTargetInTabGroup) {
    // Some language servers with special implementation would result vscode not to request semantic tokens.
    // So we need to force vscode to request semantic tokens.
    SpecificLanguageFeatureRegister.documentSemanticTokensProvider.onDidChangeSemanticTokensEmitter.fire()

    await Promise.all([
      async () => {
        if (sourceTopLine) {
          await vscode.commands.executeCommand('revealLine', {
            lineNumber: sourceTopLine - cursorSurroundingLines,
            at: 'top',
          })
        }
      },
      async () => {
        await setActiveTabIndex(sourceTabIndex)
      },
    ])
  }
}

export async function showReaderModeDocument(document: vscode.TextDocument) {
  await switchTextDocument(document.uri, toReaderModeUri(document.uri))
}

export async function showOriginalDocument(document: vscode.TextDocument) {
  await switchTextDocument(document.uri, toOriginalUri(document.uri))
}
