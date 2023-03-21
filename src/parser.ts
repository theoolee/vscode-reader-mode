import vscode from 'vscode'

export interface CommentRecords {
  partial: vscode.Range[]
  wholeLine: vscode.Range[]
}

export interface CommentDelimiter {
  line?: string
  block?: {
    start: string
    end: string
  }
}

function escapeRegExp(text: string) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

function getCommentDelimiter(languageId: string): CommentDelimiter {
  const commentDelimiter: CommentDelimiter = {}

  // For line.
  switch (languageId) {
    case 'al':
    case 'c':
    case 'cpp':
    case 'csharp':
    case 'css':
    case 'dart':
    case 'fsharp':
    case 'go':
    case 'haxe':
    case 'java':
    case 'javascript':
    case 'javascriptreact':
    case 'jsonc':
    case 'kotlin':
    case 'less':
    case 'pascal':
    case 'objectpascal':
    case 'php':
    case 'rust':
    case 'scala':
    case 'swift':
    case 'typescript':
    case 'typescriptreact':
    case 'json':
    case 'jsonc':
      commentDelimiter.line = '//'
      break
    case 'coffeescript':
    case 'dockerfile':
    case 'elixir':
    case 'graphql':
    case 'julia':
    case 'makefile':
    case 'perl':
    case 'perl6':
    case 'powershell':
    case 'python':
    case 'r':
    case 'ruby':
    case 'shellscript':
    case 'yaml':
      commentDelimiter.line = '#'
      break
    case 'ada':
    case 'haskell':
    case 'plsql':
    case 'sql':
    case 'lua':
      commentDelimiter.line = '--'
      break
    case 'clojure':
    case 'racket':
    case 'lisp':
      commentDelimiter.line = ';'
      break
    case 'erlang':
    case 'latex':
      commentDelimiter.line = '%'
      break
    case 'vb':
      commentDelimiter.line = "'"
  }

  // For block.
  switch (languageId) {
    case 'al':
    case 'c':
    case 'cpp':
    case 'csharp':
    case 'css':
    case 'dart':
    case 'fsharp':
    case 'go':
    case 'haxe':
    case 'java':
    case 'javascript':
    case 'javascriptreact':
    case 'jsonc':
    case 'kotlin':
    case 'less':
    case 'pascal':
    case 'objectpascal':
    case 'php':
    case 'rust':
    case 'scala':
    case 'swift':
    case 'typescript':
    case 'typescriptreact':
    case 'sql':
    case 'css':
      commentDelimiter.block = {
        start: '/*',
        end: '*/',
      }
      break
    case 'ruby':
    case 'perl':
      commentDelimiter.block = {
        start: '=begin',
        end: '=end',
      }
      break
    case 'lua':
      commentDelimiter.block = {
        start: '--[[',
        end: ']]',
      }
      break
    case 'html':
    case 'xml':
    case 'markdown':
      commentDelimiter.block = {
        start: '<!--',
        end: '-->',
      }
      break
  }

  return commentDelimiter
}

export function parseComment(document: vscode.TextDocument): CommentRecords {
  const commentRecords: CommentRecords = {
    partial: [],
    wholeLine: [],
  }
  const commentDelimiter = getCommentDelimiter(document.languageId)
  const code = document.getText()
  const blockRanges: vscode.Range[] = []
  const whiteSpaceRegex = /^\s*$/
  const lineRegex =
    commentDelimiter?.line &&
    new RegExp(
      `([^\\n]*?)(${escapeRegExp(commentDelimiter.line)}[^\\n]*)`,
      'gs'
    )
  const blockRegex =
    commentDelimiter?.block &&
    new RegExp(
      `([^\\n]*?)(${escapeRegExp(
        commentDelimiter.block.start
      )}.*?${escapeRegExp(commentDelimiter.block.end)})(?=([^\\n]*))`,
      'gs'
    )

  if (blockRegex) {
    Array.from(code.matchAll(blockRegex)).forEach((match) => {
      const startIndex = match.index! + match[1].length
      const endIndex = startIndex + match[2].length

      const range = new vscode.Range(
        document.positionAt(startIndex),
        document.positionAt(endIndex)
      )

      if (whiteSpaceRegex.test(`${match[1]}${match[3]}`)) {
        commentRecords.wholeLine.push(range)
      } else {
        commentRecords.partial.push(range)
      }

      blockRanges.push(range)
    })
  }

  if (lineRegex) {
    Array.from(code.matchAll(lineRegex)).forEach((match) => {
      const startIndex = match.index! + match[1].length
      const endIndex = startIndex + match[2].length

      const range = new vscode.Range(
        document.positionAt(startIndex),
        document.positionAt(endIndex)
      )

      if (!blockRanges.some((blockRange) => blockRange.contains(range.start))) {
        if (whiteSpaceRegex.test(match[1])) {
          commentRecords.wholeLine.push(range)
        } else {
          commentRecords.partial.push(range)
        }
      }
    })
  }

  return commentRecords
}
