#!/usr/bin/env python3

"""
WSGI configuration for FastAPI application using Gunicorn with Uvicorn worker
"""

from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
