import { computed, createSingletonComposable, defineConfigObject, executeCommand, ref, useWebviewView } from 'reactive-vscode'
import { workspace } from 'vscode'
import { commands, NestedScopedConfigs, scopedConfigs, type ConfigKeyTypeMap } from './generated/meta'

export const useFrontendContextWebview = createSingletonComposable(() => {
  const serverStatus = ref<'running' | 'stopped' | 'error'>('stopped')
  const errorMessage = ref<string>('')

  const config = defineConfigObject<NestedScopedConfigs>(
    scopedConfigs.scope,
    scopedConfigs.defaults,
  )

  const html = computed(() => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: var(--vscode-font-family);
          color: var(--vscode-foreground);
          background: var(--vscode-sideBar-background);
          margin: 0;
          padding: 0;
        }
        
        .container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .section {
          background: var(--vscode-sideBar-background);
        }
        
        .section-header {
          padding: 8px 12px;
          background: var(--vscode-sideBarSectionHeader-background);
          font-weight: 600;
          border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .section-content {
          padding: 12px;
        }
        
        .status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .status-card {
          padding: 8px;
          background: var(--vscode-input-background);
          border: 1px solid var(--vscode-input-border);
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .status-running {
          background: var(--vscode-charts-green);
        }
        
        .status-stopped {
          background: var(--vscode-charts-red);
        }
        
        .status-error {
          background: var(--vscode-charts-red);
        }
        
        .status-label {
          font-size: 11px;
          color: var(--vscode-descriptionForeground);
        }

        .port-input {
          background: var(--vscode-input-background);
          border: 1px solid var(--vscode-input-border);
          color: var(--vscode-textLink-foreground);
          padding: 2px 4px;
          width: 100%;
        }

        .divider {
          height: 1px;
          background: var(--vscode-panel-border);
          margin: 12px 0;
        }
        
        .button-group {
          display: flex;
          gap: 8px;
        }
        
        button {
          padding: 6px 12px;
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          border-radius: 2px;
          cursor: pointer;
        }
        
        button.secondary {
          background: var(--vscode-button-secondaryBackground);
          color: var(--vscode-button-secondaryForeground);
        }
        
        .error-message {
          margin-top: 12px;
          padding: 8px;
          background: var(--vscode-inputValidation-errorBackground);
          color: var(--vscode-inputValidation-errorForeground);
          border: 1px solid var(--vscode-inputValidation-errorBorder);
          border-radius: 4px;
          display: ${errorMessage.value ? 'block' : 'none'};
        }

        .code-block {
          background: var(--vscode-textBlockQuote-background);
        }

        .code-header {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          border-bottom: 1px solid var(--vscode-textBlockQuote-border);
        }

        .code-content {
          padding: 8px;
          font-family: var(--vscode-editor-font-family);
          white-space: pre-wrap;
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
      <div id="main-container" class="container">
        <div id="server-control-section" class="section">
          <div id="server-control-header" class="section-header">Server Control</div>
          <div id="server-control-content" class="section-content">
            <div class="status-grid">
              <div id="status-indicator-card" class="status-card">
                <div id="status-indicator" class="status-indicator ${
                  serverStatus.value === 'running' ? 'status-running' : 
                  serverStatus.value === 'error' ? 'status-error' : 'status-stopped'
                }"></div>
                <div>
                  <div class="status-label">Status</div>
                  <div id="server-status-text">${
                    serverStatus.value === 'running' ? 'Running' : 
                    serverStatus.value === 'error' ? 'Error' : 'Stopped'
                  }</div>
                </div>
              </div>
              <div id="port-config-card" class="status-card">
                <div style="display: flex; flex-direction: row; align-items: center; width: 100%;">
                  <div id="port-label" class="status-label" style="margin-right: 8px;">Port:</div>
                  <input 
                    type="number" 
                    id="port-card-input" 
                    class="port-input" 
                    value="${config.port || ''}" 
                    placeholder="3000"
                    min="1"
                    max="65535"
                    onblur="updatePort()"
                    onkeypress="handlePortKeyPress(event)"
                  />
                </div>
              </div>
            </div>
            ${errorMessage.value ? `<div id="error-message-container" class="error-message">${errorMessage.value}</div>` : ''}
            
            <div id="control-divider" class="divider"></div>
            
            <div id="server-button-group" class="button-group">
              ${serverStatus.value !== 'running' ? `
                <button id="start-server-btn" onclick="startServer()">Start Server</button>
              ` : `
                <button id="stop-server-btn" class="secondary" onclick="stopServer()">Stop Server</button>
              `}
            </div>
          </div>
        </div>

        <div id="integration-guide-section" class="section">
          <div id="integration-guide-header" class="section-header">Integration Guide</div>
          <div id="integration-guide-content" class="section-content" style="padding: 0">
            <div id="code-block-container" class="code-block">
              <div id="code-header" class="code-header">
                <span id="code-type-label">HTML</span>
                <div id="code-button-container">
                  <button id="auto-integrate-btn" onclick="autoIntegrate()">Auto Integration</button>
                  <button id="copy-code-btn" onclick="copyToClipboard()">Copy</button>
                </div>
              </div>
              <pre id="integration-code" class="code-content">&lt;!-- Insert this script before the &lt;/body&gt; tag --&gt;
&lt;script src="http://localhost:${config.port || '3000'}/inspector-toolbar.js"&gt;&lt;/script&gt;
&lt;inspector-toolbar ai-endpoint="http://localhost:${config.port || '3000'}"&gt;&lt;/inspector-toolbar&gt;</pre>
            </div>
          </div>
        </div>
      </div>

      <script>
        const vscode = acquireVsCodeApi();
        
        function startServer() {
          vscode.postMessage({ type: 'startServer' });
        }
        
        function stopServer() {
          vscode.postMessage({ type: 'stopServer' });
        }
        
        function updatePort() {
          const portInput = document.getElementById('port-card-input');
          const port = parseInt(portInput.value);
          
          if (!port || port < 1 || port > 65535) {
            portInput.style.borderColor = 'var(--vscode-inputValidation-errorBorder)';
            setTimeout(() => {
              portInput.style.borderColor = '';
            }, 2000);
            return;
          }
          
          vscode.postMessage({
            type: 'updatePort',
            port: port
          });
        }

        function handlePortKeyPress(event) {
          if (event.key === 'Enter') {
            event.target.blur();
          }
        }
        
        function copyToClipboard() {
          const codeContent = document.getElementById('integration-code').textContent;
          navigator.clipboard.writeText(codeContent).then(() => {
            const copyButton = document.getElementById('copy-code-btn');
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
              copyButton.textContent = 'Copy';
            }, 2000);
          });
        }

        function autoIntegrate() {
          vscode.postMessage({ type: 'autoIntegrate' });
          
          const autoButton = document.getElementById('auto-integrate-btn');
          autoButton.textContent = 'Processing...';
          setTimeout(() => {
            autoButton.textContent = 'Auto Integration';
          }, 2000);
        }
      </script>
    </body>
    </html>
  `)

  const { postMessage } = useWebviewView(
    'frontend-context-webview',
    html,
    {
      webviewOptions: {
        enableScripts: true,
        enableCommandUris: true,
      },
      async onDidReceiveMessage(ev) {
        if (ev.type === 'startServer') {
          try {
            await executeCommand(commands.startServer)
          } catch (error) {
            setError('Error starting server')
          }
        } else if (ev.type === 'stopServer') {
          try {
            await executeCommand(commands.stopServer)
          } catch (error) {
            setError('Error stopping server')
          }
        } else if (ev.type === 'updatePort') {
          // Update the port configuration
          config.port = ev.port
        } else if (ev.type === 'autoIntegrate') {
          try {
            await executeCommand(commands.autoIntegrate)
          } catch (error) {
            setError('Error auto integrating')
          }
        }
      },
    },
  )

  const refresh = () => {
    // Force reactivity update
    serverStatus.value = serverStatus.value
  }

  const setError = (message: string) => {
    serverStatus.value = 'error'
    errorMessage.value = message
  }

  const clearError = () => {
    errorMessage.value = ''
    if (serverStatus.value === 'error') {
      serverStatus.value = 'stopped'
    }
  }

  return {
    serverStatus,
    errorMessage,
    setError,
    clearError,
    refresh,
    postMessage
  }
}) 