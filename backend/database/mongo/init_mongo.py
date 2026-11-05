"""Estructura de MongoDB:

Formato de la ficha (cada dato en un solo sitio):
    {
      "id_alimento": 1,                     # enlace con PostgreSQL (único)
      "informacion_nutricional": {          # objeto LIBRE
          "descripcion": "Arroz blanco cocido", "porcion": 100, "unidad": "g",
          "calorias": 130, "proteinas": 2.7, "carbohidratos": 28, "grasas": 0.3,
          "alergenos": []
          # + los campos que correspondan a ese alimento (ingredientes,
          #   modo_preparacion, micronutrientes, ...)
      }
    }

La ficha no tiene estructura fija: cada alimento guarda solo los atributos
que le corresponden. Solo se valida el tipo de los campos conocidos.
"""
from pymongo.database import Database

from config import get_db

COLLECTION = "ficha_nutricional"

NUMBER = ["int", "double", "long", "decimal"]

VALIDATOR = {
    "$jsonSchema": {
        "bsonType": "object",
        "required": ["id_alimento", "informacion_nutricional"],
        "additionalProperties": False,
        "properties": {
            "_id": {"bsonType": "objectId"},
            # Enlace con PostgreSQL: alimento.id_alimento
            "id_alimento": {"bsonType": ["int", "long"], "minimum": 1},
            "informacion_nutricional": {
                "bsonType": "object",
                "additionalProperties": True,      # ficha flexible
                "properties": {
                    "descripcion": {"bsonType": "string"},
                    "porcion": {"bsonType": NUMBER, "minimum": 0, "exclusiveMinimum": True},
                    "unidad": {"bsonType": "string"},
                    "calorias": {"bsonType": NUMBER, "minimum": 0},
                    "proteinas": {"bsonType": NUMBER, "minimum": 0},
                    "carbohidratos": {"bsonType": NUMBER, "minimum": 0},
                    "grasas": {"bsonType": NUMBER, "minimum": 0},
                    "alergenos": {"bsonType": "array", "items": {"bsonType": "string"}},
                },
            },
        },
    }
}


def init_mongo(db: Database) -> None:
    if COLLECTION in db.list_collection_names():
        db.command("collMod", COLLECTION, validator=VALIDATOR, validationLevel="strict")
    else:
        db.create_collection(COLLECTION, validator=VALIDATOR)
    # Un alimento, una ficha.
    db[COLLECTION].create_index("id_alimento", unique=True, name="uq_ficha_id_alimento")


if __name__ == "__main__":
    init_mongo(get_db())
    print(f"Colección '{COLLECTION}' lista.")