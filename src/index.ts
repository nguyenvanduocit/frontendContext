import type { ExtensionContext } from 'vscode'
import type { NestedScopedConfigs } from './generated/meta'
import { defineConfigObject, defineExtension, onActivate, onDeactivate, useCommand } from 'reactive-vscode'
import { env, Uri, window } from 'vscode'
import { sendToAgent } from './agent'
import { CONFIG } from './config'
import { createDiagnosticManager, disposeDiagnosticManager } from './diagnostic-manager'
import { startServer, stopServer } from './express-server'
import { commands, scopedConfigs } from './generated/meta'
import { useFrontendContextWebview } from './webview'

let serverInstance: { server: any, app: any, port: number } | null = null
let diagnosticCollectionInstance: any | null = null

// Helper function to ensure diagnostic manager exists
function ensureDiagnosticManager(): any {
  if (!diagnosticCollectionInstance) {
    diagnosticCollectionInstance = createDiagnosticManager()
  }
  return diagnosticCollectionInstance
}

const { activate, deactivate } = defineExtension((_context: ExtensionContext) => {
  // Initialize webview
  const webview = useFrontendContextWebview()

  const config = defineConfigObject<NestedScopedConfigs>(
    scopedConfigs.scope,
    scopedConfigs.defaults,
  )

  // Register commands at the top level
  useCommand(commands.openDocs, () => {
    if (serverInstance?.port) {
      env.openExternal(Uri.parse(`http://localhost:${serverInstance.port}`))
    }
    else {
      window.showInformationMessage('Frontend Context server is not running.')
    }
  })

  useCommand(commands.autoIntegrate, async () => {
    const integrationPropmpt = `I need to integrate the inspector-toolbar into my project. This code should be inserted into the index.html file or somewhere that will be rendered to browser. find the correct place to insert the code. and ensure that if project have production build process, ensure that the code only available in development mode. if use vite ensure that Cannot use 'import.meta' is not be used outside of a module.
<script src="http://localhost:${config.port}/inspector-toolbar.js?autoInject"></script>`
    await sendToAgent(integrationPropmpt)
  })

  useCommand(commands.startServer, async () => {
    try {
      if (serverInstance) {
        window.showInformationMessage('Server is already running.')
        return
      }

      // Clear any previous errors
      webview.clearError()

      // Get configured port using typed config
      const configuredPort = config.port

      // Ensure diagnostic manager exists
      const diagnosticManager = ensureDiagnosticManager()

      // Start server with configured port
      serverInstance = await startServer(diagnosticManager, configuredPort)

      // Update webview with server status
      if (serverInstance) {
        webview.serverStatus.value = 'running'
        window.showInformationMessage(`Frontend Context server started on port ${serverInstance.port}`)
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      // Update webview with error status
      webview.setError(errorMessage)

      // Show error message to user
      window.showErrorMessage(`Failed to start server: ${errorMessage}`)

      // Reset server instance
      serverInstance = null
    }
  })

  useCommand(commands.stopServer, async () => {
    try {
      if (!serverInstance) {
        window.showInformationMessage('Server is not running.')
        return
      }

      await stopServer(serverInstance)
      serverInstance = null

      // Dispose diagnostic manager when server stops
      if (diagnosticCollectionInstance) {
        disposeDiagnosticManager(diagnosticCollectionInstance)
        diagnosticCollectionInstance = null
      }

      // Clear any errors and update webview status
      webview.clearError()
      webview.serverStatus.value = 'stopped'
      window.showInformationMessage('Frontend Context server stopped.')
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      window.showErrorMessage(`Failed to stop server: ${errorMessage}`)
    }
  })

  onActivate(async () => {
    try {
      // Diagnostic manager will be initialized when needed (lazy initialization)
      // No need to create it here to avoid duplicate initialization

    }
    catch (error) {
      window.showErrorMessage(`${CONFIG.MESSAGES.ACTIVATION_ERROR}: ${error}`)
    }
  })

  onDeactivate(async () => {
    try {
      // Update webview status
      webview.serverStatus.value = 'stopped'

      // Cleanup resources
      if (diagnosticCollectionInstance) {
        disposeDiagnosticManager(diagnosticCollectionInstance)
      }

      if (serverInstance) {
        await stopServer(serverInstance)
      }
    }
    catch (error) {
      window.showErrorMessage(`${CONFIG.MESSAGES.DEACTIVATION_ERROR}: ${error}`)
    }
  })
})

export { activate, deactivate }
