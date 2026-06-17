import cv2
import numpy as np
import albumentations as A


# -----------------------------
# PREPROCESSING PIPELINE
# -----------------------------
def get_preprocessing_pipeline(img_size=640):
    return A.Compose([
        # Auto-Orient (handled via OpenCV read, but keep as placeholder)
        A.Lambda(image=lambda x, **kwargs: x),

        # Resize (Stretch to 640x640)
        A.Resize(height=img_size, width=img_size),

        # Auto-Adjust Contrast (Contrast Stretching)
        A.RandomBrightnessContrast(
            brightness_limit=0,
            contrast_limit=(0.2, 0.2),
            p=1.0
        ),
    ])


# -----------------------------
# AUGMENTATION PIPELINE
# -----------------------------
def get_augmentation_pipeline():
    return A.Compose([
        # Flip: Horizontal
        A.HorizontalFlip(p=0.5),

        # Crop / Zoom (simulate 0–15%)
        A.RandomResizedCrop(
            height=640,
            width=640,
            scale=(0.85, 1.0),  # 15% zoom
            ratio=(0.9, 1.1),
            p=0.5
        ),

        # Saturation
        A.HueSaturationValue(
            sat_shift_limit=20,
            hue_shift_limit=0,
            val_shift_limit=0,
            p=0.5
        ),

        # Brightness
        A.RandomBrightnessContrast(
            brightness_limit=0.15,
            contrast_limit=0,
            p=0.5
        ),

        # Exposure (approx via gamma)
        A.RandomGamma(
            gamma_limit=(90, 110),
            p=0.5
        ),

        # Blur (up to 1px)
        A.Blur(blur_limit=3, p=0.3),

        # Noise (0.5%)
        A.GaussNoise(
            var_limit=(5.0, 15.0),
            p=0.3
        ),
    ])