"""
Heuristic scoring model — no ML required for MVP.
Computes barrier score and risk score from daily symptom inputs.
"""
from dataclasses import dataclass

# Expected barrier score per day (0-100) for RF Microneedling baseline
EXPECTED_BARRIER = [
    45, 48, 52, 55, 58, 61, 64, 66, 68, 70,
    72, 74, 75, 76, 77, 78, 80, 81, 82, 83,
    84, 85, 86, 87, 88, 89, 90, 91, 92, 95,
]

PHASE_MAP = {
    range(1, 6):  "inflammation",
    range(6, 15): "proliferation",
    range(15, 31):"remodelling",
}


def get_phase(day: int) -> str:
    for r, phase in PHASE_MAP.items():
        if day in r:
            return phase
    return "remodelling"


def get_expected_barrier(day: int) -> float:
    idx = max(0, min(day - 1, 29))
    return EXPECTED_BARRIER[idx]


@dataclass
class ScoreResult:
    barrier_score: float
    risk_score: float
    healing_phase: str
    expected_barrier: float


def compute_scores(day: int, redness: float, swelling: float, flaking: float, discomfort: float) -> ScoreResult:
    # Symptom penalty (each 0-10, weighted)
    penalty = (redness * 0.30 + swelling * 0.30 + flaking * 0.20 + discomfort * 0.20) * 10
    raw_barrier = max(0.0, 100.0 - penalty)
    expected = get_expected_barrier(day)

    # Smooth toward expected
    barrier_score = round(0.7 * raw_barrier + 0.3 * expected, 1)
    deviation = barrier_score - expected

    # Risk from deviation (negative deviation = below expected = higher risk)
    risk_score = round(min(100.0, max(0.0, -deviation * 1.5)), 1)

    return ScoreResult(
        barrier_score=barrier_score,
        risk_score=risk_score,
        healing_phase=get_phase(day),
        expected_barrier=expected,
    )
