# Sequence Diagram - Frontend Context System Flow

This diagram shows the complete interaction flow between all system components from initialization to AI code generation.

```mermaid
sequenceDiagram
    participant User
    participant VSCode as "VSCode Extension"
    participant Server as "Express Server"
    participant Browser as "Frontend App"
    participant Toolbar as "Inspector Toolbar"
    participant AI as "Cursor AI"

    Note over User,AI: System Initialization
    User->>VSCode: Install & Activate Extension
    VSCode->>VSCode: Initialize Webview Panel
    VSCode->>VSCode: Register Commands
    
    Note over User,AI: Server Startup Flow
    User->>VSCode: Execute "Start Server"
    VSCode->>Server: startServer(port, diagnostics)
    Server->>Server: Check Port Availability
    Server->>Server: Configure Express Routes
    Server->>VSCode: Return Server Instance
    VSCode->>User: Show Success Message
    
    Note over User,AI: Auto Integration Flow
    User->>VSCode: Execute "Auto Integrate"
    VSCode->>AI: Send Integration Prompt
    AI->>Browser: Inject Inspector Script
    Browser->>Toolbar: Load Inspector Toolbar
    Toolbar->>Server: Connect to AI Endpoint
    
    Note over User,AI: Element Selection Flow
    User->>Toolbar: Click Inspect Button
    Toolbar->>Browser: Enter Inspection Mode
    User->>Browser: Hover/Click Elements
    Browser->>Toolbar: Element Selection Events
    Toolbar->>Toolbar: Generate Element Context
    
    Note over User,AI: AI Chat Flow
    User->>Toolbar: Submit Prompt
    Toolbar->>Server: POST /sendMessage
    Server->>VSCode: injectPromptWithCallback()
    VSCode->>AI: Execute Composer Command
    AI->>User: Generate Code Response
    
    Note over User,AI: Cleanup Flow
    User->>VSCode: Execute "Stop Server"
    VSCode->>Server: stopServer()
    Server->>Server: Close HTTP Server
    VSCode->>User: Show Stop Message
```

## Key Interactions

1. **System Initialization**: Extension activation and command registration
2. **Server Startup**: HTTP server creation with port checking and route setup
3. **Auto Integration**: AI-assisted script injection into frontend applications
4. **Element Selection**: Interactive DOM element inspection and context generation
5. **AI Communication**: Prompt submission through SSE and diagnostic injection
6. **Cleanup**: Proper resource disposal and server shutdown 