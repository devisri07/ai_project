
import requests
import json

# Test registration
url = "http://127.0.0.1:5000/api/register"
payload = {
    "username": "testuser999",
    "password": "testpass999"
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
