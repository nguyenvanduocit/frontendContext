# Frontend Context

<a href="https://marketplace.visualstudio.com/items?itemName=aiocean.frontend-context" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/aiocean.frontend-context.svg?color=eee&amp;label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>
<a href="https://kermanx.github.io/reactive-vscode/" target="__blank"><img src="https://img.shields.io/badge/made_with-reactive--vscode-%23007ACC?style=flat&labelColor=%23229863"  alt="Made with reactive-vscode" /></a>

A VSCode extension that revolutionizes frontend development by providing real-time context through direct UI element interaction.

## Why Frontend Context?

- **Enhanced Developer Experience**: Directly select and interact with UI elements in your application while coding
- **Rich Context for AI**: Provides AI with comprehensive context about selected elements, resulting in more accurate suggestions and solutions
- **Streamlined Workflow**: Significantly reduces the need to switch between code and browser, making development faster and more intuitive
- **Improved Collaboration**: Creates a common visual reference point for discussing UI components with team members

## Features

- Real-time UI element selection and inspection
- Interactive chat interface with AI-powered assistance
- Comprehensive context gathering for better code suggestions

## Getting Started

### Installation

1. Install from [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=aiocean.frontend-context)
2. Reload VSCode
3. Access Frontend Context from the activity bar icon

### Setup

1. Open the Frontend Context panel from the VSCode activity bar
2. Click "Start Server" to initialize the Socket.io server
3. Use "Auto Integrate" command to seamlessly connect your frontend application
4. Start the chat interface to begin receiving AI-powered assistance

### Integration with Your Frontend

After running the "Auto Integrate" command, Frontend Context will automatically inject the necessary code into your frontend application. This enables the extension to interact with your UI elements.

<!-- configs -->

## Commands

<!-- commands -->

| Command                          | Title                                    |
| -------------------------------- | ---------------------------------------- |
| `frontend-context.startChat`     | Frontend Context: Start Chat             |
| `frontend-context.startServer`   | Frontend Context: Start Socket.io Server |
| `frontend-context.stopServer`    | Frontend Context: Stop Socket.io Server  |
| `frontend-context.openDocs`      | Frontend Context: Open Documentation     |
| `frontend-context.autoIntegrate` | Frontend Context: Auto Integrate         |


## License

MIT © [Nguyen Van Duoc](https://github.com/nguyenvanduocit)
