import vscode from 'vscode'
import {
  propagateReaderMode,
  propagateReaderModeOnLocationResult,
  tryCommand,
} from '../util/language'
import { toFileUri } from '../util/uri'
import { BaseRegister } from './base'

class DocumentHighlightProvider implements vscode.DocumentHighlightProvider {
  async provideDocumentHighlights(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const result: vscode.DocumentHighlight[] = await tryCommand(
      'vscode.executeDocumentHighlights',
      toFileUri(document.uri),
      position
    )

    return result
  }
}

class DocumentLinkProvider implements vscode.DocumentLinkProvider {
  async provideDocumentLinks(document: vscode.TextDocument) {
    const result: vscode.DocumentLink[] = await tryCommand(
      'vscode.executeLinkProvider',
      toFileUri(document.uri)
    )

    result.forEach((item) => {
      if (item.target?.scheme === 'file') {
        item.target = propagateReaderMode(document.uri, item.target)
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
      toFileUri(document.uri),
      position
    )

    return propagateReaderModeOnLocationResult(document.uri, result)
  }
}

class TypeDefinitionProvider implements vscode.TypeDefinitionProvider {
  async provideTypeDefinition(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const result: vscode.Location[] | vscode.LocationLink[] = await tryCommand(
      'vscode.executeTypeDefinitionProvider',
      toFileUri(document.uri),
      position
    )

    return propagateReaderModeOnLocationResult(document.uri, result)
  }
}

class DeclarationProvider implements vscode.DeclarationProvider {
  async provideDeclaration(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const result: vscode.Location[] | vscode.LocationLink[] = await tryCommand(
      'vscode.executeDeclarationProvider',
      toFileUri(document.uri),
      position
    )

    return propagateReaderModeOnLocationResult(document.uri, result)
  }
}

class ImplementationProvider implements vscode.ImplementationProvider {
  async provideImplementation(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const result: vscode.Location[] | vscode.LocationLink[] = await tryCommand(
      'vscode.executeImplementationProvider',
      toFileUri(document.uri),
      position
    )

    return propagateReaderModeOnLocationResult(document.uri, result)
  }
}

class ReferenceProvider implements vscode.ReferenceProvider {
  async provideReferences(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    const result: vscode.Location[] = await tryCommand(
      'vscode.executeReferenceProvider',
      toFileUri(document.uri),
      position
    )

    return propagateReaderModeOnLocationResult(document.uri, result)
  }
}

class HoverProvider implements vscode.HoverProvider {
  async provideHover(document: vscode.TextDocument, position: vscode.Position) {
    const result: vscode.Hover[] = await tryCommand(
      'vscode.executeHoverProvider',
      toFileUri(document.uri),
      position
    )

    return result[0]
  }
}

class InlayHintsProvider implements vscode.InlayHintsProvider {
  async provideInlayHints(document: vscode.TextDocument, range: vscode.Range) {
    const result: vscode.InlayHint[] = await tryCommand(
      'vscode.executeInlayHintProvider',
      toFileUri(document.uri),
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
        toFileUri(document.uri)
      )

    return result
  }
}

class DocumentColorProvider implements vscode.DocumentColorProvider {
  async provideDocumentColors(document: vscode.TextDocument) {
    const result: vscode.ColorInformation[] = await tryCommand(
      'vscode.executeDocumentColorProvider',
      toFileUri(document.uri)
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
    await vscode.workspace.openTextDocument(toFileUri(context.document.uri))
    const result: vscode.ColorPresentation[] =
      await vscode.commands.executeCommand(
        'vscode.provideColorPresentations',
        color,
        {
          uri: toFileUri(context.document.uri),
          range: context.range,
        }
      )

    return result
  }
}

class DocumentSemanticTokensProvider
  implements vscode.DocumentSemanticTokensProvider
{
  async provideDocumentSemanticTokens(document: vscode.TextDocument) {
    const result: vscode.SemanticTokens = await tryCommand(
      'vscode.provideDocumentSemanticTokens',
      toFileUri(document.uri)
    )

    return result
  }
}

export class GeneralLanguageFeatureRegister extends BaseRegister {
  protected doRegister() {
    this.context.subscriptions.push(
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
      )
    )
  }
}

export class SpecifiedLanguageFeatureRegister extends BaseRegister {
  private static documentSemanticTokensProvider =
    new DocumentSemanticTokensProvider()
  private static registeredLanguageIdSet = new Set<string>()

  async register(uri: vscode.Uri) {
    const document = await vscode.workspace.openTextDocument(uri)

    if (
      SpecifiedLanguageFeatureRegister.registeredLanguageIdSet.has(
        document.languageId
      )
    ) {
      return
    }

    SpecifiedLanguageFeatureRegister.registeredLanguageIdSet.add(
      document.languageId
    )

    return this.doRegister(uri)
  }

  protected async doRegister(uri: vscode.Uri) {
    const document = await vscode.workspace.openTextDocument(uri)
    const legend: vscode.SemanticTokensLegend = await tryCommand(
      'vscode.provideDocumentSemanticTokensLegend',
      toFileUri(uri)
    )

    this.context.subscriptions.push(
      vscode.languages.registerDocumentSemanticTokensProvider(
        { ...this.documentSelector, language: document.languageId },
        SpecifiedLanguageFeatureRegister.documentSemanticTokensProvider,
        legend
      )
    )
  }
}
