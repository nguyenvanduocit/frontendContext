import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import { Server } from 'http'
import { window } from 'vscode'
import { DiagnosticCollection } from 'vscode'
import { handleMessage } from './handle-message'
import { CONFIG } from './config'
import * as path from 'path'
import * as fs from 'fs'
import * as net from 'net'

interface ServerInstance {
  app: Express
  server: Server
  port: number
}

function setupRoutes(app: Express, diagnosticCollection: DiagnosticCollection): void {
  // Health check endpoint
  app.get('/', (req: Request, res: Response) => {
    res.send('Frontend Context server is running')
  })

  app.get('/inspector-toolbar.js', (req: Request, res: Response) => {
    try {
      const filePath = path.join(__dirname, '..', 'res', 'inspector-toolbar.js')
      const fileContent = fs.readFileSync(filePath, 'utf8')
      res.setHeader('Content-Type', 'application/javascript')
      res.send(fileContent)
    } catch (error) {
      console.error('Error reading inspector-toolbar.js:', error)
      res.status(404).send('File not found')
    }
  })

  // SSE endpoint
  app.post('/sendMessage', handleMessage(diagnosticCollection))
} 

export async function startServer(diagnosticCollection: DiagnosticCollection, port: number): Promise<ServerInstance> {
  const app = express()
  configureMiddleware(app)
  setupRoutes(app, diagnosticCollection)
  
  const server = await listen(app, port)
  
  return { app, server, port }
}

export async function stopServer(serverInstance: ServerInstance): Promise<void> {
  return new Promise((resolve, reject) => {
    serverInstance.server.close((error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

function configureMiddleware(app: Express): void {
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))

  app.use(express.json({ limit: '10mb' }))
}

async function checkPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    
    const timeout = setTimeout(() => {
      socket.destroy()
      resolve(true) // Timeout means port is available
    }, 1000)
    
    socket.on('connect', () => {
      clearTimeout(timeout)
      socket.destroy()
      resolve(false) // Connection successful means port is in use
    })
    
    socket.on('error', (err: any) => {
      clearTimeout(timeout)
      if (err.code === 'ECONNREFUSED') {
        resolve(true) // Connection refused means port is available
      } else {
        resolve(false) // Other errors
      }
    })
    
    socket.connect(port, 'localhost')
  })
}

function listen(app: Express, port: number): Promise<Server> {
  return new Promise(async (resolve, reject) => {
    // Kiểm tra port trước khi khởi động
    const isPortAvailable = await checkPortAvailable(port)
    
    if (!isPortAvailable) {
      reject(new Error(`Port ${port} is already in use. Please choose a different port.`))
      return
    }
    
    const server = app.listen(port, () => resolve(server))
    server.on('error', (error: any) => {
      reject(error)
    })
  })
} 