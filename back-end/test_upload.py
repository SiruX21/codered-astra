"""
Test script to upload an image to the Flask endpoint
Usage: python test_upload.py <image_path>
"""
import requests
import sys

def test_upload(image_path):
    """Test the image upload endpoint"""
    url = 'http://localhost:5000/upload-image'
    
    try:
        with open(image_path, 'rb') as image_file:
            files = {'image': image_file}
            response = requests.post(url, files=files)
            
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
    except FileNotFoundError:
        print(f"Error: File '{image_path}' not found")
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to server. Is it running?")
    except Exception as e:
        print(f"Error: {str(e)}")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python test_upload.py <image_path>")
        sys.exit(1)
    
    test_upload(sys.argv[1])
