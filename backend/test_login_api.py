#!/usr/bin/env python3
"""
Test the login API directly
"""

import requests
import json

def test_login():
    """Test login API directly"""
    
    # Test with existing user from database
    login_data = {
        "email": "testuser@example.com"  # This user exists in database
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login API working!")
        else:
            print("❌ Login API failed!")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()
