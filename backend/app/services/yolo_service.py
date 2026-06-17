from ultralytics import YOLO
import cv2
from pathlib import Path

from app.core.logger import logger


class YOLOService:
    def __init__(self):
        """
        Load trained YOLO model once at startup
        """
        self.model_path = Path("weights/best.pt")

        if not self.model_path.exists():
            logger.warning(
                f"Model not found at {self.model_path}. "
                f"Using pretrained yolov8n.pt temporarily."
            )
            self.model = YOLO("yolov8n.pt")
        else:
            logger.info(f"Loading trained model from {self.model_path}")
            self.model = YOLO(str(self.model_path))

        logger.info("YOLO model loaded successfully")

    def run_detection(self, frame, overlap_threshold: float = 0.45):
        """
        Run inference on a single frame with NMS overlap threshold.
        """
        overlap_threshold = max(0.01, min(0.99, overlap_threshold))
        results = self.model(frame, verbose=False, iou=overlap_threshold)
        return results

    def detect(self, frame):
        """
        Alias for compatibility with older video service usage.
        """
        return self.run_detection(frame)

    def draw_results(self, frame, results, confidence_threshold: float = 0.0):
        """
        Draw bounding boxes and return detections list

        Returns:
            annotated_frame
            detections = [
                {
                    "x": 100,
                    "y": 50,
                    "width": 200,
                    "height": 150,
                    "confidence": 0.91,
                    "class": "fire",
                    "class_id": 0,
                    "class_name": "fire",
                    "detection_id": "det_1"
                }
            ]
        """
        annotated_frame = frame.copy()
        detections = []

        for result in results:
            boxes = result.boxes

            for box in boxes:
                # Bounding box coordinates
                x1, y1, x2, y2 = map(int, box.xyxy[0])

                # Confidence
                conf = float(box.conf[0])

                # Skip if below confidence threshold
                if conf < confidence_threshold:
                    continue

                # Class ID and class name
                cls_id = int(box.cls[0])
                class_name = self.model.names[cls_id]

                detection = {
                    "x": x1,
                    "y": y1,
                    "width": x2 - x1,
                    "height": y2 - y1,
                    "confidence": round(conf, 2),
                    "class": class_name,
                    "class_id": cls_id,
                    "class_name": class_name,
                    "detection_id": f"det_{len(detections) + 1}"
                }

                detections.append(detection)

                # Draw rectangle
                cv2.rectangle(
                    annotated_frame,
                    (x1, y1),
                    (x2, y2),
                    (0, 255, 0),
                    2
                )

                # Draw label
                label = f"{class_name}: {conf:.2f}"

                cv2.putText(
                    annotated_frame,
                    label,
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 0),
                    2
                )

        return annotated_frame, detections


# Singleton instance
yolo_service = YOLOService()