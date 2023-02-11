import vscode from 'vscode'

interface CommentRecords {
  partial: vscode.Range[]
  wholeLine: vscode.Range[]
}

interface CommentDelimiter {
  line?: string
  block?: {
    start: string
    end: string
  }
}

function escapeRegExp(text: string) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

function getCommentDelimiter(languageId: string): CommentDelimiter | undefined {
  switch (languageId) {
    case 'c':
    case 'cpp':
    case 'javascript':
    case 'javascriptreact':
    case 'typescript':
    case 'typescriptreact':
    case 'dart':
      return {
        line: '//',
        block: {
          start: '/*',
          end: '*/',
        },
      }
    case 'json':
    case 'jsonc':
      return {
        line: '//',
      }
    case 'python':
    case 'yaml':
    case 'shellscript':
      return {
        line: '#',
      }
  }
}

export function parseComment(document: vscode.TextDocument): CommentRecords {
  const comments: CommentRecords = {
    partial: [],
    wholeLine: [],
  }
  const delimiter = getCommentDelimiter(document.languageId)
  const code = document.getText()
  const blockRanges: vscode.Range[] = []
  const whiteSpaceRegex = /^\s*$/
  const lineRegex =
    delimiter?.line &&
    new RegExp(`([^\\n]*?)(${escapeRegExp(delimiter.line)}[^\\n]*)`, 'gs')
  const blockRegex =
    delimiter?.block &&
    new RegExp(
      `([^\\n]*?)(${escapeRegExp(delimiter.block.start)}.*?${escapeRegExp(
        delimiter.block.end
      )})(?=([^\\n]*))`,
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
        comments.wholeLine.push(range)
      } else {
        comments.partial.push(range)
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
          comments.wholeLine.push(range)
        } else {
          comments.partial.push(range)
        }
      }
    })
  }

  return comments
}
