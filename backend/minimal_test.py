#!/usr/bin/env python3
"""
Minimal test to identify startup issue
"""

import sys
import os

print("Python version:", sys.version)
print("Current directory:", os.getcwd())

try:
    print("Importing dotenv...")
    from dotenv import load_dotenv
    load_dotenv()
    print("✅ dotenv imported successfully")
except Exception as e:
    print(f"❌ dotenv import failed: {e}")

try:
    print("Importing FastAPI...")
    from fastapi import FastAPI
    print("✅ FastAPI imported successfully")
except Exception as e:
    print(f"❌ FastAPI import failed: {e}")

try:
    print("Importing database...")
    from app.database import engine, Base
    print("✅ database imported successfully")
except Exception as e:
    print(f"❌ database import failed: {e}")

try:
    print("Importing routes...")
    from app.routes import auth, assessment, results, admin
    print("✅ routes imported successfully")
except Exception as e:
    print(f"❌ routes import failed: {e}")

try:
    print("Creating app...")
    app = FastAPI(title="Test App")
    print("✅ app created successfully")
except Exception as e:
    print(f"❌ app creation failed: {e}")

try:
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ tables created successfully")
except Exception as e:
    print(f"❌ table creation failed: {e}")

print("Test completed!")
