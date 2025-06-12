# Flowchart Diagram - System Process Flow

This diagram illustrates the decision points and process flow throughout the Frontend Context system.

```mermaid
flowchart TD
    A[VSCode Extension Activation] --> B[Initialize Webview Panel]
    B --> C[Register Commands]
    C --> D[Create Diagnostic Manager]
    
    D --> E{User Action}
    
    E -->|Start Server| F[Check Port Availability]
    F --> G[Configure Express Server]
    G --> H[Setup Routes & Middleware]
    H --> I[Start HTTP Server]
    I --> J[Update Webview Status]
    
    E -->|Auto Integrate| K[Generate Integration Script]
    K --> L[Send to Cursor AI]
    L --> M[AI Injects Script to Frontend]
    
    E -->|Stop Server| N[Close HTTP Server]
    N --> O[Cleanup Resources]
    O --> P[Update Webview Status]
    
    Q[Frontend Application] --> R[Load Inspector Toolbar]
    R --> S[Connect to Server Endpoint]
    S --> T{Inspection Mode}
    
    T -->|Active| U[Listen for Element Events]
    U --> V[Highlight Elements on Hover]
    V --> W[Select Elements on Click]
    W --> X[Generate Element Context]
    
    T -->|Submit Prompt| Y[Collect Selected Elements]
    Y --> Z[Format Context Data]
    Z --> AA[Send to Server via SSE]
    AA --> BB[Inject Diagnostic Prompt]
    BB --> CC[Execute Cursor Command]
    CC --> DD[AI Generates Code]
    
    style A fill:#e1f5fe
    style Q fill:#f3e5f5
    style DD fill:#e8f5e8
```

## Process Flow Description

### Extension Initialization
- **Activation**: VSCode starts the extension
- **Setup**: Initialize webview, register commands, create diagnostic manager
- **Ready State**: Extension ready for user commands

### Server Management
- **Start Server**: Check port availability, configure Express, start HTTP server
- **Auto Integration**: Generate and inject inspector script via AI
- **Stop Server**: Clean shutdown and resource cleanup

### Frontend Integration
- **Toolbar Loading**: Inspector toolbar connects to server endpoint
- **Inspection Mode**: Listen for DOM events, highlight and select elements
- **Context Generation**: Build comprehensive element information

### AI Communication
- **Prompt Submission**: Collect selected elements and format context
- **Server Communication**: Send data via Server-Sent Events
- **AI Integration**: Inject diagnostic prompt and execute Cursor commands 