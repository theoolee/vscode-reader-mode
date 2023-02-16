import vscode from 'vscode'
import { toReaderModeUri } from './uri'

function wait(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
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

export function correctSymbolResult<
  T extends vscode.SymbolInformation[] | vscode.DocumentSymbol[]
>(result: T, flatResult: any[] = []) {
  result.forEach((item: any) => {
    if (item.location) {
      item.location.uri = toReaderModeUri(item.location.uri)
    }

    flatResult.push(item)

    if (item.children) {
      correctSymbolResult(item.children, flatResult)
    }
  })

  return flatResult
}

export function correctLocationResult<
  T extends vscode.Location[] | vscode.LocationLink[]
>(result: T) {
  result.forEach((item) => {
    if (item instanceof vscode.Location) {
      item.uri = toReaderModeUri(item.uri)
    } else {
      item.targetUri = toReaderModeUri(item.targetUri)
    }
  })

  return result
}
