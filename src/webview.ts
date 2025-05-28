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
        
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          14% {
            background-position: 23% 77%;
          }
          27% {
            background-position: 52% 68%;
          }
          41% {
            background-position: 79% 42%;
          }
          56% {
            background-position: 95% 21%;
          }
          73% {
            background-position: 62% 30%;
          }
          88% {
            background-position: 31% 47%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes glowingAura {
          0% {
            box-shadow: 0 0 10px 5px rgba(255, 107, 107, 0.4), 0 0 20px 10px rgba(255, 150, 113, 0.2), 0 0 0 2px rgba(255, 255, 255, 0.1);
          }
          13% {
            box-shadow: 0 0 18px 12px rgba(249, 212, 35, 0.5), 0 0 28px 15px rgba(254, 202, 87, 0.3), 0 0 0 3px rgba(255, 255, 255, 0.16);
          }
          27% {
            box-shadow: 0 0 15px 8px rgba(255, 159, 243, 0.6), 0 0 24px 11px rgba(255, 140, 66, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.12);
          }
          42% {
            box-shadow: 0 0 22px 14px rgba(255, 200, 87, 0.55), 0 0 30px 16px rgba(255, 107, 107, 0.28), 0 0 0 4px rgba(255, 255, 255, 0.18);
          }
          58% {
            box-shadow: 0 0 12px 7px rgba(255, 166, 107, 0.45), 0 0 19px 9px rgba(255, 126, 103, 0.25), 0 0 0 2px rgba(255, 255, 255, 0.11);
          }
          73% {
            box-shadow: 0 0 20px 13px rgba(249, 212, 35, 0.62), 0 0 26px 14px rgba(255, 150, 113, 0.42), 0 0 0 3px rgba(255, 255, 255, 0.22);
          }
          87% {
            box-shadow: 0 0 16px 9px rgba(255, 107, 107, 0.53), 0 0 22px 13px rgba(254, 202, 87, 0.32), 0 0 0 2px rgba(255, 255, 255, 0.14);
          }
          100% {
            box-shadow: 0 0 10px 5px rgba(255, 107, 107, 0.4), 0 0 20px 10px rgba(255, 150, 113, 0.2), 0 0 0 2px rgba(255, 255, 255, 0.1);
          }
        }
        
        @keyframes rotateMist {
          0% {
            transform: rotate(0deg) scale(1);
          }
          17% {
            transform: rotate(83deg) scale(1.15) translateX(3px);
          }
          31% {
            transform: rotate(127deg) scale(0.95) translateY(-4px);
          }
          48% {
            transform: rotate(195deg) scale(1.12) translateX(-2px) translateY(3px);
          }
          63% {
            transform: rotate(246deg) scale(1.05) translateY(5px);
          }
          79% {
            transform: rotate(301deg) scale(0.97) translateX(4px) translateY(-2px);
          }
          91% {
            transform: rotate(342deg) scale(1.08) translateY(-3px);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }
        
        .container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: 100vh;
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
        
        button.danger {
          background: var(--vscode-errorForeground);
          color: var(--vscode-button-foreground);
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

        .code-content {
          padding: 10px;
          margin: 0;
          font-family: var(--vscode-editor-font-family);
          white-space: pre-wrap;
          overflow-x: auto;
        }
        
        .donate-button {
          display: block;
          text-align: center;
          padding: 12px 24px;
          background: linear-gradient(135deg, #FF6B6B, #FF9671, #FFA75F, #F9D423, #FECA57, #FF7E67, #FF8C42, #FFC857);
          background-size: 400% 400%;
          animation: gradientShift 7.3s ease-in-out infinite, glowingAura 9.7s infinite cubic-bezier(0.42, 0, 0.58, 1);
          color: white;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          box-shadow: 0 0 10px 5px rgba(255, 107, 107, 0.4), 0 0 20px 10px rgba(255, 150, 113, 0.2);
          margin: 8px auto;
          max-width: 240px;
          transition: all 0.2s ease;
          transform: translateY(0);
          font-size: 14px;
          position: relative;
          overflow: hidden;
          border: none;
          z-index: 1;
        }
        
        .donate-button::before {
          content: '';
          position: absolute;
          inset: -5px;
          border-radius: 8px;
          background: radial-gradient(circle, rgba(255, 107, 107, 0.3) 0%, rgba(255, 140, 66, 0.2) 50%, rgba(249, 212, 35, 0.1) 70%, transparent 100%);
          filter: blur(8px);
          opacity: 0.7;
          z-index: -1;
          animation: rotateMist 13.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
          transition: all 0.5s ease;
        }
        
        .donate-button:hover {
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 0 15px 8px rgba(255, 107, 107, 0.5), 0 0 25px 12px rgba(255, 150, 113, 0.3);
        }

        .donate-button:hover::before {
          inset: -10px;
          filter: blur(12px);
          opacity: 0.9;
        }
        
        .donate-text {
          margin-top: 0px;
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .spacer {
          flex: 1;
          min-height: 20px;
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
                <button id="stop-server-btn" class="danger" onclick="stopServer()">Stop Server</button>
              `}
            </div>
          </div>
        </div>

        <div id="integration-guide-section" class="section">
          <div id="integration-guide-header" class="section-header">Integration Guide</div>
          <div id="integration-guide-content" class="section-content">
            <div class="code-block">
              <pre id="integration-code" class="code-content">&lt;script src="http://localhost:${config.port || '3000'}/inspector-toolbar.js?autoInject"&gt;&lt;/script&gt;</pre>
            </div>
            <div class="button-group" style="margin-top: 8px;">
              <button id="auto-integrate-btn" onclick="autoIntegrate()">Auto Integration</button>
              <button id="copy-code-btn" class="secondary" onclick="copyToClipboard()">Copy Code</button>
            </div>
          </div>
        </div>

        <div class="spacer"></div>
        
        <div id="donate-section" class="section">
          <div id="donate-header" class="section-header">Support the Project</div>
          <div id="donate-content" class="section-content">
            <p class="donate-text">If you find this extension helpful, please consider supporting the development with a donation. Your contribution helps maintain and improve this tool.</p>
            <a href="#" target="_blank" class="donate-button" onclick="openDonateLink(event)">
              <span style="display: inline-block; margin-right: 8px;">💙</span> Support via PayPal
            </a>
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
              copyButton.textContent = 'Copy Code';
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
        
        function openDonateLink(event) {
          event.preventDefault();
          vscode.postMessage({ 
            type: 'openExternalLink',
            url: 'https://paypal.me/duocnguyen'
          });
        }
      </script>
    </body>
    </html>
  `)

  const { postMessage } = useWebviewView(
    'frontend-context-webview',
    html,
    {
      retainContextWhenHidden: true,
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
        } else if (ev.type === 'openExternalLink') {
          // Open external link in browser
          const { url } = ev
          try {
            await executeCommand('vscode.open', url)
          } catch (error) {
            setError('Error opening external link')
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