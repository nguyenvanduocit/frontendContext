import { workspace } from 'vscode'
import net from 'net'

export const CONFIG = {
  MESSAGES: {
    ACTIVATION_ERROR: 'Frontend Context: Failed to activate',
    DEACTIVATION_ERROR: 'Frontend Context: Error during deactivation',
    SERVER_ERROR: 'Frontend Context: Error starting Express server'
  }
} as const

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer()
    
    server.once('error', () => {
      resolve(false)
    })
    
    server.once('listening', () => {
      server.close()
      resolve(true)
    })
    
    server.listen(port)
  })
}

export async function findAvailablePort(startPort: number = 3000, increment: number = 1): Promise<number> {
  let port = startPort
  
  while (!(await isPortAvailable(port))) {
    port += increment
  }
  
  return port
}
