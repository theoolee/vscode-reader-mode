import vscode from 'vscode'
import { config } from '../config'
import { toOriginalUri, toReaderModeUri } from './uri'

function wait(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

/** Ensure document and language server is ready before we get a result.
 * Try to get result every 2 seconds until we get a result or document is closed.
 * 
 * @param uri The reader mode uri.
 */
export async function tryCommand(
  command: string,
  args: any[],
  uri?: vscode.Uri
) {
  if (!uri) {
    return vscode.commands.executeCommand(command, ...args)
  }

  let result: any
  const document = await vscode.workspace.openTextDocument(uri)

  while (!result && !document.isClosed) {
    await vscode.workspace.openTextDocument(toOriginalUri(uri))
    result = await vscode.commands.executeCommand(command, ...args)

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

export function toRawLanguageId(languageId: string) {
  return languageId.replace(/^__/, '').replace(/__$/, '')
}

export function toHijackedLanguageId(languageId: string) {
  return (
    config['hijackedLanguageIds'].find(
      (hijackedLanguageId) => hijackedLanguageId === `__${languageId}__`
    ) ?? languageId
  )
}
