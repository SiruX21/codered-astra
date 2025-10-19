# Flask Image Upload API

A simple Flask API endpoint that receives images and responds with image details.

## Features

- ✅ Upload images via POST request
- ✅ Image validation and processing
- ✅ Support for multiple image formats (PNG, JPG, JPEG, GIF, BMP, WEBP)
- ✅ File size limit (16MB)
- ✅ Error handling
- ✅ Health check endpoint

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python main.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### POST /upload-image
Upload an image file.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with key `image` containing the image file

**Response:**
```json
{
  "success": true,
  "message": "Image received successfully",
  "image_details": {
    "filename": "example.jpg",
    "width": 1920,
    "height": 1080,
    "format": "JPEG",
    "mode": "RGB",
    "size_bytes": 245678,
    "saved_path": "uploads/example.jpg"
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
curl -X POST -F "image=@/path/to/your/image.jpg" http://localhost:5000/upload-image
```

### Using the test script:
```bash
python test_upload.py /path/to/your/image.jpg
```

### Using Python requests:
```python
import requests

url = 'http://localhost:5000/upload-image'
files = {'image': open('image.jpg', 'rb')}
response = requests.post(url, files=files)
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
