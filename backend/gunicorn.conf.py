# Gunicorn configuration file for FastAPI
# This tells Gunicorn to use Uvicorn worker for FastAPI compatibility

bind = "0.0.0.0:8000"
workers = 1
worker_class = "uvicorn.workers.UvicornWorker"
timeout = 120
keepalive = 2
max_requests = 1000
max_requests_jitter = 100
preload_app = True
