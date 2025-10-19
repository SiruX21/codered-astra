from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from PIL import Image
import io
import google.generativeai as genai
from dotenv import load_dotenv
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
logger.info("Environment variables loaded")

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://fursona.siru.dev",
            "http://fursona.siru.dev",
            "http://localhost:5173",
            "http://localhost:3000"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

# Configure Google Gemini API
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    logger.error("GOOGLE_API_KEY not found in environment variables!")
else:
    genai.configure(api_key=GOOGLE_API_KEY)
    logger.info("Google Gemini API configured successfully")

# Default system prompt for Gemini
# Default system prompt for Gemini
DEFAULT_SYSTEM_PROMPT = """Using the description of the image, you are picking a fursona below from the list that most resonates with this image. Try to pick unique ones each time.

Available fursonas:
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
bear
dog
frog
horse
peacock
rabbit
turtle
tiger
lion
alligator
racoon
cockroach
meowl
tiger
monkey
ox
sheep
Pick the one that best matches the image's vibe. Pick Squirrel and elephant less, squirrel gets picked a lot - try to pick every animal equally.

IMPORTANT: Your response MUST start with the animal name as the first word, followed by a description explaining why you chose that animal based on the image's characteristics, colors, mood, or energy. 

Format: [ANIMAL_NAME] [Description explaining why this animal matches the image]
DO NOT PUT ANY COLON OR DASH IMMEDIATELY AFTER THE ANIMAL NAME, AND ONLY RESPONSE WITH ABOVE FORMAT.

Be creative, personal, and specific to what you observe in the image. Make the person feel special about their match! Try to sound as wacky as possible because you are writing out a fursona for furries!!! And furries absolutely love wacky! Talk in furry speak by  replace r and l with w, and all n preceding a vowel with ny. And add random emoticons and nya~ in it"""

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
logger.info(f"Upload folder created/verified: {UPLOAD_FOLDER}")

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE
logger.info(f"Flask app configured - Upload folder: {UPLOAD_FOLDER}, Max size: {MAX_FILE_SIZE / (1024 * 1024)}MB")


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
    logger.info("=== New image analysis request received ===")
    logger.info(f"Request method: {request.method}")
    logger.info(f"Request headers: {dict(request.headers)}")
    
    # Check if API key is configured
    if not GOOGLE_API_KEY:
        logger.error("API key not configured - rejecting request")
        return jsonify({
            'error': 'API key not configured',
            'message': 'Please set GOOGLE_API_KEY in your .env file'
        }), 500
    
    # Check if image is in the request
    if 'image' not in request.files:
        logger.warning("No image file provided in request")
        logger.debug(f"Available form fields: {list(request.files.keys())}")
        return jsonify({
            'error': 'No image file provided',
            'message': 'Please upload an image with the key "image"'
        }), 400
    
    file = request.files['image']
    logger.info(f"Image file received: {file.filename}")
    
    # Check if file is selected
    if file.filename == '':
        logger.warning("Empty filename provided")
        return jsonify({
            'error': 'No file selected',
            'message': 'Please select a file to upload'
        }), 400
    
    # Check if file type is allowed
    if not allowed_file(file.filename):
        logger.warning(f"Invalid file type: {file.filename}")
        return jsonify({
            'error': 'Invalid file type',
            'message': f'Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
        }), 400
    
    logger.info(f"File validation passed for: {file.filename}")
    
    try:
        # Read image data
        logger.info("Reading image data...")
        image_data = file.read()
        logger.info(f"Image data size: {len(image_data)} bytes ({len(image_data) / (1024 * 1024):.2f} MB)")
        
        # Validate that it's actually an image
        logger.info("Validating image format...")
        image = Image.open(io.BytesIO(image_data))
        
        # Get image information
        width, height = image.size
        format_type = image.format
        logger.info(f"Image details - Width: {width}, Height: {height}, Format: {format_type}")
        
        # Optional: Save the image to disk
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        logger.info(f"Saving image to: {filepath}")
        
        # Reset file pointer and save
        file.seek(0)
        file.save(filepath)
        logger.info(f"Image saved successfully to disk")
        
        # Get custom prompt or use default
        prompt = request.form.get('prompt', 'Describe this image in detail.')
        logger.info(f"Using prompt: {prompt[:100]}...")  # Log first 100 chars
        
        # Get custom system prompt or use default
        system_prompt = request.form.get('system_prompt', DEFAULT_SYSTEM_PROMPT)
        logger.debug(f"System prompt length: {len(system_prompt)} characters")
        
        # Combine system prompt with user prompt
        full_prompt = f"{system_prompt}\n\nUser request: {prompt}"
        logger.info("Prompts combined for Gemini API")
        
        # Send image to Google Gemini API
        logger.info("Initializing Gemini model (gemini-2.0-flash-exp)...")
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Reset image pointer for Gemini
        image.seek(0) if hasattr(image, 'seek') else None
        
        # Generate response from Gemini
        logger.info("Sending request to Gemini API...")
        start_time = datetime.now()
        response = model.generate_content([full_prompt, image])
        end_time = datetime.now()
        processing_time = (end_time - start_time).total_seconds()
        logger.info(f"Gemini API response received in {processing_time:.2f} seconds")
        logger.info(f"Response text preview: {response.text[:200]}...")
        
        # Parse fursona name and description from response
        # Expected format: "animal_name Description text here..."
        response_text = response.text.strip()
        response_parts = response_text.split(None, 1)  # Split on first whitespace
        
        if len(response_parts) >= 2:
            fursona_name = response_parts[0].lower()
            fursona_description = response_parts[1]
        else:
            # Fallback if format is not as expected
            fursona_name = response_text.lower()
            fursona_description = "You have a unique energy that matches this fursona!"
        
        logger.info(f"Fursona selected: {fursona_name}")
        logger.info(f"Description: {fursona_description[:100]}...")
        
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
                'fursona_name': fursona_name,
                'fursona_description': fursona_description,
                'prompt_used': prompt,
                'system_prompt_used': system_prompt
            }
        }
        
        logger.info("=== Image analysis completed successfully ===")
        logger.info(f"Final result: {fursona_name} - {fursona_description[:50]}...")
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error during image analysis: {str(e)}", exc_info=True)
        logger.error(f"Error type: {type(e).__name__}")
        return jsonify({
            'error': 'Failed to analyze image',
            'message': str(e)
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    logger.info("Health check endpoint called")
    return jsonify({
        'status': 'healthy',
        'message': 'Flask server is running'
    }), 200


if __name__ == '__main__':
    logger.info("=" * 50)
    logger.info("Starting Flask server...")
    logger.info(f"Upload folder: {UPLOAD_FOLDER}")
    logger.info(f"Allowed extensions: {ALLOWED_EXTENSIONS}")
    logger.info(f"Max file size: {MAX_FILE_SIZE / (1024 * 1024)}MB")
    logger.info(f"API Key configured: {'Yes' if GOOGLE_API_KEY else 'No'}")
    logger.info("Server starting on http://0.0.0.0:5000")
    logger.info("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)
