#!/usr/bin/env python3
"""
Simple FastAPI server to test basic functionality
"""

from fastapi import FastAPI
import uvicorn

app = FastAPI(title="Simple Test Server")

@app.get("/")
def health_check():
    return {"status": "ok", "service": "Simple Test Server"}

@app.get("/test")
def test_endpoint():
    return {"message": "Server is working!"}

if __name__ == "__main__":
    print("Starting simple server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
