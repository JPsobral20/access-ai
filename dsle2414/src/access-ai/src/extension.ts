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
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #1e1e1e;
                    color: #fff;
                    height: 100vh;
                }
                .chat-container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    border-radius: 10px;
                    overflow: hidden;
                }
                .messages {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                .input-container {
                    display: flex;
                    padding: 15px;
                    background-color: #2d2d2d;
                    border-top: 1px solid #333;
                }
                input {
                    flex: 1;
                    padding: 10px;
                    border-radius: 20px;
                    border: 1px solid #333;
                    background-color: #3c3c3c;
                    color: #fff;
                    font-size: 14px;
                    outline: none;
                    transition: border 0.3s;
                }
                input:focus {
                    border-color: #0078d4;
                }
                button {
                    padding: 10px 15px;
                    margin-left: 10px;
                    background-color: #0078d4;
                    color: white;
                    border: none;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                button:hover {
                    background-color: #005a8c;
                }
                .message {
                    display: flex;
                    flex-direction: column;
                    max-width: 80%;
                    padding: 10px 15px;
                    border-radius: 20px;
                    background-color: #3c3c3c;
                    margin: 5px 0;
                    word-wrap: break-word;
                }
                .user-message {
                    background-color: #4e94d1;
                    align-self: flex-start;
                }
                .bot-message {
                    background-color: #575757;
                    align-self: flex-end;
                }
                .message-label {
                    font-weight: bold;
                    font-size: 14px;
                    margin-bottom: 5px;
                }
                .message-time {
                    font-size: 10px;
                    color: #888;
                    text-align: right;
                    margin-top: 5px;
                }
                .typing-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    font-size: 14px;
                    color: #aaa;
                }
                .dot {
                    height: 8px;
                    width: 8px;
                    margin: 0 3px;
                    background-color: #aaa;
                    border-radius: 50%;
                    animation: blink 1.5s infinite;
                }
                .dot:nth-child(1) {
                    animation-delay: 0s;
                }
                .dot:nth-child(2) {
                    animation-delay: 0.3s;
                }
                .dot:nth-child(3) {
                    animation-delay: 0.6s;
                }
                @keyframes blink {
                    0% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }
                /* Smooth scroll behavior */
                .messages {
                    scroll-behavior: smooth;
                }
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
            <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script> <!-- Include marked.js -->
            <script>
                const vscode = acquireVsCodeApi();

                function sendMessage() {
                    const userInput = document.getElementById('userInput');
                    const message = userInput.value.trim();
                    if (!message) return;

                    addMessage(message, 'user-message', 'You');
                    userInput.value = ''; // Clear the input field
                    userInput.focus(); // Focus input back
                    showTypingIndicator();

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
                    textDiv.innerHTML = text;  // Use innerHTML for safe rendering
                    messageDiv.appendChild(textDiv);

                    const timeDiv = document.createElement('div');
                    timeDiv.className = 'message-time';
                    timeDiv.textContent = new Date().toLocaleTimeString().slice(0, 5);
                    messageDiv.appendChild(timeDiv);

                    messages.appendChild(messageDiv);
                    messages.scrollTop = messages.scrollHeight;
                }

                function showTypingIndicator() {
                    const messages = document.getElementById('messages');
                    const typingDiv = document.createElement('div');
                    typingDiv.className = 'typing-indicator';
                    typingDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
                    messages.appendChild(typingDiv);
                    messages.scrollTop = messages.scrollHeight;
                }

                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.type === 'botMessage') {
                        const typingDiv = document.querySelector('.typing-indicator');
                        if (typingDiv) typingDiv.remove();
                        addBotMessage(message.text);  // Add the bot message to the messages container
                    }
                });

                // Add the bot message and render Markdown in HTML
                function addBotMessage(markdownText) {
                    const messages = document.getElementById('messages');
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'message bot-message';

                    const labelDiv = document.createElement('div');
                    labelDiv.className = 'message-label';
                    labelDiv.textContent = 'Bot:';
                    messageDiv.appendChild(labelDiv);

                    // Convert Markdown to HTML
                    const htmlContent = marked.parse(markdownText);
                    const textDiv = document.createElement('div');
                    textDiv.innerHTML = htmlContent; // Inject parsed HTML content into the message div
                    messageDiv.appendChild(textDiv);

                    const timeDiv = document.createElement('div');
                    timeDiv.className = 'message-time';
                    timeDiv.textContent = new Date().toLocaleTimeString().slice(0, 5);
                    messageDiv.appendChild(timeDiv);

                    messages.appendChild(messageDiv);
                    messages.scrollTop = messages.scrollHeight;
                }
            </script>
        </body>
        </html>
    `;
}
