
"""
DermTrace AI Mock Inference Service
====================================
Standalone FastAPI service that returns mock AI predictions.
Runs on port 8001. The main backend calls this when a photo is submitted.

For the MVP demo, this produces believable outputs without a trained model.
Replace with real MobileNetV3 weights when training data is available.

Run:
    pip install fastapi uvicorn pillow
    python mock_inference.py
"""
import hashlib
import random
import time
from datetime import datetime, timezone
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="DermTrace AI Inference (Mock)",
    description="Mock MobileNetV3 inference for MVP demo.",
    version="1.0.0-mock",
)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

STAGES = ["inflammation", "proliferation", "remodelling"]
STAGE_DAYS = {"inflammation": [1, 5], "proliferation": [5, 14], "remodelling": [14, 30]}


class PredictResponse(BaseModel):
    healing_stage: str
    confidence: float
    risk_score: float
    stage_probabilities: dict
    inference_ms: float
    model_version: str = "1.0.0-mock"
    processed_at: str
    disclaimer: str = "Informational guidance only. Not medical advice."


@app.get("/health")
def health():
    return {"status": "ok", "mode": "mock", "model": "MobileNetV3-Small (untrained)"}


@app.post("/predict", response_model=PredictResponse)
async def predict(file: UploadFile = File(...)):
    """
    Accept a skin recovery photo and return mock AI predictions.
    Outputs are deterministic based on image content hash.
    """
    allowed = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(400, f"Unsupported type: {file.content_type}")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(413, "File exceeds 10 MB.")

    t0 = time.perf_counter()

    # Deterministic mock output based on image hash
    seed = int(hashlib.md5(contents[:512]).hexdigest()[:8], 16)
    rng = random.Random(seed)

    stage_idx = rng.choices([0, 1, 2], weights=[0.45, 0.35, 0.20])[0]
    stage = STAGES[stage_idx]
    confidence = round(rng.uniform(0.62, 0.91), 3)
    risk_score = round(rng.uniform(5.0, 45.0), 1)

    probs = [rng.uniform(0.05, 0.2) for _ in range(3)]
    probs[stage_idx] = confidence
    total = sum(probs)
    probs = [round(p / total, 4) for p in probs]

    inference_ms = round((time.perf_counter() - t0) * 1000 + rng.uniform(30, 65), 2)

    return PredictResponse(
        healing_stage=stage,
        confidence=confidence,
        risk_score=risk_score,
        stage_probabilities={STAGES[i]: probs[i] for i in range(3)},
        inference_ms=inference_ms,
        processed_at=datetime.now(timezone.utc).isoformat(),
    )


if __name__ == "__main__":
    import uvicorn
    print("DermTrace AI Mock Service starting on http://localhost:8001")
    print("API docs: http://localhost:8001/docs")
    uvicorn.run(app, host="0.0.0.0", port=8001)
