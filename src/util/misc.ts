import vscode from 'vscode'

export async function closeActiveEditor() {
  await vscode.window.activeTextEditor?.document.save()
  // This method seems much faster than the commented out method below.
  vscode.window.activeTextEditor?.hide()
  // await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
}

export function getActiveEditorSelection() {
  return vscode.window.activeTextEditor?.selection
}

export function getActiveTabIndex() {
  const activeTabGroup = vscode.window.tabGroups.activeTabGroup
  return activeTabGroup.tabs.findIndex(
    (tab) => tab === activeTabGroup.activeTab
  )
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
