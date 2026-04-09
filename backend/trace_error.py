#!/usr/bin/env python3
"""
Trace the exact error source in backend startup
"""

import sys
import traceback

print("=== Python Environment ===")
print(f"Python: {sys.version}")
print(f"Current dir: {sys.path[0]}")

print("\n=== Step 1: Basic Imports ===")
try:
    import os
    from dotenv import load_dotenv
    load_dotenv()
    print("✅ os and dotenv loaded")
except Exception as e:
    print(f"❌ Error: {e}")
    traceback.print_exc()

print("\n=== Step 2: FastAPI Import ===")
try:
    from fastapi import FastAPI
    print("✅ FastAPI imported")
except Exception as e:
    print(f"❌ Error: {e}")
    traceback.print_exc()

print("\n=== Step 3: Database Import ===")
try:
    from app.database import engine, Base
    print("✅ Database imported")
except Exception as e:
    print(f"❌ Error: {e}")
    traceback.print_exc()

print("\n=== Step 4: Routes Import ===")
try:
    from app.routes import auth, assessment, results, admin
    print("✅ All routes imported")
except Exception as e:
    print(f"❌ Error: {e}")
    traceback.print_exc()

print("\n=== Step 5: App Creation ===")
try:
    app = FastAPI(title="Debug App")
    print("✅ App created")
except Exception as e:
    print(f"❌ Error: {e}")
    traceback.print_exc()

print("\n=== Step 6: Table Creation ===")
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created")
except Exception as e:
    print(f"❌ Error: {e}")
    traceback.print_exc()

print("\n=== Step 7: Route Registration ===")
try:
    app.include_router(auth.router)
    app.include_router(assessment.router)
    app.include_router(results.router)
    app.include_router(admin.router)
    print("✅ Routes registered")
except Exception as e:
    print(f"❌ Error: {e}")
    traceback.print_exc()

print("\n=== Step 8: CORS Setup ===")
try:
    from fastapi.middleware.cors import CORSMiddleware
    allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[origin.strip() for origin in allowed_origins],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    print("✅ CORS configured")
except Exception as e:
    print(f"❌ Error: {e}")
    traceback.print_exc()

print("\n=== All Steps Completed ===")
print("Ready to start server...")
