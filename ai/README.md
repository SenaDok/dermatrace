[README.md](https://github.com/user-attachments/files/28747730/README.md)

# DermTrace AI Service

Mock inference service for the DermTrace MVP demo.

## Architecture

```
MobileNetV3-Small (fine-tuned)
├── Healing stage classifier  → inflammation / proliferation / remodelling
└── Risk score regressor      → 0–100 (sigmoid × 100)
```

## Running the mock service

```bash
pip install fastapi uvicorn pillow
python mock_inference.py
# API live at http://localhost:8001
# Docs at  http://localhost:8001/docs
```

## Sample request

```bash
curl -X POST http://localhost:8001/predict \
  -F "file=@recovery_photo.jpg"
```

## Sample response

```json
{
  "healing_stage": "inflammation",
  "confidence": 0.84,
  "risk_score": 28.5,
  "stage_probabilities": {
    "inflammation": 0.84,
    "proliferation": 0.12,
    "remodelling":  0.04
  },
  "inference_ms": 42.3,
  "model_version": "1.0.0-mock",
  "disclaimer": "Informational guidance only. Not medical advice."
}
```

## Training (future work)

See `docs/ai_architecture.md` for the full MobileNetV3 training pipeline.
Replace the mock with `weights/dermatrace_best.pt` once clinic data is collected.

> Not medical advice. DermTrace AI is not a certified medical device.
