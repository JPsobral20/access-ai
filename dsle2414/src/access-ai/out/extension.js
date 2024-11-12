"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    const disposable = vscode.commands.registerCommand('access-ai.openChatbot', () => {
        openChatbotPanel(context);
    });
    context.subscriptions.push(disposable);
    console.log('Your chatbot extension "access-ai" is now active!');
}
function deactivate() { }
function openChatbotPanel(context) {
    const panel = vscode.window.createWebviewPanel('chatbot', 'AI Chatbot', vscode.ViewColumn.One, {
        enableScripts: true
    });
    panel.webview.html = getWebviewContent();
    // Listen for messages from the webview
    panel.webview.onDidReceiveMessage(message => {
        switch (message.type) {
            case 'userMessage':
                // Here you could connect to an AI model API or generate a response
                const botResponse = `${message.text}`;
                panel.webview.postMessage({ type: 'botMessage', text: botResponse });
                break;
        }
    }, undefined, context.subscriptions);
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

                    // Display user's message with label "You:"
                    addMessage(message, 'user-message', 'You');
                    userInput.value = '';

                    // Send message to the extension
                    vscode.postMessage({ type: 'userMessage', text: message });
                }

                function handleKeyPress(event) {
                    if (event.key === 'Enter') {
                        sendMessage();
                    }
                }

                function addMessage(text, className, label) {
                    const messages = document.getElementById('messages');
                    
                    // Create message container
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'message ' + className;
                    
                    // Add label (e.g., "You:" or "Bot:")
                    const labelDiv = document.createElement('div');
                    labelDiv.className = 'message-label';
                    labelDiv.textContent = label + ':';
                    messageDiv.appendChild(labelDiv);
                    
                    // Add the message text
                    const textDiv = document.createElement('div');
                    textDiv.textContent = text;
                    messageDiv.appendChild(textDiv);

                    messages.appendChild(messageDiv);
                    messages.scrollTop = messages.scrollHeight;
                }

                // Handle messages from the extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.type === 'botMessage') {
                        // Display bot's message with label "Bot:"
                        addMessage(message.text, 'bot-message', 'Bot');
                    }
                });
            </script>
        </body>
        </html>
    `;
}
//# sourceMappingURL=extension.js.map