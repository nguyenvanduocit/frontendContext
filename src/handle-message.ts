import { Request, Response } from 'express'
import { DiagnosticCollection } from 'vscode'
import { injectPromptWithCallback, openComponentFiles } from './diagnostic-manager'

/**
 * Extracts componentLocation data from the request prompt
 */
function extractComponentLocations(prompt: string): string[] {
  const componentLocations: string[] = []
  
  try {
    // Look for <inspectedElements> tag in the prompt
    const inspectedElementsMatch = prompt.match(/<inspectedElements>([\s\S]*?)<\/inspectedElements>/)
    if (!inspectedElementsMatch) {
      return componentLocations
    }

    // Parse the JSON content
    const elementsData = JSON.parse(inspectedElementsMatch[1])
    
    // Recursively extract componentLocation from elements
    const extractFromElement = (element: any) => {
      if (element.componentData && element.componentData.componentLocation) {
        componentLocations.push(element.componentData.componentLocation)
      }
      
      // Check children recursively
      if (element.children && Array.isArray(element.children)) {
        element.children.forEach(extractFromElement)
      }
    }

    // Process all elements
    if (Array.isArray(elementsData)) {
      elementsData.forEach(extractFromElement)
    }
  } catch (error) {
    console.error('Error extracting componentLocation data:', error)
  }

  return componentLocations
}

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
    
    // Extract componentLocation data and open files
    const componentLocations = extractComponentLocations(userPrompt)
    if (componentLocations.length > 0) {
      console.log('Found componentLocations:', componentLocations)
      await openComponentFiles(diagnosticCollection, componentLocations)
      
      // Send progress update
      res.write(`data: ${JSON.stringify({
        type: 'progress',
        message: `Opened ${componentLocations.length} component file(s)`
      })}\n\n`)
    }
    
    const finalPrompt = `<instructions>User had selected some elements on the page, analyze it and evaluate the request, search for corresponding files and follow the request</instructions>${userPrompt}`
    
    injectPromptWithCallback(diagnosticCollection, finalPrompt)
    
    // Cleanup
    req.on('close', () => res.end())
    res.end()
  }
} 