import { Request, Response } from 'express'
import { DiagnosticCollection } from 'vscode'
import { injectPromptWithCallback } from './diagnostic-manager'

export function handleMessage(diagnosticCollection: DiagnosticCollection) {
  return async (req: Request, res: Response): Promise<void> => {
    // Setup SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.flushHeaders()
    
    // Send initial connection message
    const connectionMessage = {
      type: 'connection',
      message: 'Connected to Frontend Context SSE'
    }
    res.write(`data: ${JSON.stringify(connectionMessage)}\n\n`)
    
    for (let i = 0; i < 3; i++) {
      res.write(`data: ${JSON.stringify({
        type: 'progress',
        message: `Processing... ${i * 10}%`
      })}\n\n`)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Process prompt
    const userPrompt = req.body?.prompt || 'Starting chat with frontend context...'
    const finalPrompt = `<instructions>User had selected some elements on the page, analyze it and evaluate the request, search for corresponding files and follow the request</instructions>${userPrompt}`
    
    injectPromptWithCallback(diagnosticCollection, finalPrompt)
    
    // Cleanup
    req.on('close', () => res.end())
    res.end()
  }
} 