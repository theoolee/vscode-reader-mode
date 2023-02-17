import vscode from 'vscode'
import { config } from '../config'
import {
  correctSymbolResult,
  correctLocationResult,
  tryCommand,
} from '../util/language'
import { toOriginalUri, toReaderModeUri } from '../util/uri'
import { BaseRegister } from './base'

class DocumentHighlightProvider implements vscode.DocumentHighlightProvider {
  async provideDocumentHighlights(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const result: vscode.DocumentHighlight[] = await tryCommand(
      'vscode.executeDocumentHighlights',
      toOriginalUri(document.uri),
      position
    )

    return result
  }
}

class DocumentLinkProvider implements vscode.DocumentLinkProvider {
  async provideDocumentLinks(document: vscode.TextDocument) {
    const result: vscode.DocumentLink[] = await tryCommand(
      'vscode.executeLinkProvider',
      toOriginalUri(document.uri)
    )

    result.forEach((item) => {
      if (item.target?.scheme === 'file') {
        item.target = toReaderModeUri(item.target)
      }
    })

    return result
  }
}

class DefinitionProvider implements vscode.DefinitionProvider {
  async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const result: vscode.Location[] | vscode.LocationLink[] = await tryCommand(
      'vscode.executeDefinitionProvider',
      toOriginalUri(document.uri),
      position
    )

    return correctLocationResult(result)
  }
}

class TypeDefinitionProvider implements vscode.TypeDefinitionProvider {
  async provideTypeDefinition(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const result: vscode.Location[] | vscode.LocationLink[] = await tryCommand(
      'vscode.executeTypeDefinitionProvider',
      toOriginalUri(document.uri),
      position
    )

    return correctLocationResult(result)
  }
}

class DeclarationProvider implements vscode.DeclarationProvider {
  async provideDeclaration(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const result: vscode.Location[] | vscode.LocationLink[] = await tryCommand(
      'vscode.executeDeclarationProvider',
      toOriginalUri(document.uri),
      position
    )

    return correctLocationResult(result)
  }
}

class ImplementationProvider implements vscode.ImplementationProvider {
  async provideImplementation(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const result: vscode.Location[] | vscode.LocationLink[] = await tryCommand(
      'vscode.executeImplementationProvider',
      toOriginalUri(document.uri),
      position
    )

    return correctLocationResult(result)
  }
}

class ReferenceProvider implements vscode.ReferenceProvider {
  async provideReferences(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const result: vscode.Location[] = await tryCommand(
      'vscode.executeReferenceProvider',
      toOriginalUri(document.uri),
      position
    )

    return correctLocationResult(result)
  }
}

class HoverProvider implements vscode.HoverProvider {
  async provideHover(document: vscode.TextDocument, position: vscode.Position) {
    const result: vscode.Hover[] = await tryCommand(
      'vscode.executeHoverProvider',
      toOriginalUri(document.uri),
      position
    )

    return result[0]
  }
}

class InlayHintsProvider implements vscode.InlayHintsProvider {
  async provideInlayHints(document: vscode.TextDocument, range: vscode.Range) {
    const result: vscode.InlayHint[] = await tryCommand(
      'vscode.executeInlayHintProvider',
      toOriginalUri(document.uri),
      range
    )

    return result
  }
}

class DocumentSymbolProvider implements vscode.DocumentSymbolProvider {
  async provideDocumentSymbols(document: vscode.TextDocument) {
    const result: vscode.SymbolInformation[] | vscode.DocumentSymbol[] =
      await tryCommand(
        'vscode.executeDocumentSymbolProvider',
        toOriginalUri(document.uri)
      )

    return correctSymbolResult(result)
  }
}

class DocumentColorProvider implements vscode.DocumentColorProvider {
  async provideDocumentColors(document: vscode.TextDocument) {
    const result: vscode.ColorInformation[] = await tryCommand(
      'vscode.executeDocumentColorProvider',
      toOriginalUri(document.uri)
    )

    return result
  }

  async provideColorPresentations(
    color: vscode.Color,
    context: {
      readonly document: vscode.TextDocument
      readonly range: vscode.Range
    }
  ) {
    await vscode.workspace.openTextDocument(toOriginalUri(context.document.uri))
    const result: vscode.ColorPresentation[] =
      await vscode.commands.executeCommand(
        'vscode.provideColorPresentations',
        color,
        {
          uri: toOriginalUri(context.document.uri),
          range: context.range,
        }
      )

    return result
  }
}

class SelectionRangeProvider implements vscode.SelectionRangeProvider {
  async provideSelectionRanges(
    document: vscode.TextDocument,
    positions: readonly vscode.Position[]
  ) {
    const result: vscode.SelectionRange[] = await tryCommand(
      'vscode.executeSelectionRangeProvider',
      toOriginalUri(document.uri),
      positions
    )

    return result
  }
}

