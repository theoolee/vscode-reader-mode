import vscode from 'vscode'
import { config } from '../config'
import { toReaderModeUri } from './uri'

function wait(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

export function propagateReaderMode(
  sourceUri: vscode.Uri,
  targetUri: vscode.Uri
) {
  if (config['propagate'] || sourceUri.path === targetUri.path) {
    return toReaderModeUri(targetUri)
  }

  return targetUri
}

export function propagateReaderModeOnLocationResult<
  T extends vscode.Location[] | vscode.LocationLink[]
>(sourceUri: vscode.Uri, result: T): T {
  result.forEach((item) => {
    if (item instanceof vscode.Location) {
      item.uri = propagateReaderMode(sourceUri, item.uri)
    } else {
      item.targetUri = propagateReaderMode(sourceUri, item.targetUri)
    }
  })

  return result
}

// Ensure the document is opened before executing the command, otherwise some commands would return undefined.
// If we still get undefined after max retry, we give up.
export async function tryCommand(
  command: string,
  uri: vscode.Uri,
  ...args: any[]
) {
  let result: any

  while (!result) {
    await vscode.workspace.openTextDocument(uri)
    result = await vscode.commands.executeCommand(command, uri, ...args)

    if (!result) {
      await wait(1000)
    }
  }

  return result
}
