from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
from PIL import Image
import io
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

# Configure Google Gemini API
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    print("WARNING: GOOGLE_API_KEY not found in environment variables!")
else:
    genai.configure(api_key=GOOGLE_API_KEY)

# Default system prompt for Gemini
DEFAULT_SYSTEM_PROMPT = """Using the description of the image, you are picking a fursona below from the list that most resonates with this image.
mouse
pig
fox
hedgehog
glowfish
goldfish
cow
giraffe
shrimp
elephant
cougar
cat
chicken
snake
squirrel
Pick the one that best matches the image’s vibe, personality, or appearance.
Pick the best word that fits with this image and only respond with that word.
Respond only with the exact word from the list. No punctuation, explanation, or other text.
"""

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE


def allowed_file(filename):
    """Check if the file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    """
    Endpoint to receive an image file and analyze it with Google Gemini
    Expects: multipart/form-data with 'image' field and optional 'prompt' field
    Returns: JSON response with Gemini's analysis
    """
    # Check if API key is configured
    if not GOOGLE_API_KEY:
        return jsonify({
            'error': 'API key not configured',
            'message': 'Please set GOOGLE_API_KEY in your .env file'
        }), 500
    
    # Check if image is in the request
    if 'image' not in request.files:
        return jsonify({
            'error': 'No image file provided',
            'message': 'Please upload an image with the key "image"'
        }), 400
    
    file = request.files['image']
    
    # Check if file is selected
    if file.filename == '':
        return jsonify({
            'error': 'No file selected',
            'message': 'Please select a file to upload'
        }), 400
    
    # Check if file type is allowed
    if not allowed_file(file.filename):
        return jsonify({
            'error': 'Invalid file type',
            'message': f'Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
        }), 400
    
    try:
        # Read image data
        image_data = file.read()
        
        # Validate that it's actually an image
        image = Image.open(io.BytesIO(image_data))
        
        # Get image information
        width, height = image.size
        format_type = image.format
        
        # Optional: Save the image to disk
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Reset file pointer and save
        file.seek(0)
        file.save(filepath)
        
        # Get custom prompt or use default
        prompt = request.form.get('prompt', 'Describe this image in detail.')
        
        # Get custom system prompt or use default
        system_prompt = request.form.get('system_prompt', DEFAULT_SYSTEM_PROMPT)
        
        # Combine system prompt with user prompt
        full_prompt = f"{system_prompt}\n\nUser request: {prompt}"
        
        # Send image to Google Gemini API
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Reset image pointer for Gemini
        image.seek(0) if hasattr(image, 'seek') else None
        
        # Generate response from Gemini
        response = model.generate_content([full_prompt, image])
        
        # Prepare response
        result = {
            'success': True,
            'message': 'Image analyzed successfully',
            'image_details': {
                'filename': filename,
                'width': width,
                'height': height,
                'format': format_type,
                'saved_path': filepath
            },
            'gemini_response': {
                'text': response.text,
                'prompt_used': prompt,
                'system_prompt_used': system_prompt
            }
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to analyze image',
            'message': str(e)
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Flask server is running'
    }), 200


if __name__ == '__main__':
    print("Starting Flask server...")
    print(f"Upload folder: {UPLOAD_FOLDER}")
    print(f"Allowed extensions: {ALLOWED_EXTENSIONS}")
    print(f"Max file size: {MAX_FILE_SIZE / (1024 * 1024)}MB")
    app.run(debug=True, host='0.0.0.0', port=5000)
