import * as vscode from 'vscode';

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

    panel.webview.html = getWebviewContent();

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

function getWebviewContent() {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Chatbot</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
                .chat-container { display: flex; flex-direction: column; height: 100vh; }
                .messages { flex: 1; padding: 10px; overflow-y: auto; border-bottom: 1px solid #ccc; }
                .input-container { display: flex; padding: 10px; }
                input { flex: 1; padding: 8px; font-size: 14px; }
                button { padding: 8px; font-size: 14px; margin-left: 5px; }
                .message { margin: 10px 0; }
                .message-label { font-weight: bold; }
                .user-message { text-align: left; }
                .bot-message { text-align: right; color: #555; }
            </style>
        </head>
        <body>
            <div class="chat-container">
                <div class="messages" id="messages"></div>
                <div class="input-container">
                    <input id="userInput" type="text" placeholder="Type a message..." onkeydown="handleKeyPress(event)" />
                    <button onclick="sendMessage()">Send</button>
                </div>
            </div>
            <script>
                const vscode = acquireVsCodeApi();

                function sendMessage() {
                    const userInput = document.getElementById('userInput');
                    const message = userInput.value.trim();
                    if (!message) return;

                    addMessage(message, 'user-message', 'You');
                    userInput.value = '';

                    vscode.postMessage({ type: 'userMessage', text: message });
                }

                function handleKeyPress(event) {
                    if (event.key === 'Enter') {
                        sendMessage();
                    }
                }

                function addMessage(text, className, label) {
                    const messages = document.getElementById('messages');
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'message ' + className;
                    
                    const labelDiv = document.createElement('div');
                    labelDiv.className = 'message-label';
                    labelDiv.textContent = label + ':';
                    messageDiv.appendChild(labelDiv);
                    
                    const textDiv = document.createElement('div');
                    textDiv.textContent = text;
                    messageDiv.appendChild(textDiv);

                    messages.appendChild(messageDiv);
                    messages.scrollTop = messages.scrollHeight;
                }

                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.type === 'botMessage') {
                        addMessage(message.text, 'bot-message', 'Bot');
                    }
                });
            </script>
        </body>
        </html>
    `;
}
