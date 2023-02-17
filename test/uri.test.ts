import assert from 'assert'
import vscode from 'vscode'
import { toOriginalUri, toReaderModeUri } from '../src/util/uri'

suite('Uri', () => {
  const originalUris = [
    vscode.Uri.file(__dirname),
    vscode.Uri.from({
      scheme: 'jdt',
      authority: 'org.eclipse.jdt.ls.tests',
      path: '/test',
      fragment: 'fragment',
    }),
    vscode.Uri.parse('https://example.com/'),
  ]

  const readerModeUris = originalUris.map(toReaderModeUri)

  test('Convert to reader mode uri', () => {
    readerModeUris.forEach((uri) => {
      assert.strictEqual(uri.scheme, 'reader-mode')
      assert.strictEqual(uri.path[0], '/')
    })
  })

  test('Convert back to original uri', () => {
    readerModeUris.forEach((uri, index) => {
      assert.strictEqual(
        toOriginalUri(uri).toString(),
        originalUris[index].toString()
      )
    })
  })
})