class CodeLensProvider implements vscode.CodeLensProvider {
  async provideCodeLenses(document: vscode.TextDocument) {
    const result: vscode.CodeLens[] = await tryCommand(
      'vscode.executeCodeLensProvider',
      toOriginalUri(document.uri)
    )

    return result
  }
}

class TypeHierarchyProvider implements vscode.TypeHierarchyProvider {
  async prepareTypeHierarchy(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const result: vscode.TypeHierarchyItem[] = await tryCommand(
      'vscode.prepareTypeHierarchy',
      toOriginalUri(document.uri),
      position
    )

    return result
  }

  async provideTypeHierarchySupertypes(item: vscode.TypeHierarchyItem) {
    const result: vscode.TypeHierarchyItem[] =
      await vscode.commands.executeCommand('vscode.provideSupertypes', item)

    return result
  }

  async provideTypeHierarchySubtypes(item: vscode.TypeHierarchyItem) {
    const result: vscode.TypeHierarchyItem[] =
      await vscode.commands.executeCommand('vscode.provideSubtypes', item)

    return result
  }
}

class DocumentSemanticTokensProvider
  implements vscode.DocumentSemanticTokensProvider
{
  async provideDocumentSemanticTokens(document: vscode.TextDocument) {
    const result: vscode.SemanticTokens = await tryCommand(
      'vscode.provideDocumentSemanticTokens',
      toOriginalUri(document.uri)
    )

    return result
  }
}

export class GeneralLanguageFeatureRegister extends BaseRegister {
  protected doRegister() {
    this.context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        const document = editor?.document

        if (!document) {
          return
        }

        if (document.uri.scheme === config['schemeName']) {
          const hijackedLanguageId = config['hijackLanguageId'](
            document.languageId
          )

          hijackedLanguageId &&
            vscode.languages.setTextDocumentLanguage(
              document,
              hijackedLanguageId
            )
        }
      }),
      vscode.languages.registerDocumentHighlightProvider(
        this.documentSelector,
        new DocumentHighlightProvider()
      ),
      vscode.languages.registerDocumentLinkProvider(
        this.documentSelector,
        new DocumentLinkProvider()
      ),
      vscode.languages.registerDefinitionProvider(
        this.documentSelector,
        new DefinitionProvider()
      ),
      vscode.languages.registerTypeDefinitionProvider(
        this.documentSelector,
        new TypeDefinitionProvider()
      ),
      vscode.languages.registerDeclarationProvider(
        this.documentSelector,
        new DeclarationProvider()
      ),
      vscode.languages.registerImplementationProvider(
        this.documentSelector,
        new ImplementationProvider()
      ),
      vscode.languages.registerReferenceProvider(
        this.documentSelector,
        new ReferenceProvider()
      ),
      vscode.languages.registerHoverProvider(
        this.documentSelector,
        new HoverProvider()
      ),
      vscode.languages.registerInlayHintsProvider(
        this.documentSelector,
        new InlayHintsProvider()
      ),
      vscode.languages.registerDocumentSymbolProvider(
        this.documentSelector,
        new DocumentSymbolProvider()
      ),
      vscode.languages.registerColorProvider(
        this.documentSelector,
        new DocumentColorProvider()
      ),
      vscode.languages.registerSelectionRangeProvider(
        this.documentSelector,
        new SelectionRangeProvider()
      ),
      vscode.languages.registerCodeLensProvider(
        this.documentSelector,
        new CodeLensProvider()
      ),
      vscode.languages.registerTypeHierarchyProvider(
        this.documentSelector,
        new TypeHierarchyProvider()
      )
    )
  }
}

export class SpecificLanguageFeatureRegister extends BaseRegister {
  private static documentSemanticTokensProvider =
    new DocumentSemanticTokensProvider()
  private static registeredLanguageIdSet = new Set<string>()

  async register(uri: vscode.Uri) {
    const document = await vscode.workspace.openTextDocument(toOriginalUri(uri))

    if (
      SpecificLanguageFeatureRegister.registeredLanguageIdSet.has(
        document.languageId
      )
    ) {
      return
    }

    SpecificLanguageFeatureRegister.registeredLanguageIdSet.add(
      document.languageId
    )

    return this.doRegister(uri)
  }

  protected async doRegister(uri: vscode.Uri) {
    const document = await vscode.workspace.openTextDocument(uri)
    const legend: vscode.SemanticTokensLegend = await tryCommand(
      'vscode.provideDocumentSemanticTokensLegend',
      toOriginalUri(uri)
    )

    this.context.subscriptions.push(
      vscode.languages.registerDocumentSemanticTokensProvider(
        { ...this.documentSelector, language: document.languageId },
        SpecificLanguageFeatureRegister.documentSemanticTokensProvider,
        legend
      )
    )
  }
}
