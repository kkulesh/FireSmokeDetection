import base64
import json

import cv2
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.logger import logger
from app.core.websocket_manager import manager
from app.services.yolo_service import yolo_service

router = APIRouter()


@router.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            # Receive optional client messages
            data = await websocket.receive_text()

            logger.info(f"Message from client: {data}")

            await manager.send_personal_message(
                f"Server received: {data}",
                websocket
            )

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("Client disconnected from WebSocket")


@router.websocket("/ws/detect")
async def websocket_detect(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            payload = await websocket.receive_text()
            data = json.loads(payload)

            frame_data = data.get("frame")
            overlap_threshold = data.get("overlap_threshold", 45.0) / 100
            confidence_threshold = data.get("confidence_threshold", 0.0) / 100

            if frame_data.startswith("data:image"):
                _, encoded = frame_data.split(",", 1)
                image_bytes = base64.b64decode(encoded)
            else:
                image_bytes = base64.b64decode(frame_data)

            frame = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
            if frame is None:
                raise ValueError("Unable to decode image frame")

            results = yolo_service.run_detection(frame, overlap_threshold=overlap_threshold)
            _, detections = yolo_service.draw_results(frame, results, confidence_threshold=confidence_threshold)

            await websocket.send_text(json.dumps({"detections": detections}))

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("Client disconnected from WebSocket")
    except Exception as exc:
        logger.error(f"WebSocket detection error: {exc}")
        await websocket.send_text(json.dumps({"error": str(exc)}))
        manager.disconnect(websocket)