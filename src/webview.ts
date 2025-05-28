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
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: var(--vscode-font-family);
          font-size: var(--vscode-font-size);
          font-weight: var(--vscode-font-weight);
          color: var(--vscode-foreground);
          background: var(--vscode-sideBar-background);
          margin: 0;
          line-height: 1.4;
          overflow-x: hidden;
        }
        
        .container {
          max-width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .section {
          background: var(--vscode-sideBar-background);
          border: 1px solid var(--vscode-panel-border);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .section-header {
          padding: 12px 16px;
          background: var(--vscode-sideBarSectionHeader-background);
          color: var(--vscode-sideBarSectionHeader-foreground);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--vscode-panel-border);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .section-content {
          padding: 16px;
        }
        
        .status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .status-card {
          padding: 12px;
          background: var(--vscode-input-background);
          border: 1px solid var(--vscode-input-border);
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: border-color 0.2s ease;
        }
        
        .status-card:hover {
          border-color: var(--vscode-inputOption-activeBorder);
        }
        
        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        
        .status-running {
          background: var(--vscode-charts-green);
          box-shadow: 0 0 0 2px rgba(0, 255, 0, 0.2);
        }
        
        .status-stopped {
          background: var(--vscode-charts-red);
        }
        
        .status-text {
          font-size: 13px;
          color: var(--vscode-foreground);
        }
        
        .status-label {
          font-size: 11px;
          color: var(--vscode-descriptionForeground);
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 2px;
        }
        
        .port-value {
          font-family: var(--vscode-editor-font-family);
          font-size: 13px;
          color: var(--vscode-textLink-foreground);
          font-weight: 500;
        }
        
        .button-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .vscode-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 14px;
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: 1px solid transparent;
          border-radius: 2px;
          cursor: pointer;
          font-size: 13px;
          font-family: var(--vscode-font-family);
          font-weight: 400;
          text-align: center;
          transition: all 0.1s ease;
          outline: none;
          min-height: 28px;
        }
        
        .vscode-button:hover:not(:disabled) {
          background: var(--vscode-button-hoverBackground);
        }
        
        .vscode-button:focus {
          outline: 1px solid var(--vscode-focusBorder);
          outline-offset: 2px;
        }
        
        .vscode-button:active:not(:disabled) {
          background: var(--vscode-button-background);
          transform: translateY(0.5px);
        }
        
        .vscode-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .vscode-button.secondary {
          background: var(--vscode-button-secondaryBackground);
          color: var(--vscode-button-secondaryForeground);
        }
        
        .vscode-button.secondary:hover:not(:disabled) {
          background: var(--vscode-button-secondaryHoverBackground);
        }
        
        .icon {
          font-size: 14px;
          line-height: 1;
        }
        
        .divider {
          height: 1px;
          background: var(--vscode-panel-border);
          margin: 16px 0;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }
        
        .form-label {
          font-size: 11px;
          color: var(--vscode-descriptionForeground);
          text-transform: uppercase;
          letter-spacing: 0.3px;
          font-weight: 600;
        }
        
        .vscode-input {
          padding: 6px 8px;
          background: var(--vscode-input-background);
          color: var(--vscode-input-foreground);
          border: 1px solid var(--vscode-input-border);
          border-radius: 2px;
          font-size: 13px;
          font-family: var(--vscode-editor-font-family);
          outline: none;
          transition: border-color 0.2s ease;
        }
        
        .vscode-input:focus {
          border-color: var(--vscode-inputOption-activeBorder);
          outline: 1px solid var(--vscode-focusBorder);
          outline-offset: -1px;
        }
        
        .vscode-input:invalid {
          border-color: var(--vscode-inputValidation-errorBorder);
        }
        
        .input-group {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }
        
        .input-group .vscode-input {
          flex: 1;
        }
        
        .input-group .vscode-button {
          min-width: 80px;
        }
        
        @media (max-width: 300px) {
          .status-grid {
            grid-template-columns: 1fr;
          }
          
          body {
            padding: 12px;
          }
          
          .container {
            gap: 12px;
          }
          
          .input-group {
            flex-direction: column;
            align-items: stretch;
          }
        }

        .integration-description {
          margin: 0 0 16px 0;
          font-size: 13px;
          color: var(--vscode-descriptionForeground);
          line-height: 1.5;
        }

        .integration-description code {
          background: var(--vscode-textBlockQuote-background);
          padding: 2px 4px;
          border-radius: 2px;
          font-family: var(--vscode-editor-font-family);
          font-size: 12px;
        }

        .code-block {
          background: var(--vscode-textBlockQuote-background);
          border: 1px solid var(--vscode-textBlockQuote-border);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: var(--vscode-editor-background);
          border-bottom: 1px solid var(--vscode-textBlockQuote-border);
        }

        .code-title {
          font-size: 11px;
          font-weight: 600;
          color: var(--vscode-descriptionForeground);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .copy-button {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: var(--vscode-button-secondaryBackground);
          color: var(--vscode-button-secondaryForeground);
          border: none;
          border-radius: 2px;
          cursor: pointer;
          font-size: 11px;
          font-family: var(--vscode-font-family);
          transition: background-color 0.2s ease;
        }

        .copy-button:hover {
          background: var(--vscode-button-secondaryHoverBackground);
        }

        .code-content {
          margin: 0;
          padding: 12px;
          font-family: var(--vscode-editor-font-family);
          font-size: 12px;
          line-height: 1.4;
          color: var(--vscode-editor-foreground);
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .code-content code {
          font-family: inherit;
          font-size: inherit;
          color: inherit;
          background: none;
          padding: 0;
        }

        .integration-notes {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .note-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 12px;
          color: var(--vscode-descriptionForeground);
        }

        .note-icon {
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .note-text {
          line-height: 1.4;
        }

        .status-error {
          background: var(--vscode-charts-red);
        }
        
        .error-message {
          margin-top: 12px;
          padding: 8px 12px;
          background: var(--vscode-inputValidation-errorBackground);
          color: var(--vscode-inputValidation-errorForeground);
          border: 1px solid var(--vscode-inputValidation-errorBorder);
          border-radius: 4px;
          font-size: 12px;
          line-height: 1.4;
          display: ${errorMessage.value ? 'block' : 'none'};
        }

        .port-input {
          background: transparent;
          border: none;
          color: var(--vscode-textLink-foreground);
          font-family: var(--vscode-editor-font-family);
          font-size: 13px;
          font-weight: 500;
          width: 60px;
          padding: 2px 4px;
          border-radius: 2px;
          outline: none;
          transition: all 0.2s ease;
        }

        .port-input:hover {
          background: var(--vscode-input-background);
          border: 1px solid var(--vscode-input-border);
        }

        .port-input:focus {
          background: var(--vscode-input-background);
          border: 1px solid var(--vscode-inputOption-activeBorder);
          outline: 1px solid var(--vscode-focusBorder);
          outline-offset: -1px;
        }

        .port-input:invalid {
          border-color: var(--vscode-inputValidation-errorBorder);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="section">
          <div class="section-header">
            <span class="icon">📊</span>
            Server Status
          </div>
          <div class="section-content">
            <div class="status-grid">
              <div class="status-card">
                <div class="status-indicator ${
                  serverStatus.value === 'running' ? 'status-running' : 
                  serverStatus.value === 'error' ? 'status-error' : 'status-stopped'
                }"></div>
                <div>
                  <div class="status-label">Status</div>
                  <div class="status-text">${
                    serverStatus.value === 'running' ? 'Running' : 
                    serverStatus.value === 'error' ? 'Error' : 'Stopped'
                  }</div>
                </div>
              </div>
              <div class="status-card">
                <div class="icon">🔌</div>
                <div>
                  <div class="status-label">Port</div>
                  <div class="port-value">
                    <input 
                      type="number" 
                      id="port-card-input" 
                      class="port-input" 
                      value="${config.port || ''}" 
                      placeholder="3000"
                      min="1"
                      max="65535"
                      onblur="updatePortFromCard()"
                      onkeypress="handlePortKeyPress(event)"
                    />
                  </div>
                </div>
              </div>
            </div>
            ${errorMessage.value ? `<div class="error-message">${errorMessage.value}</div>` : ''}
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <span class="icon">🎮</span>
            Controls
          </div>
          <div class="section-content">
            <div class="button-group">
              <button class="vscode-button" onclick="startServer()" ${serverStatus.value === 'running' ? 'disabled' : ''}>
                <span class="icon">▶️</span>
                Start Server
              </button>
              <button class="vscode-button secondary" onclick="stopServer()" ${serverStatus.value !== 'running' ? 'disabled' : ''}>
                <span class="icon">⏹️</span>
                Stop Server
              </button>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <span class="icon">📋</span>
            Integration Guide
          </div>
          <div class="section-content">
            <p class="integration-description">
              Hãy chèn đoạn code sau đây vào file <code>index.html</code> của bạn:
            </p>
            <div class="code-block">
              <div class="code-header">
                <span class="code-title">HTML</span>
                <button class="copy-button" onclick="copyToClipboard()">
                  <span class="icon">📋</span>
                  Copy
                </button>
              </div>
              <pre class="code-content"><code>&lt;!-- Chèn script này vào trước thẻ &lt;/body&gt; --&gt;
&lt;script src="http://localhost:${config.port || '3000'}/inspector-toolbar.js"&gt;&lt;/script&gt;

&lt;!-- Chèn custom element này vào bất kỳ đâu trong &lt;body&gt; --&gt;
&lt;inspector-toolbar ai-endpoint="http://localhost:${config.port || '3000'}/sendMessage"&gt;&lt;/inspector-toolbar&gt;</code></pre>
            </div>
            <div class="integration-notes">
              <div class="note-item">
                <span class="note-icon">💡</span>
                <span class="note-text">Script sẽ tự động tải khi server đang chạy</span>
              </div>
              <div class="note-item">
                <span class="note-icon">🎯</span>
                <span class="note-text">Inspector toolbar sẽ xuất hiện ở góc dưới bên phải trang web</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <script>
        const vscode = acquireVsCodeApi();
        
        function startServer() {
          vscode.postMessage({
            type: 'startServer'
          });
        }
        
        function stopServer() {
          vscode.postMessage({
            type: 'stopServer'
          });
        }
        
        function updatePortFromCard() {
          const portInput = document.getElementById('port-card-input');
          const port = parseInt(portInput.value);
          
          if (!port || port < 1 || port > 65535) {
            // Show error feedback
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
            event.target.blur(); // This will trigger onblur -> updatePortFromCard
          }
        }
        
        function copyToClipboard() {
          const codeContent = document.querySelector('.code-content code').textContent;
          navigator.clipboard.writeText(codeContent).then(() => {
            const copyButton = document.querySelector('.copy-button');
            const originalText = copyButton.innerHTML;
            copyButton.innerHTML = '<span class="icon">✅</span>Copied!';
            setTimeout(() => {
              copyButton.innerHTML = originalText;
            }, 2000);
          }).catch(err => {
            console.error('Failed to copy: ', err);
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
      webviewOptions: {
        enableScripts: true,
        enableCommandUris: true,
      },
      onDidReceiveMessage(ev) {
        if (ev.type === 'startServer') {
          executeCommand(commands.startServer)
        } else if (ev.type === 'stopServer') {
          executeCommand(commands.stopServer)
        } else if (ev.type === 'updatePort') {
          // Update the port configuration
          config.port = ev.port
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