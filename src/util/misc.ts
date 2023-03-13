import vscode from 'vscode'

type TabWithUri = vscode.Tab & { input: { uri: vscode.Uri } }

export function isTabHasUri(tab: vscode.Tab): tab is TabWithUri {
  return !!(tab.input as any)?.uri
}

export function getDocumentEditor(document: vscode.TextDocument) {
  return vscode.window.visibleTextEditors.find(
    (editor) => editor.document.uri.toString() === document.uri.toString()
  )
}

export function getDocumentTab(document: vscode.TextDocument) {
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

export async function closeDocumentTab(document: vscode.TextDocument) {
  try {
    await document.save()
  } catch (error) {
    // ignore
  }
  const tab = getDocumentTab(document)
  tab && (await vscode.window.tabGroups.close(tab))
}

export function getDocumentTabIndex(document: vscode.TextDocument) {
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

export async function setActiveTabIndex(index: number) {
  if (index < 0) {
    return
  }

  await vscode.commands.executeCommand('moveActiveEditor', {
    to: 'position',
    value: index + 1,
  })
}
