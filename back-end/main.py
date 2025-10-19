from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
from PIL import Image
import io

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE


def allowed_file(filename):
    """Check if the file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/upload-image', methods=['POST'])
def upload_image():
    """
    Endpoint to receive an image file
    Expects: multipart/form-data with 'image' field
    Returns: JSON response with image details
    """
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
        mode = image.mode
        
        # Optional: Save the image to disk
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Reset file pointer and save
        file.seek(0)
        file.save(filepath)
        
        # Prepare response
        response = {
            'success': True,
            'message': 'Image received successfully',
            'image_details': {
                'filename': filename,
                'width': width,
                'height': height,
                'format': format_type,
                'mode': mode,
                'size_bytes': len(image_data),
                'saved_path': filepath
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to process image',
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
