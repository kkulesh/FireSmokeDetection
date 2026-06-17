from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from app.core.logger import logger
from app.core.config import settings

from app.api.routes import video
from app.api.routes import detection 
from app.api.routes import websocket

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    logger.info("Application started")


@app.get("/")
def root():
    return {"message": "Fire Detection Backend Running"}

app.include_router(video.router, prefix="/video", tags=["Video"])
app.include_router(websocket.router)
app.include_router(detection.router)

@app.post("/detect/")
async def detect(file: UploadFile = File(...)):
    contents = await file.read()

    return {
        "success": True,
        "detections": []
    }