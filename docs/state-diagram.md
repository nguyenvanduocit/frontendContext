# State Diagram - System State Management

This diagram shows the various states of the Frontend Context system and the transitions between them.

```mermaid
stateDiagram-v2
    [*] --> Inactive: Extension Installed
    
    Inactive --> Activating: VSCode Startup
    Activating --> Active: Initialization Complete
    
    Active --> ServerStopped: Default State
    ServerStopped --> ServerStarting: Start Server Command
    ServerStarting --> ServerRunning: Port Available & Server Started
    ServerStarting --> ServerError: Port Unavailable or Error
    ServerError --> ServerStopped: Error Resolved
    ServerRunning --> ServerStopped: Stop Server Command
    
    ServerRunning --> IntegrationPending: Auto Integrate Command
    IntegrationPending --> IntegrationComplete: Script Injected Successfully
    IntegrationComplete --> ServerRunning: Ready for Inspection
    
    state ServerRunning {
        [*] --> Idle
        Idle --> InspectionMode: User Clicks Inspect
        InspectionMode --> ElementSelection: Elements Hovered/Clicked
        ElementSelection --> InspectionMode: Continue Selecting
        ElementSelection --> PromptSubmission: User Submits Prompt
        PromptSubmission --> AIProcessing: Send to Cursor
        AIProcessing --> Idle: Code Generated
        InspectionMode --> Idle: Exit Inspection Mode
    }
    
    Active --> Deactivating: VSCode Shutdown
    Deactivating --> [*]: Cleanup Complete
```

## State Descriptions

### Extension States
- **Inactive**: Extension installed but not activated
- **Activating**: Extension starting up, initializing components
- **Active**: Extension fully operational, ready for commands
- **Deactivating**: Extension shutting down, cleaning up resources

### Server States
- **ServerStopped**: HTTP server not running, default state
- **ServerStarting**: Server initialization in progress
- **ServerRunning**: HTTP server active, accepting connections
- **ServerError**: Server failed to start (port conflict, etc.)

### Integration States
- **IntegrationPending**: Auto-integration command executed, waiting for AI
- **IntegrationComplete**: Inspector script successfully injected into frontend

### Inspection States (within ServerRunning)
- **Idle**: Waiting for user interaction
- **InspectionMode**: Element inspection active, listening for DOM events
- **ElementSelection**: Elements being selected and highlighted
- **PromptSubmission**: User prompt being processed
- **AIProcessing**: Communication with Cursor AI in progress

## State Transitions

### Primary Transitions
1. **Extension Lifecycle**: Inactive → Activating → Active → Deactivating
2. **Server Lifecycle**: ServerStopped ↔ ServerStarting ↔ ServerRunning
3. **Error Handling**: ServerStarting → ServerError → ServerStopped
4. **Integration Flow**: ServerRunning → IntegrationPending → IntegrationComplete

### Inspection Cycle
1. **Start Inspection**: Idle → InspectionMode
2. **Element Interaction**: InspectionMode ↔ ElementSelection
3. **AI Communication**: ElementSelection → PromptSubmission → AIProcessing → Idle 