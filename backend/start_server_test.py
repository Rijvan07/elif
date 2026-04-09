#!/usr/bin/env python3
"""
Test server startup with detailed logging
"""

import sys
import os
import traceback
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=== Starting Server Test ===")

try:
    # Import the actual app
    from app.main import app
    print("✅ App imported successfully")
    
    # Test basic routes
    @app.get("/test")
    def test_route():
        return {"status": "working", "message": "Server is up!"}
    
    print("✅ Test route added")
    
    # Start server with detailed logging
    import uvicorn
    print("🚀 Starting server on http://127.0.0.1:8000")
    print("Press Ctrl+C to stop...")
    
    uvicorn.run(
        app, 
        host="127.0.0.1", 
        port=8000, 
        log_level="info",
        access_log=True
    )
    
except KeyboardInterrupt:
    print("\n⏹ Server stopped by user")
except Exception as e:
    print(f"❌ Server error: {e}")
    traceback.print_exc()
