"""
Test script to upload an image to the Flask endpoint and get Gemini analysis
Usage: python test_upload.py <image_path> [prompt]
"""
import requests
import sys
import json

def test_upload(image_path, prompt=None):
    """Test the image analysis endpoint with Gemini"""
    url = 'http://localhost:5000/analyze-image'
    
    try:
        with open(image_path, 'rb') as image_file:
            files = {'image': image_file}
            data = {}
            
            # Add custom prompt if provided
            if prompt:
                data['prompt'] = prompt
            
            response = requests.post(url, files=files, data=data)
            
        print(f"Status Code: {response.status_code}")
        print(f"\nResponse:")
        print(json.dumps(response.json(), indent=2))
        
    except FileNotFoundError:
        print(f"Error: File '{image_path}' not found")
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to server. Is it running?")
    except Exception as e:
        print(f"Error: {str(e)}")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python test_upload.py <image_path> [prompt]")
        print("\nExample:")
        print("  python test_upload.py photo.jpg")
        print("  python test_upload.py photo.jpg 'What objects are in this image?'")
        sys.exit(1)
    
    image_path = sys.argv[1]
    prompt = ' '.join(sys.argv[2:]) if len(sys.argv) > 2 else None
    
    test_upload(image_path, prompt)
