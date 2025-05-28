import { defineExtension, onActivate, onDeactivate, useCommand, defineConfigs, defineConfigObject } from 'reactive-vscode'
import { window, ExtensionContext, env, Uri, workspace } from 'vscode'
import { startServer, stopServer } from './express-server'
import { createDiagnosticManager, disposeDiagnosticManager } from './diagnostic-manager'
import { CONFIG } from './config'
import { useFrontendContextWebview } from './webview'
import { commands, NestedScopedConfigs, scopedConfigs, type ConfigKeyTypeMap, name } from './generated/meta'

let serverInstance: { server: any; app: any; port: number } | null = null
let diagnosticCollectionInstance: any | null = null

const { activate, deactivate } = defineExtension((context: ExtensionContext) => {
  // Initialize webview
  const webview = useFrontendContextWebview()

  const config = defineConfigObject<NestedScopedConfigs>(
    scopedConfigs.scope,
    scopedConfigs.defaults,
  )
  
  // Register commands at the top level
  useCommand(commands.openDocs, () => {
    if (serverInstance?.port) {
      env.openExternal(Uri.parse(`http://localhost:${serverInstance.port}`));
    } else {
      window.showInformationMessage('Frontend Context server is not running.');
    }
  });

  
  useCommand(commands.startServer, async () => {
    try {
      if (serverInstance) {
        window.showInformationMessage('Server is already running.');
        return;
      }
      
      // Clear any previous errors
      webview.clearError()
      
      // Get configured port using typed config
      const configuredPort = config.port
      
      // Initialize diagnostic manager if not already done
      if (!diagnosticCollectionInstance) {
        diagnosticCollectionInstance = createDiagnosticManager()
      }
      
      // Start server with configured port
      serverInstance = await startServer(diagnosticCollectionInstance, configuredPort)
      
      // Update webview with server status
      if (serverInstance) {
        webview.serverStatus.value = 'running'
        window.showInformationMessage(`Frontend Context server started on port ${serverInstance.port}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // Update webview with error status
      webview.setError(errorMessage)
      
      // Show error message to user
      window.showErrorMessage(`Failed to start server: ${errorMessage}`)
      
      // Reset server instance
      serverInstance = null
    }
  });
  
  useCommand(commands.stopServer, async () => {
    try {
      if (!serverInstance) {
        window.showInformationMessage('Server is not running.');
        return;
      }
      
      await stopServer(serverInstance)
      serverInstance = null
      
      // Clear any errors and update webview status
      webview.clearError()
      webview.serverStatus.value = 'stopped'
      window.showInformationMessage('Frontend Context server stopped.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      window.showErrorMessage(`Failed to stop server: ${errorMessage}`)
    }
  });

  onActivate(async () => {
    try {
      // Initialize diagnostic manager
      diagnosticCollectionInstance = createDiagnosticManager()
      
    } catch (error) {
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
    
    } catch (error) {
      window.showErrorMessage(`${CONFIG.MESSAGES.DEACTIVATION_ERROR}: ${error}`)
    }
  })
})

export { activate, deactivate }