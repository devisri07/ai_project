#!/usr/bin/env python
"""Test Gemini API integration."""

from dotenv import load_dotenv
import os
import sys
import google.generativeai as genai

print("Loading .env...")
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("✗ GEMINI_API_KEY not found in environment")
    sys.exit(1)

print("✓ API key loaded")

print("\nConfiguring Gemini...")
genai.configure(api_key=api_key)
print("✓ Gemini configured")

print("\nInitializing model...")
model_name = "models/gemini-2.5-flash"
print(f"Using model: {model_name}")

model = genai.GenerativeModel(model_name)
print("✓ Model initialized")

print("\nCalling Gemini API...")
try:
    response = model.generate_content(
        "Tell me a short story about a happy child in 2 sentences."
    )
    print("✓ API call successful")
    print("\nResponse:")
    print(response.text)

except Exception as e:
    print(f"\n✗ API call failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n✓ All tests passed!")
