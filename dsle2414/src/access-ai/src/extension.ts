import * as vscode from 'vscode';
import { getWebviewContent } from './frontend/webviewContent';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('access-ai.openChatbot', () => {
        openChatbotPanel(context);
    });

    context.subscriptions.push(disposable);
    console.log('Your chatbot extension "access-ai" is now active!');
}

export function deactivate() {}

function openChatbotPanel(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'chatbot',
        'AI Chatbot',
        vscode.ViewColumn.One,
        {
            enableScripts: true
        }
    );

    panel.webview.html = getWebviewContent(context, panel.webview);


    // Listen for messages from the webview
    panel.webview.onDidReceiveMessage(async message => {
        switch (message.type) {
            case 'userMessage':
                const botResponse = await getGeminiResponse(message.text);
                panel.webview.postMessage({ type: 'botMessage', text: botResponse });
                break;
        }
    }, undefined, context.subscriptions);
}

async function getGeminiResponse(userMessage: string): Promise<string> {
    try {
        const response = await fetch('http://127.0.0.1:5000/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ textInput: userMessage })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json() as { response?: string };
        return data.response || "Error: No response from Gemini";
    } catch (error) {
        console.error('Error fetching Gemini response:', error);
        return "Error connecting to Gemini API or invalid response format.";
    }
}
