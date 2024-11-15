# AIzaSyBvDsp1QE9LGstzOA0yeVgvVqDriULfMr8
# instalar o flask pip install flask
# instalar o flask_cors pip install flask_cors
# instalar o google generative ai pip install google-generativeai
# instalar o markdown pip install markdown


# app.py
from flask import Flask, request, jsonify
import google.generativeai as genai
import os
from flask_cors import CORS
import markdown
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app)

# Configure Google Gemini API
genai.configure(api_key="AIzaSyBvDsp1QE9LGstzOA0yeVgvVqDriULfMr8")

# Define the path to the file in the same folder
FILE_PATH = os.path.join(os.path.dirname(__file__), "your_file.txt")  # Replace with your actual file name



@app.route('/submit', methods=['POST'])
def submit():
    data = request.get_json()
    user_text = data.get('textInput', '')

    # Read additional text from the file
    file_content = ""
    try:
        with open(FILE_PATH, 'r') as f:
            file_content = f.read()
    except Exception as e:
        return jsonify({'error': f"Error reading file: {str(e)}"}), 500

    # Combine user input and file content for the Gemini prompt
    full_prompt = f"{user_text}\n\n{file_content}"

    # Send the prompt to Gemini
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(full_prompt)
        gemini_response = response.text
    except Exception as e:
        return jsonify({'error': f"Error fetching Gemini response: {str(e)}"}), 500

    # Convert Markdown-like formatting to HTML
    html_response = markdown.markdown(gemini_response)
    
    # Convert HTML to Markdown
    markdown_response = html_to_markdown(html_response)

    return jsonify({'response': markdown_response})



def html_to_markdown(html_text):
    # Parse the HTML content
    soup = BeautifulSoup(html_text, "html.parser")
    
    # Initialize the result Markdown text
    markdown_text = ""

    # Iterate over all elements in the parsed HTML
    for element in soup.contents:
        if element.name == "p":
            # For <p> tags, add two newlines to separate paragraphs in Markdown
            markdown_text += f"{element.get_text()}\n\n"  
        elif element.name == "strong":
            # For <strong> tags, convert to bold in Markdown
            markdown_text += f"**{element.get_text()}**"
        elif element.name == "ul":
            # For <ul> (unordered list), convert list items to Markdown
            for li in element.find_all("li"):
                markdown_text += f"- {li.get_text()}\n"
            markdown_text += "\n"  # Add a newline after lists to separate them as a paragraph
        elif element.name and element.name.startswith("h") and element.name[1:].isdigit():
            # Convert any <h1>, <h2>, <h3>, etc. to Markdown headers
            header_level = int(element.name[1:])
            markdown_text += f"{'#' * header_level} {element.get_text()}\n"
        elif element.name == "br":
            # Handle line breaks in HTML and convert them to Markdown line breaks
            markdown_text += "  \n"  # Markdown line break
        else:
            # For other tags, just get the text
            markdown_text += element.get_text()

    # Strip extra whitespace at the end
    return markdown_text.strip()




if __name__ == '__main__':
    app.run(debug=True)