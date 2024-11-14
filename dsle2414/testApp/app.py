# AIzaSyBvDsp1QE9LGstzOA0yeVgvVqDriULfMr8
# instalar o flask pip install flask
# instalar o google generative ai pip install google-generative-ai


# app.py
from flask import Flask, render_template, request
import google.generativeai as genai
import os

app = Flask(__name__)

# Configure Google Gemini API
genai.configure(api_key="AIzaSyBvDsp1QE9LGstzOA0yeVgvVqDriULfMr8")

# Define the path to the file in the same folder
FILE_PATH = os.path.join(os.path.dirname(__file__), "your_file.txt")  # Replace with your actual file name

# Route for displaying the homepage with form
@app.route('/')
def index():
	return render_template('index.html')

# Route to handle form submission and request Gemini response
@app.route('/submit', methods=['POST'])
def submit():
	# Get the text input from the form
	text = request.form.get('textInput')

	# Initialize variable to hold additional text from file
	file_content = ""

	# Read the file contents directly
	try:
		with open(FILE_PATH, 'r') as f:
			file_content = f.read()
	except Exception as e:
		return render_template('index.html', gemini_response=f"Error reading file: {str(e)}")

	# Combine the file content with the input text to send to Gemini
	full_prompt = f"{text}\n\n{file_content}"

	try:
		# Create a model instance and send the prompt to Google Gemini
		model = genai.GenerativeModel("gemini-1.5-flash")
		response = model.generate_content(full_prompt)

		# Extract the text response
		gemini_response = response.text
	except Exception as e:
		gemini_response = f"Error: {str(e)}"

	# Render the response on the HTML page
	return render_template('index.html', gemini_response=gemini_response)

if __name__ == '__main__':
	app.run(debug=True)
