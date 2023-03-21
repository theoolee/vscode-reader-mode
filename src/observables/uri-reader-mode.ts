import vscode from 'vscode'
import { combineLatest, Observable, Subscriber } from 'rxjs'
import { minimatch } from 'minimatch'
import { observeConfig } from './config'

export function observeUriReaderMode(uri: vscode.Uri) {
  return new Observable<boolean>((subscriber) => {
    const configSubscription = combineLatest([
      observeConfig('auto.outOfWorkspace'),
      observeConfig('auto.glob'),
      observeConfig('auto.exclude'),
    ]).subscribe(([outOfWorkspace, glob, exclude]) => {
      if (
        uri.scheme !== 'file' ||
        exclude.some((pattern) =>
          minimatch(uri.path, pattern, { dot: true })
        ) ||
        uri.path.endsWith('.vscode/settings.json')
      ) {
        subscriber.next(false)
        return
      }

      const isOutOfWorkspaceFolder =
        outOfWorkspace &&
        !vscode.workspace.workspaceFolders?.some((folder) =>
          uri.path.startsWith(folder.uri.path)
        )

      const isMatchPattern = glob.some((pattern) =>
        minimatch(uri.path, pattern, { dot: true })
      )

      subscriber.next(isOutOfWorkspaceFolder || isMatchPattern)
    })

    return () => {
      configSubscription.unsubscribe()
    }
  })
}
