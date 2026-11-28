# Datos de ejemplo: una ficha por cada alimento del seed de PostgreSQL (ids 1-24).

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pymongo import UpdateOne 

from config import get_db
from init_mongo import COLLECTION 

# (id, descripción, porción_g, calorías, proteínas, carbohidratos, grasas)
ROWS = [
    (1,  "Ensalada de lechuga y tomate",     150,  35,  1.5,  7,   0.3),
    (2,  "Sopa de verduras",                 250,  70,  2.5, 12,   1.5),
    (3,  "Caldo de pollo",                   250,  45,  5,    2,   1.5),
    (4,  "Arroz blanco cocido",              150, 195,  4,   43,   0.4),
    (5,  "Pechuga de pollo a la plancha",    100, 165, 31,    0,   3.6),
    (6,  "Pescado al vapor",                 120, 130, 26,    0,   2.5),
    (7,  "Puré de papa",                     180, 190,  4,   32,   5),
    (8,  "Frijoles negros",                  180, 235, 15,   41,   0.9),
    (9,  "Lentejas guisadas",                200, 230, 18,   40,   0.8),
    (10, "Cerdo asado",                      150, 395, 35,    0,  27),
    (11, "Viandas hervidas",                 200, 210,  2,   50,   0.4),
    (12, "Vegetales salteados",              150,  90,  3,   10,   4.5),
    (13, "Tortilla de huevo",                120, 220, 14,    2,  17),
    (14, "Guayaba fresca",                   100,  68,  2.6, 14,   1),
    (15, "Yogur natural",                    125,  75,  6,    9,   1.8),
    (16, "Flan",                             120, 215,  5,   34,   6.5),
    (17, "Dulce de coco",                     80, 290,  2,   45,  12),
    (18, "Jugo de naranja natural",          250, 112,  1.7, 26,   0.5),
    (19, "Té de manzanilla",                 240,   2,  0,    0.5, 0),
    (20, "Leche descremada",                 250,  90,  8.5, 12,   0.2),
    (21, "Arroz con pollo",                  350, 520, 28,   62,  16),
    (22, "Potaje de lentejas con vegetales", 300, 280, 17,   42,   5),
    (23, "Ensalada mixta con huevo",         200, 150,  9,    9,   9),
    (24, "Arroz con leche",                  200, 330,  7,   55,   9),
]

ALLERGENS = {6: ["pescado"], 13: ["huevo"], 15: ["leche"], 16: ["leche", "huevo"],
             20: ["leche"], 23: ["huevo"], 24: ["leche"]}

# Datos extra (la ficha es flexible): solo donde tienen sentido.
EXTRA = {
    5:  {"modo_preparacion": "A la plancha, sin exceso de aceite."},
    6:  {"modo_preparacion": "Cocción al vapor durante 12 minutos."},
    10: {"modo_preparacion": "Asado al horno a 180 °C."},
    21: {"ingredientes": [4, 5], "modo_preparacion": "Cocer el arroz con el pollo y el sofrito.",
         "micronutrientes": {"sodio_mg": 780}},
    22: {"ingredientes": [9, 12], "modo_preparacion": "Guisar las lentejas y añadir los vegetales.",
         "micronutrientes": {"sodio_mg": 420}},
    23: {"ingredientes": [1, 13], "modo_preparacion": "Mezclar los ingredientes y servir fría."},
    24: {"ingredientes": [4, 20], "modo_preparacion": "Cocer el arroz en leche con azúcar.",
         "micronutrientes": {"sodio_mg": 95}},
}


def build_sheets() -> list[dict]:
    documents = []
    for (i, description, portion, kcal, protein, carbs, fat) in ROWS:
        allergens = ALLERGENS.get(i, [])
        info = {
            "descripcion": description, "porcion": portion, "unidad": "g",
            "calorias": kcal, "proteinas": protein, "carbohidratos": carbs,
            "grasas": fat, "alergenos": allergens,
        }
        info.update(EXTRA.get(i, {}))
        documents.append({"id_alimento": i, "informacion_nutricional": info})
    return documents


def seed(db) -> int:
    ops = [UpdateOne({"id_alimento": f["id_alimento"]}, {"$set": f}, upsert=True)
           for f in build_sheets()]
    db[COLLECTION].bulk_write(ops)
    total = db[COLLECTION].count_documents({})
    if total != len(ROWS):
        raise RuntimeError(f"Se esperaban {len(ROWS)} fichas y hay {total}")
    return total


if __name__ == "__main__":
    print(f"Fichas cargadas: {seed(get_db())}")