from typing import Optional, Tuple, List
from datetime import date, timedelta
import re


def normalize(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[\(\)\[\]\{\},.;:!?\-_/\\]+", " ", s)
    s = re.sub(r"\s+", " ", s)
    return s


def best_match_exercise(user_input: str, choices: List[str]) -> Tuple[str, Optional[str]]:
    raw = user_input.strip()
    if not choices:
        return raw.title(), None

    for c in choices:
        if c.lower() == raw.lower():
            return c, "exact"

    return raw.title(), None


def parse_date_from_text(text: str) -> Tuple[str, str]:
    t = text.strip()
    low = t.lower()

    if "eilen" in low:
        d = date.today() - timedelta(days=1)
        cleaned = re.sub(r"\beilen\b", "", t, flags=re.IGNORECASE).strip()
        return d.isoformat(), cleaned

    if "tänään" in low or "tanaan" in low:
        d = date.today()
        cleaned = re.sub(r"\btänään\b|\btanaan\b", "", t, flags=re.IGNORECASE).strip()
        return d.isoformat(), cleaned

    m = re.search(r"\b(\d{4})-(\d{2})-(\d{2})\b", t)
    if m:
        d = date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        cleaned = re.sub(r"\b\d{4}-\d{2}-\d{2}\b", "", t).strip()
        return d.isoformat(), cleaned

    m2 = re.search(r"\b(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?\b", t)
    if m2:
        day = int(m2.group(1))
        month = int(m2.group(2))
        year = int(m2.group(3)) if m2.group(3) else date.today().year
        d = date(year, month, day)
        cleaned = re.sub(r"\b\d{1,2}\.\d{1,2}(?:\.\d{4})?\b", "", t).strip()
        return d.isoformat(), cleaned

    return date.today().isoformat(), t


def parse_side_from_text(text: str) -> Tuple[Optional[str], str]:
    t = text
    patterns = [
        (r"\boikea\b", "right"),
        (r"\bvasen\b", "left"),
        (r"\bright\b", "right"),
        (r"\bleft\b", "left"),
    ]

    for pat, val in patterns:
        if re.search(pat, t, flags=re.IGNORECASE):
            cleaned = re.sub(pat, "", t, flags=re.IGNORECASE).strip()
            cleaned = re.sub(r"\s+", " ", cleaned)
            return val, cleaned

    return None, t


def parse_extra_reps(text: str) -> Tuple[int, str]:
    t = text
    extra = 0

    m = re.search(r"\+\s*(\d+)\b", t)
    if m:
        extra = int(m.group(1))
        t = re.sub(r"\+\s*\d+\b", "", t).strip()

    m2 = re.search(r"\bplus\s+(\d+)\b", t, flags=re.IGNORECASE)
    if m2 and extra == 0:
        extra = int(m2.group(1))
        t = re.sub(r"\bplus\s+\d+\b", "", t, flags=re.IGNORECASE).strip()

    t = re.sub(r"\s+", " ", t)
    return extra, t


def parse_rir(text: str) -> Tuple[Optional[int], str]:
    t = text
    m = re.search(r"\brir\s*(\d+)\b", t, flags=re.IGNORECASE)
    if not m:
        return None, t

    rir = int(m.group(1))
    t = re.sub(r"\brir\s*\d+\b", "", t, flags=re.IGNORECASE).strip()
    t = re.sub(r"\s+", " ", t)
    return rir, t


def parse_weight_reps(text: str) -> Tuple[float, int, str]:
    t = text.strip()
    t2 = t.replace(",", ".")

    # Paino + x + toistot: "80kg x 10" tai "80 x 10"
    m = re.search(r"\b(\d+(?:\.\d+)?)\s*(?:kg)?\s*[x\*]\s*(\d+)\b", t2, flags=re.IGNORECASE)
    if m:
        weight = float(m.group(1))
        reps = int(m.group(2))
        cleaned = re.sub(r"\b\d+(?:\.\d+)?\s*(?:kg)?\s*[x\*]\s*\d+\b", "", t2, flags=re.IGNORECASE).strip()
        cleaned = re.sub(r"\s+", " ", cleaned)
        return weight, reps, cleaned

    # Paino ilman x: "80kg 10" tai "80 10"
    m2 = re.search(r"\b(\d+(?:\.\d+)?)\s*(?:kg)?\s+(\d+)\b", t2, flags=re.IGNORECASE)
    if m2:
        weight = float(m2.group(1))
        reps = int(m2.group(2))
        cleaned = re.sub(r"\b\d+(?:\.\d+)?\s*(?:kg)?\s+\d+\b", "", t2, flags=re.IGNORECASE).strip()
        cleaned = re.sub(r"\s+", " ", cleaned)
        return weight, reps, cleaned

    # Bodyweight: vain toistot ilman painoa — "x 10" tai "x10"
    m3 = re.search(r"[x\*]\s*(\d+)\b", t2, flags=re.IGNORECASE)
    if m3:
        reps = int(m3.group(1))
        cleaned = re.sub(r"[x\*]\s*\d+\b", "", t2, flags=re.IGNORECASE).strip()
        cleaned = re.sub(r"\s+", " ", cleaned)
        return 0.0, reps, cleaned

    raise ValueError("En löytänyt painoa ja toistoja. Käytä esim: 'Pull Up x 10' tai 'bench press 80kg x 5'.")

