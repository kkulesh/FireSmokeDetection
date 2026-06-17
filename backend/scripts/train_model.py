from ultralytics import YOLO
from pathlib import Path

# -----------------------------
# CONFIG
# -----------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_PATH = BASE_DIR / "dataset" / "data.yaml"

MODEL_NAME = "yolov8s.pt"   # samm model 
EPOCHS = 50
IMG_SIZE = 640
BATCH_SIZE = 16

PROJECT_DIR = "runs/train"
RUN_NAME = "fire_smoke_yolov8"

# -----------------------------
# MAIN TRAINING FUNCTION
# -----------------------------
def train():
    print("Loading YOLO model...")

    model = YOLO(MODEL_NAME)  # pretrained COCO weights

    print("Starting training...")
    results = model.train(
        data=str(DATASET_PATH),
        epochs=EPOCHS,
        imgsz=IMG_SIZE,
        batch=BATCH_SIZE,
        project=PROJECT_DIR,
        name=RUN_NAME,
        device=0,  # 0 for GPU, 'cpu' if no GPU
        workers=4,
    )

    print("Training completed!")

    # Save best model path
    best_model_path = Path(PROJECT_DIR) / RUN_NAME / "weights" / "best.pt"
    print(f"Best model saved at: {best_model_path}")

    return results


if __name__ == "__main__":
    train()