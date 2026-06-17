from fastapi import APIRouter
import threading

from app.services.video_service import video_service

router = APIRouter()


@router.post("/start-webcam")
def start_webcam():
    try:
        video_service.start_camera()

        threading.Thread(
            target=video_service.process_frames,
            daemon=True
        ).start()

        return {"message": "Webcam detection started"}
    except Exception as e:
        return {"error": str(e)}


@router.post("/stop-webcam")
def stop_webcam():
    video_service.stop_camera()
    return {"message": "Camera stopped"}