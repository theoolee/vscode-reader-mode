import vscode from 'vscode'

// TODO  Can not close target document currently, just close active editor.
export async function closeActiveEditor(document: vscode.TextDocument) {
  await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
}
