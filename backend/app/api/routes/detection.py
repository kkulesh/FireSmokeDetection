import base64
import urllib.request
from typing import Optional

import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.services.yolo_service import yolo_service
from app.services.video_service import video_service
from app.core.logger import logger

router = APIRouter(prefix="/detect", tags=["Detection"])


class ImageUrlRequest(BaseModel):
    image_url: str
    overlap_threshold: Optional[float] = 45.0
    confidence_threshold: Optional[float] = 0.0


class FrameRequest(BaseModel):
    frame_data: str  # base64 encoded image data
    overlap_threshold: Optional[float] = 45.0
    confidence_threshold: Optional[float] = 0.0


def _fetch_image_bytes(image_url: str) -> bytes:
    if image_url.startswith("data:image"):
        try:
            _, encoded = image_url.split(",", 1)
            return base64.b64decode(encoded)
        except Exception as exc:
            raise ValueError(f"Invalid data URI image: {exc}")

    request = urllib.request.Request(
        image_url,
        headers={"User-Agent": "Mozilla/5.0"}
    )

    with urllib.request.urlopen(request, timeout=15) as response:
        return response.read()


def _decode_image_bytes(image_bytes: bytes):
    image_array = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("Unable to decode image bytes")

    return image


@router.post("/file")
async def run_detection_file(
    file: UploadFile = File(...),
    overlap_threshold: float = Form(45.0),
    confidence_threshold: float = Form(0.0),
):
    """
    Detect fire/smoke objects in an uploaded image or video file.
    """
    try:
        logger.info(f"Incoming upload to /detect/file: filename={getattr(file, 'filename', None)} content_type={getattr(file, 'content_type', None)}")
        file_bytes = await file.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Empty file")

        # Check if it's a video or image
        if file.content_type and file.content_type.startswith("video/"):
            # Handle video file
            logger.info(f"Processing video file: {file.filename}")
            frames = video_service.extract_frames_from_video_bytes(file_bytes, sample_rate=5, filename=getattr(file, 'filename', None), content_type=getattr(file, 'content_type', None))
            
            if not frames:
                raise HTTPException(status_code=400, detail="No frames extracted from video")
            
            # Run detection on extracted frames and collect all detections
            all_detections = []
            for frame_idx, frame in enumerate(frames):
                try:
                    results = yolo_service.run_detection(frame, overlap_threshold=overlap_threshold / 100)
                    _, detections = yolo_service.draw_results(frame, results, confidence_threshold=confidence_threshold / 100)
                    
                    # Add frame index to detections
                    for det in detections:
                        det["frame_index"] = frame_idx
                    
                    all_detections.extend(detections)
                except Exception as e:
                    logger.warning(f"Error processing frame {frame_idx}: {str(e)}")
                    continue
            
            return JSONResponse(content={
                "success": True,
                "detections": all_detections,
                "total_frames": len(frames)
            })
        
        elif file.content_type and file.content_type.startswith("image/"):
            # Handle image file
            frame = _decode_image_bytes(file_bytes)
            results = yolo_service.run_detection(frame, overlap_threshold=overlap_threshold / 100)
            _, detections = yolo_service.draw_results(frame, results, confidence_threshold=confidence_threshold / 100)

            return JSONResponse(content={
                "success": True,
                "detections": detections
            })
        else:
            raise HTTPException(status_code=400, detail="File must be an image or video")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Detection failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Detection failed: {str(e)}"
        )


@router.post("/url")
async def run_detection_url(request: ImageUrlRequest):
    """
    Detect fire/smoke objects from an image URL (dataset images and uploaded URLs).
    """
    try:
        image_bytes = _fetch_image_bytes(request.image_url)
        frame = _decode_image_bytes(image_bytes)
        results = yolo_service.run_detection(frame, overlap_threshold=(request.overlap_threshold or 45.0) / 100)
        _, detections = yolo_service.draw_results(frame, results, confidence_threshold=(request.confidence_threshold or 0.0) / 100)

        return JSONResponse(content={
            "success": True,
            "detections": detections
        })

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Detection failed: {str(e)}"
        )


@router.post("/frame")
async def run_detection_frame(request: FrameRequest):
    """
    Detect fire/smoke objects in a base64 encoded frame (for real-time video).
    """
    try:
        if request.frame_data.startswith("data:image"):
            _, encoded = request.frame_data.split(",", 1)
            image_bytes = base64.b64decode(encoded)
        else:
            image_bytes = base64.b64decode(request.frame_data)

        frame = _decode_image_bytes(image_bytes)
        results = yolo_service.run_detection(frame, overlap_threshold=(request.overlap_threshold or 45.0) / 100)
        _, detections = yolo_service.draw_results(frame, results, confidence_threshold=(request.confidence_threshold or 0.0) / 100)

        return JSONResponse(content={
            "success": True,
            "detections": detections
        })

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Detection failed: {str(e)}"
        )


# Legacy endpoint - keep for backward compatibility
@router.post("/")
async def run_detection(file: UploadFile | None = File(None), request: ImageUrlRequest | None = None):
    """
    Legacy endpoint - use /file or /url instead.
    """
    if file is not None:
        return await run_detection_file(file)
    elif request is not None and request.image_url:
        return await run_detection_url(request)
    else:
        raise HTTPException(status_code=400, detail="Provide an image file or image_url in JSON body")