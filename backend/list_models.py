#!/usr/bin/env python
"""List available Gemini models."""

from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

api_key = os.environ.get('GEMINI_API_KEY')

try:
    import google.generativeai as genai
    genai.configure(api_key=api_key)
    
    print("Available models:")
    print("-" * 60)
    for model in genai.list_models():
        print(f"Name: {model.name}")
        print(f"Display name: {model.display_name}")
        print(f"Supported methods: {model.supported_generation_methods}")
        print("-" * 60)
except Exception as e:
    print(f"Error listing models: {e}")
    import traceback
    traceback.print_exc()
