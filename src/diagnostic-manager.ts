import { languages, DiagnosticCollection, window, Range, Diagnostic, Selection, DiagnosticSeverity, workspace } from 'vscode'
import { executeCommand } from 'reactive-vscode'

export const DIAGNOSTIC_COLLECTION_NAME = 'frontend-context-diagnostics'

export function createDiagnosticManager(): DiagnosticCollection {
  return languages.createDiagnosticCollection(DIAGNOSTIC_COLLECTION_NAME)
}

export function disposeDiagnosticManager(diagnosticCollection: DiagnosticCollection): void {
  diagnosticCollection.dispose()
}

export async function injectPromptWithCallback(
  diagnosticCollection: DiagnosticCollection,
  prompt: string
): Promise<void> {
  await injectPromptDiagnosticWithCallback({
    prompt,
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

  // Create the Diagnostic Collection once before the try/finally
  const fakeDiagCollection = languages.createDiagnosticCollection(
    DIAGNOSTIC_COLLECTION_NAME
  );

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
    fakeDiagCollection.set(document.uri, [fakeDiagnostic]);

    // Ensure cursor is within the diagnostic range
    editor.selection = new Selection(
      selectionOrFullDocRange.start,
      selectionOrFullDocRange.start
    );

    // Execute the callback command
    await params.callback();
    window.showInformationMessage(`Triggered agent for prompt.`);
  } catch (error) {
    window.showErrorMessage(`Failed to inject prompt: ${error}`);
  } finally {
    // Clear the diagnostic
    if (document) {
      fakeDiagCollection.delete(document.uri);
    } else {
      fakeDiagCollection.clear();
    }
    // Dispose the collection to clean up resources
    fakeDiagCollection.dispose();
  }
}
