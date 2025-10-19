# Flask Image Analysis API with Google Gemini

A Flask API endpoint that receives images and analyzes them using Google Gemini AI.

## Features

- ✅ Upload images via POST request
- ✅ Image validation and processing
- ✅ Google Gemini AI image analysis
- ✅ Custom prompts for targeted analysis
- ✅ Support for multiple image formats (PNG, JPG, JPEG, GIF, BMP, WEBP)
- ✅ File size limit (16MB)
- ✅ Error handling
- ✅ Health check endpoint

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up your Google API Key:
   - Get your API key from: https://makersuite.google.com/app/apikey
   - Copy `.env.example` to `.env`
   - Add your API key to the `.env` file:
   ```
   GOOGLE_API_KEY=your_actual_api_key_here
   ```

3. Run the server:
```bash
python main.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### POST /analyze-image
Upload an image file and get AI analysis from Google Gemini.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: 
  - `image` (file, required): The image file to analyze
  - `prompt` (string, optional): Custom prompt for analysis (default: "Describe this image in detail.")

**Response:**
```json
{
  "success": true,
  "message": "Image analyzed successfully",
  "image_details": {
    "filename": "example.jpg",
    "width": 1920,
    "height": 1080,
    "format": "JPEG",
    "saved_path": "uploads/example.jpg"
  },
  "gemini_response": {
    "text": "This image shows a beautiful sunset over the ocean...",
    "prompt_used": "Describe this image in detail."
  }
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "message": "Flask server is running"
}
```

## Testing

### Using curl:
```bash
# Basic analysis
curl -X POST -F "image=@/path/to/your/image.jpg" http://localhost:5000/analyze-image

# With custom prompt
curl -X POST \
  -F "image=@/path/to/your/image.jpg" \
  -F "prompt=What colors are dominant in this image?" \
  http://localhost:5000/analyze-image
```

### Using the test script:
```bash
# Basic analysis
python test_upload.py /path/to/your/image.jpg

# With custom prompt
python test_upload.py /path/to/your/image.jpg "What objects are in this image?"
```

### Using Python requests:
```python
import requests

url = 'http://localhost:5000/analyze-image'

# Basic analysis
files = {'image': open('image.jpg', 'rb')}
response = requests.post(url, files=files)
print(response.json())

# With custom prompt
files = {'image': open('image.jpg', 'rb')}
data = {'prompt': 'What is the main subject of this image?'}
response = requests.post(url, files=files, data=data)
print(response.json())
```

## Configuration

You can modify these settings in `main.py`:

- `UPLOAD_FOLDER`: Directory where uploaded images are saved (default: 'uploads')
- `ALLOWED_EXTENSIONS`: Set of allowed file extensions
- `MAX_FILE_SIZE`: Maximum file size in bytes (default: 16MB)

## Error Codes

- `400`: Bad request (no file, invalid file type, etc.)
- `500`: Server error (failed to process image)
- `200`: Success
