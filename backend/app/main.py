import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routes import admin, assessment, auth, results

load_dotenv()

app = FastAPI(title="Elif Healthcare API", version="1.0.0")

allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(assessment.router)
app.include_router(results.router)
app.include_router(admin.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "Elif Healthcare Backend"}
