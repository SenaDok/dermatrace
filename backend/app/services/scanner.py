"""
Ingredient safety rules for post-procedure recovery.
Keyed by lowercase ingredient name fragment.
"""
from typing import Optional
from dataclasses import dataclass

@dataclass
class IngredientRule:
    status: str          # "safe" | "caution" | "avoid"
    reason: str
    safe_from_day: Optional[int] = None


RULES: dict[str, IngredientRule] = {
    # AVOID
    "retinol":          IngredientRule("avoid", "Vitamin A — highly irritating on compromised barrier.", 28),
    "tretinoin":        IngredientRule("avoid", "Prescription retinoid — contraindicated during healing.", 30),
    "retinal":          IngredientRule("avoid", "Potent retinoid — wait until full barrier recovery.", 28),
    "glycolic acid":    IngredientRule("avoid", "AHA exfoliant — disrupts healing barrier.", 21),
    "salicylic acid":   IngredientRule("avoid", "BHA exfoliant — too aggressive post-procedure.", 21),
    "lactic acid":      IngredientRule("avoid", "AHA — irritating on healing skin.", 21),
    "l-ascorbic acid":  IngredientRule("avoid", "High-dose vitamin C acid — wait until Day 21.", 21),
    "benzoyl peroxide": IngredientRule("avoid", "Strong oxidant — extremely drying on healing skin.", 28),
    "alcohol denat":    IngredientRule("avoid", "Drying alcohol — strips healing barrier.", 14),
    "fragrance":        IngredientRule("avoid", "Common sensitiser — avoid on compromised skin.", 14),
    "parfum":           IngredientRule("avoid", "Fragrance mixture — sensitising post-procedure.", 14),
    # CAUTION
    "niacinamide":      IngredientRule("caution", "Generally well-tolerated but may cause transient flushing."),
    "vitamin c":        IngredientRule("caution", "Form-dependent — stable derivatives OK; L-ascorbic avoid until Day 21."),
    "azelaic acid":     IngredientRule("caution", "Low-irritation — introduce carefully after Day 10.", 10),
    "hyaluronic acid":  IngredientRule("caution", "Usually safe — ensure no other actives in same product."),
    # SAFE
    "ceramide":         IngredientRule("safe", "Barrier-repairing lipid — actively beneficial."),
    "panthenol":        IngredientRule("safe", "Pro-vitamin B5 — soothing and healing. Recommended."),
    "centella asiatica":IngredientRule("safe", "Wound-healing botanical — supports barrier repair."),
    "allantoin":        IngredientRule("safe", "Soothing — promotes cell regeneration."),
    "squalane":         IngredientRule("safe", "Lightweight barrier oil — excellent for recovery."),
    "glycerin":         IngredientRule("safe", "Humectant — draws moisture to skin. Recommended."),
    "zinc oxide":       IngredientRule("safe", "Physical SPF and skin protectant — beneficial post-procedure."),
    "petrolatum":       IngredientRule("safe", "Occlusive protectant — gold standard for barrier occlusion."),
}


def analyse(ingredients: list[str], day: int) -> list[dict]:
    flags = []
    for ing in ingredients:
        ing_lower = ing.lower().strip()
        for key, rule in RULES.items():
            if key in ing_lower:
                status = rule.status
                # Override to safe if past the safe day
                if rule.safe_from_day and day >= rule.safe_from_day:
                    status = "safe"
                if status != "safe":
                    flags.append({
                        "name": ing,
                        "status": status,
                        "reason": rule.reason,
                        "safe_from_day": rule.safe_from_day,
                    })
                break
    return flags


def overall_status(flags: list[dict]) -> str:
    if any(f["status"] == "avoid" for f in flags):
        return "avoid"
    if any(f["status"] == "caution" for f in flags):
        return "caution"
    return "safe"
