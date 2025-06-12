import { languages, DiagnosticCollection, window, Range, Diagnostic, Selection, DiagnosticSeverity, workspace, Uri } from 'vscode'
import { executeCommand } from 'reactive-vscode'
import * as path from 'path'

export const DIAGNOSTIC_COLLECTION_NAME = 'frontend-context-diagnostics'

export function createDiagnosticManager(): DiagnosticCollection {
  return languages.createDiagnosticCollection(DIAGNOSTIC_COLLECTION_NAME)
}

export function disposeDiagnosticManager(diagnosticCollection: DiagnosticCollection): void {
  diagnosticCollection.dispose()
}

/**
 * Opens files based on componentLocation data and selects them in diagnostics
 */
export async function openComponentFiles(
  diagnosticCollection: DiagnosticCollection,
  componentLocations: string[]
): Promise<void> {
  if (!componentLocations || componentLocations.length === 0) {
    return
  }

  for (const componentLocation of componentLocations) {
    try {
      // Parse componentLocation format: "filePath@componentName"
      const [filePath, componentName] = componentLocation.split('@')
      
      if (!filePath) {
        console.warn(`Invalid componentLocation format: ${componentLocation}`)
        continue
      }

      // Try to find the file in workspace
      let fileUri: Uri | null = null
      
      // First try absolute path
      try {
        fileUri = Uri.file(filePath)
        await workspace.fs.stat(fileUri)
      } catch {
        // If absolute path fails, try relative to workspace
        const workspaceFolders = workspace.workspaceFolders
        if (workspaceFolders && workspaceFolders.length > 0) {
          const workspaceRoot = workspaceFolders[0].uri.fsPath
          const relativePath = path.resolve(workspaceRoot, filePath)
          try {
            fileUri = Uri.file(relativePath)
            await workspace.fs.stat(fileUri)
          } catch {
            // If still not found, try searching in workspace
            const searchPattern = `**/${path.basename(filePath)}`
            const foundFiles = await workspace.findFiles(searchPattern, '**/node_modules/**')
            if (foundFiles.length > 0) {
              fileUri = foundFiles[0]
            }
          }
        }
      }

      if (!fileUri) {
        console.warn(`Could not find file: ${filePath}`)
        continue
      }

      // Open the file
      const document = await workspace.openTextDocument(fileUri)
      const editor = await window.showTextDocument(document)

      // Create a diagnostic to highlight the component
      const range = new Range(0, 0, Math.min(document.lineCount - 1, 2), 0)
      const diagnostic = new Diagnostic(
        range,
        `Component: ${componentName || 'Unknown'} - Selected from inspector`,
        DiagnosticSeverity.Information
      )
      diagnostic.source = DIAGNOSTIC_COLLECTION_NAME

      // Set the diagnostic
      diagnosticCollection.set(document.uri, [diagnostic])

      // Select the range in the editor
      editor.selection = new Selection(range.start, range.end)
      editor.revealRange(range)

      console.log(`Opened and selected component file: ${filePath}`)
    } catch (error) {
      console.error(`Failed to open component file ${componentLocation}:`, error)
    }
  }
}

export async function injectPromptWithCallback(
  diagnosticCollection: DiagnosticCollection,
  prompt: string
): Promise<void> {
  await injectPromptDiagnosticWithCallback({
    prompt,
    diagnosticCollection,
    callback: async () => {
      await executeCommand("composer.fixerrormessage")
    }
  })
}

/**
 * Injects a diagnostic for a prompt and executes a callback function
 */
export async function injectPromptDiagnosticWithCallback(params: {
  prompt: string;
  diagnosticCollection: DiagnosticCollection;

  callback: () => Promise<any>;
}): Promise<void> {
  // Get active editor or open a file if none exists
  let editor = window.activeTextEditor;
  if (!editor) {
    try {
      // Get all workspace files
      const files = await workspace.findFiles('**/*', '**/node_modules/**');

      // Open the first file found
      const document = await workspace.openTextDocument(files[0]);
      editor = await window.showTextDocument(document);
      
      // Sleep 200ms to ensure editor is ready
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      window.showErrorMessage(
        `Failed to open or create file for prompt injection: ${error}`
      );
      return;
    }
  }

  const document = editor.document;

  try {
    // Use a large range or the current selection
    const selectionOrFullDocRange = editor.selection.isEmpty
      ? new Range(0, 0, Math.min(document.lineCount, 3), 0)
      : editor.selection;
    
    // Create the fake diagnostic object
    const fakeDiagnostic = new Diagnostic(
      selectionOrFullDocRange,
      params.prompt,
      DiagnosticSeverity.Error
    );
    fakeDiagnostic.source = DIAGNOSTIC_COLLECTION_NAME;

    // Set the diagnostic
    params.diagnosticCollection.set(document.uri, [fakeDiagnostic]);

    // Ensure cursor is within the diagnostic range
    editor.selection = new Selection(
      selectionOrFullDocRange.start,
      selectionOrFullDocRange.start
    );

    // Execute the callback command
    await params.callback();
  } catch (error) {
    window.showErrorMessage(`Failed to inject prompt: ${error}`);
  } finally {
    // Clear the diagnostic
    if (document) {
      params.diagnosticCollection.delete(document.uri);
    } else {
      params.diagnosticCollection.clear();
    }
  }
}
