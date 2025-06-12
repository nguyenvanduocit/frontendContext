# Frontend Context - System Documentation

This directory contains comprehensive system documentation and architectural diagrams for the Frontend Context VSCode extension.

## Overview

Frontend Context is a VSCode extension that revolutionizes frontend development by enabling direct UI element selection from browsers for AI-powered code generation. The system bridges the gap between visual frontend elements and AI-assisted development.

## Architecture Documentation

### 📊 System Diagrams

1. **[Sequence Diagram](./sequence-diagram.md)** - Complete interaction flow between all system components
2. **[Flowchart Diagram](./flowchart-diagram.md)** - Decision points and process flow throughout the system
3. **[State Diagram](./state-diagram.md)** - System states and transitions during operation
4. **[Architecture Diagram](./architecture-diagram.md)** - Overall system architecture and component relationships
5. **[Call Stack Diagram](./call-stack-diagram.md)** - Function call hierarchy from user interaction to AI response
6. **[Stage Diagram](./stage-diagram.md)** - Execution stages from initialization to code generation

### 🏗️ System Architecture

The Frontend Context system consists of five main layers:

- **VSCode Extension Layer**: Core extension functionality and lifecycle management
- **Server Layer**: HTTP server for frontend communication via Express.js
- **Frontend Integration Layer**: Inspector toolbar and DOM interaction capabilities
- **AI Integration Layer**: Cursor AI command execution and diagnostic injection
- **Generated Metadata**: Auto-generated command and configuration definitions

### 🔄 Key Workflows

#### 1. System Initialization
```
Extension Activation → Webview Setup → Command Registration → Diagnostic Manager → Ready State
```

#### 2. Server Lifecycle
```
Start Command → Port Check → Express Setup → Route Configuration → Server Running
```

#### 3. Frontend Integration
```
Auto Integrate → Script Generation → AI Injection → Toolbar Loading → Server Connection
```

#### 4. Element Inspection
```
Inspection Mode → Event Listeners → Element Selection → Context Generation → Visual Feedback
```

#### 5. AI Communication
```
Prompt Submission → Context Collection → SSE Communication → Diagnostic Injection → Code Generation
```

### 🛠️ Technical Stack

- **Backend**: Node.js, Express.js, Server-Sent Events
- **Frontend**: Custom Web Components, DOM APIs, CSS Animations
- **VSCode Integration**: reactive-vscode, VSCode Extension API
- **AI Integration**: Cursor AI, Diagnostic API, Clipboard API
- **Build Tools**: TypeScript, tsdown, vscode-ext-gen

### 🎯 Framework Support

| Framework | Element Detection | Component Info | File Path | Properties | Structure |
|-----------|-------------------|----------------|-----------|------------|-----------|
| Vue       | ✅                | ✅             | ✅        | ✅         | ✅        |
| React     | ✅                | ❌             | ❌        | ✅         | ✅        |
| Angular   | ✅                | ❌             | ❌        | ✅         | ✅        |
| Svelte    | ✅                | ❌             | ❌        | ✅         | ✅        |
| Vanilla   | ✅                | ❌             | ❌        | ✅         | ✅        |

### 📋 Available Commands

- `frontend-context.startServer` - Start the HTTP server for frontend communication
- `frontend-context.stopServer` - Stop the running server and cleanup resources
- `frontend-context.autoIntegrate` - AI-assisted script injection into frontend apps
- `frontend-context.startChat` - Initialize chat interface with AI
- `frontend-context.openDocs` - Open documentation in browser

### ⚙️ Configuration

- **Port Configuration**: Configurable server port (default: 7318)
- **Auto-injection**: Automatic script injection with `?autoInject` parameter
- **Framework Detection**: Automatic detection of frontend frameworks
- **Error Handling**: Comprehensive error recovery and cleanup mechanisms

### 🔍 Key Features

1. **Real-time Element Inspection**: Interactive DOM element selection with visual feedback
2. **Framework-Aware Context**: Intelligent extraction of component information
3. **AI-Powered Integration**: Seamless integration with Cursor AI for code generation
4. **Cross-Origin Support**: CORS-enabled communication between extension and frontend
5. **Diagnostic Injection**: Creative use of VSCode diagnostics for AI context provision

### 🚀 Getting Started

1. Install the extension from VSCode Marketplace
2. Open the Frontend Context panel from the activity bar
3. Start the server using the "Start Server" command
4. Use "Auto Integrate" to inject the inspector into your frontend app
5. Begin selecting elements and chatting with AI for code generation

### 📝 Development Notes

- Uses reactive-vscode framework for modern VSCode extension development
- Implements Server-Sent Events for real-time communication
- Custom web components provide framework-agnostic frontend integration
- Diagnostic API creatively used to provide context to AI systems
- Comprehensive error handling and resource cleanup throughout all layers

For detailed technical information, refer to the individual diagram documentation files linked above. 