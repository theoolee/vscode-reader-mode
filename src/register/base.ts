import vscode from 'vscode'
import { config } from '../config'

export abstract class BaseRegister {
  private isRegistered = false
  protected documentSelector = {
    scheme: config['schemeName'],
  }

  constructor(protected readonly context: vscode.ExtensionContext) {}

  register(...args: any[]): void | Promise<void> {
    if (this.isRegistered) {
      return
    }

    this.isRegistered = true
    return this.doRegister()
  }

  protected abstract doRegister(...args: any[]): void | Promise<void>
}
