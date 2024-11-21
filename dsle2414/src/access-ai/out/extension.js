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
const webviewContent_1 = require("./frontend/webviewContent");
function activate(context) {
    const disposable = vscode.commands.registerCommand('access-ai.openChatbot', () => {
        openChatbotPanel(context);
    });
    context.subscriptions.push(disposable);
    console.log('Your chatbot extension "access-ai" is now active!');
}
function deactivate() { }
function openChatbotPanel(context) {
    const panel = vscode.window.createWebviewPanel('chatbot', 'Access-ai', vscode.ViewColumn.One, {
        enableScripts: true
    });
    panel.webview.html = (0, webviewContent_1.getWebviewContent)(context, panel.webview);
    // Temporary storage for the current session
    const sessionHistory = [];
    panel.webview.onDidReceiveMessage(async (message) => {
        switch (message.type) {
            case 'userMessage': {
                const userMessage = { sender: 'user', text: message.text };
                sessionHistory.push(userMessage); // Add to session history
                // Pass session history to the bot
                const botResponse = await getGeminiResponse(sessionHistory);
                const botMessage = { sender: 'bot', text: botResponse };
                sessionHistory.push(botMessage); // Add bot response to session history
                // Send the bot's response back to the webview
                panel.webview.postMessage({ type: 'botMessage', text: botResponse });
                break;
            }
        }
    }, undefined, context.subscriptions);
}
async function getGeminiResponse(sessionHistory) {
    try {
        // Format the session history as a single string
        const conversationContext = sessionHistory.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
        const response = await fetch('http://127.0.0.1:5000/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ textInput: conversationContext })
        });
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        return data.response || "Error: No response from Gemini";
    }
    catch (error) {
        console.error('Error fetching Gemini response:', error);
        return "Error connecting to Gemini API or invalid response format.";
    }
}
//# sourceMappingURL=extension.js.map