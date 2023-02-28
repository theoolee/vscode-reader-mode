import vscode from 'vscode'

type TabWithUri = vscode.Tab & { input: { uri: vscode.Uri } }

export function isTabHasUri(tab: vscode.Tab): tab is TabWithUri {
  return !!(tab.input as any)?.uri
}

export function getTextDocumentEditor(document: vscode.TextDocument) {
  return vscode.window.visibleTextEditors.find(
    (editor) => editor.document.uri.toString() === document.uri.toString()
  )
}

export function getTextDocumentTab(document: vscode.TextDocument) {
  let tab: vscode.Tab | undefined

  vscode.window.tabGroups.all.some((tabGroup) =>
    tabGroup.tabs.some((_tab) => {
      if (
        isTabHasUri(_tab) &&
        _tab.input.uri.toString() === document.uri.toString()
      ) {
        tab = _tab
        return true
      }
    })
  )

  return tab
}

export async function closeTextDocument(document: vscode.TextDocument) {
  await document.save()
  const tab = getTextDocumentTab(document)
  tab && (await vscode.window.tabGroups.close(tab))
}

export function getTextDocumentSelection(document: vscode.TextDocument) {
  const editor = getTextDocumentEditor(document)
  return editor?.selection
}

export function getTextDocumentTabIndex(document: vscode.TextDocument) {
  let index = -1

  vscode.window.tabGroups.all.some((tabGroup) =>
    tabGroup.tabs.some((tab, _index) => {
      if (
        isTabHasUri(tab) &&
        tab.input.uri.toString() === document.uri.toString()
      ) {
        index = _index
        return true
      }
    })
  )

  return index
}

export function isTextDocumentInTabGroup(document: vscode.TextDocument) {
  return !!getTextDocumentTab(document)
}

export async function setActiveTabIndex(index: number) {
  if (index < 0) {
    return
  }

  await vscode.commands.executeCommand('moveActiveEditor', {
    to: 'position',
    value: index + 1,
  })
}
