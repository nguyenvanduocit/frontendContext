import { config } from "node:process";
import { executeCommand } from "reactive-vscode";
import { env } from "vscode";

export async function sendToAgent(prompt: string) {

  executeCommand('composer.newAgentChat', {prompt: "demo"})
  executeCommand('sendToAgent', {prompt: "demo"})
    executeCommand('sendToAgent', "demo")

  //commands.executeCommand('composerMode.agent');
  await new Promise(resolve => setTimeout(resolve, 1000))

  const originalClipboard = await env.clipboard.readText();
  await env.clipboard.writeText(prompt);
  await executeCommand('editor.action.clipboardPasteAction');
  await env.clipboard.writeText(originalClipboard);
  
}