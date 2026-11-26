import re
import unicodedata
from difflib import SequenceMatcher

SIMILARITY_THRESHOLD = 0.85


def normalize_name(name: str) -> str:
    decomposed = unicodedata.normalize("NFKD", name)
    without_accents = "".join(char for char in decomposed if not unicodedata.combining(char))
    return " ".join(re.findall(r"[a-z0-9]+", without_accents.lower()))


def similarity(first: str, second: str) -> float:
    a, b = normalize_name(first), normalize_name(second)
    if not a or not b:
        return 0.0
    if sorted(a.split()) == sorted(b.split()):
        return 1.0
    return round(SequenceMatcher(None, a, b).ratio(), 2)


def find_similar_pairs(foods: list[dict], threshold: float = SIMILARITY_THRESHOLD) -> list[dict]:
    pairs = []
    for index, first in enumerate(foods):
        for second in foods[index + 1 :]:
            score = similarity(first["nombre_alimento"], second["nombre_alimento"])
            if score >= threshold:
                pairs.append(
                    {
                        "similitud": score,
                        "alimentos": [
                            {"id_alimento": food["id_alimento"], "nombre_alimento": food["nombre_alimento"]}
                            for food in (first, second)
                        ],
                    }
                )
    pairs.sort(key=lambda pair: (-pair["similitud"], pair["alimentos"][0]["nombre_alimento"]))
    return pairs