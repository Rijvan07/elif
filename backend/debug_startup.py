#!/usr/bin/env python3
"""
Debug FastAPI startup issue step by step
"""

print("=== Starting FastAPI Debug ===")

try:
    print("1. Importing basic modules...")
    import os
    from dotenv import load_dotenv
    load_dotenv()
    print("✅ Basic modules imported")
except Exception as e:
    print(f"❌ Basic modules failed: {e}")
    exit(1)

try:
    print("2. Importing FastAPI...")
    from fastapi import FastAPI
    print("✅ FastAPI imported")
except Exception as e:
    print(f"❌ FastAPI import failed: {e}")
    exit(1)

try:
    print("3. Creating app...")
    app = FastAPI(title="Debug App")
    print("✅ App created")
except Exception as e:
    print(f"❌ App creation failed: {e}")
    exit(1)

try:
    print("4. Testing database connection...")
    from app.database import engine, Base
    print("✅ Database module imported")
except Exception as e:
    print(f"❌ Database import failed: {e}")
    exit(1)

try:
    print("5. Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created")
except Exception as e:
    print(f"❌ Table creation failed: {e}")
    exit(1)

try:
    print("6. Importing routes...")
    from app.routes import auth
    print("✅ Auth route imported")
except Exception as e:
    print(f"❌ Auth route import failed: {e}")
    exit(1)

try:
    print("7. Adding route...")
    app.include_router(auth.router)
    print("✅ Route added")
except Exception as e:
    print(f"❌ Route addition failed: {e}")
    exit(1)

print("=== All steps completed successfully ===")
print("Starting simple server...")

import uvicorn
uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
