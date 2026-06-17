import time
import tempfile
import os
from typing import Generator, Optional, List

try:
    import cv2
except ImportError:
    raise ImportError("opencv-python is not installed. Install it with: pip install opencv-python")

from app.core.logger import logger
from app.services.yolo_service import YOLOService
from app.core.websocket_manager import manager


class VideoService:
    def __init__(self):
        self.cap: Optional[cv2.VideoCapture] = None
        self.yolo = YOLOService()
        self.is_running = False

    def start_camera(self, source: int = 0):
        """
        Start webcam or video source
        """
        self.cap = cv2.VideoCapture(source)

        if not self.cap.isOpened():
            logger.error("Cannot open camera")
            raise Exception("Camera not available")

        self.is_running = True
        logger.info("Camera started")

    def stop_camera(self):
        """
        Release camera
        """
        self.is_running = False

        if self.cap:
            self.cap.release()
            self.cap = None

        logger.info("Camera stopped")

    def process_frames(self):
        """
        Generator that reads frames, runs YOLO, and yields processed frames
        """
        if not self.cap:
            raise Exception("Camera not started")

        while self.is_running:
            success, frame = self.cap.read()

            if not success:
                logger.warning("Failed to read frame")
                break

            # Run YOLO detection
            results = self.yolo.detect(frame)

            # Draw results on frame
            annotated_frame, detections = self.yolo.draw_results(frame, results)

            # Send alerts if fire/smoke detected
            self._handle_alerts(detections)

            yield annotated_frame

            time.sleep(0.01)  # small delay for stability

        self.stop_camera()

    def _handle_alerts(self, detections):
        """
        Send alerts via WebSocket if fire/smoke detected
        """
        for det in detections:
            label = det["class"]
            conf = det["confidence"]

            if label in ["fire", "smoke"] and conf > 0.5:
                message = f"🔥 {label.upper()} detected! Confidence: {conf:.2f}"

                logger.warning(message)

                # broadcast to frontend
                import asyncio
                asyncio.create_task(manager.broadcast(message))

    def extract_frames_from_video_bytes(self, video_bytes: bytes, sample_rate: int = 5) -> List:
        """
        Extract frames from video bytes at specified sample rate
        
        Args:
            video_bytes: Raw video file bytes
            sample_rate: Extract every Nth frame (default: 5 = extract every 5th frame)
        
        Returns:
            List of frames (numpy arrays)
        """
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp_file:
            tmp_path = tmp_file.name
            tmp_file.write(video_bytes)

        frames = []
        try:
            cap = cv2.VideoCapture(tmp_path)
            
            if not cap.isOpened():
                logger.error(f"Cannot open video file: {tmp_path}")
                raise ValueError("Unable to open video file")

            frame_count = 0
            extracted_count = 0
            max_frames = 30  # Limit to first 30 extracted frames to avoid too long processing

            while True:
                success, frame = cap.read()
                
                if not success:
                    break

                # Sample frames at specified rate
                if frame_count % sample_rate == 0 and extracted_count < max_frames:
                    frames.append(frame)
                    extracted_count += 1

                frame_count += 1

            cap.release()
            logger.info(f"Extracted {len(frames)} frames from video (total frames: {frame_count})")

        except Exception as e:
            logger.error(f"Error extracting frames: {str(e)}")
            raise
        finally:
            # Clean up temporary file
            try:
                os.unlink(tmp_path)
            except:
                pass

        return frames


# Singleton instance
video_service = VideoService()