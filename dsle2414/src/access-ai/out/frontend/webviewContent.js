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
exports.getWebviewContent = getWebviewContent;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
function getWebviewContent(context, webview) {
    // Resolve the path to the style.css file
    const cssPath = vscode.Uri.file(path.join(context.extensionPath, 'src/frontend', 'style.css'));
    const cssUri = webview.asWebviewUri(cssPath); // Convert to webview URI for CSS
    // Resolve the path to the script.js file
    const scriptPath = vscode.Uri.file(path.join(context.extensionPath, 'src/frontend', 'script.js'));
    const scriptUri = webview.asWebviewUri(scriptPath); // Convert to webview URI for JS
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Chatbot</title>
            <link href="${cssUri}" rel="stylesheet"> <!-- Load the CSS -->
        </head>
        <body>
            <div class="chat-container">
                <div class="messages" id="messages"></div>
                <div class="input-container">
                    <input id="userInput" type="text" placeholder="Type a message..." onkeydown="handleKeyPress(event)" />
                    <button onclick="sendMessage()">Send</button>
                </div>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script> <!-- External JS Library -->
            <script src="${scriptUri}"></script> <!-- Load the external script -->
        </body>
        </html>
    `;
}
//# sourceMappingURL=webviewContent.js.map