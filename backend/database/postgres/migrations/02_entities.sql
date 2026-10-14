-- =====================================================================
-- Entidades base independientes.
-- =====================================================================

-- ---------------------------------------------------------------------
-- USUARIOS (entidad general y especializaciones)
-- ---------------------------------------------------------------------
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol rol_usuario NOT NULL,
    en_linea BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE nutricionista (
    id_usuario INTEGER PRIMARY KEY
        REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    especialidad VARCHAR(100) NOT NULL
);

CREATE TABLE paciente (
    id_usuario INTEGER PRIMARY KEY
        REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    edad SMALLINT NOT NULL CHECK (edad BETWEEN 0 AND 120),
    sala VARCHAR(50) NOT NULL
);

CREATE TABLE jefe (
    id_usuario INTEGER PRIMARY KEY
        REFERENCES nutricionista(id_usuario) ON DELETE CASCADE
);

CREATE TABLE administrador (
    id_usuario INTEGER PRIMARY KEY
        REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- DIETAS Y GRUPOS NUTRICIONALES
-- ---------------------------------------------------------------------
CREATE TABLE dieta (
    id_dieta SERIAL PRIMARY KEY,
    nombre_dieta VARCHAR(100) NOT NULL UNIQUE,
    programa VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    estado estado_catalogo NOT NULL DEFAULT 'borrador',
    calorias_minimas INTEGER CHECK (calorias_minimas IS NULL OR calorias_minimas >= 0),
    calorias_maximas INTEGER CHECK (calorias_maximas IS NULL OR calorias_maximas >= 0),
    CHECK (
        calorias_minimas IS NULL
        OR calorias_maximas IS NULL
        OR calorias_maximas >= calorias_minimas
    )
);

CREATE TABLE grupo_nutricional (
    id_grupo_nutricional SERIAL PRIMARY KEY,
    nombre_grupo VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    estado estado_catalogo NOT NULL DEFAULT 'borrador',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- SOLICITUDES Y SUS TIPOS ESPECIALIZADOS
-- ---------------------------------------------------------------------
CREATE TABLE solicitud (
    id_solicitud SERIAL PRIMARY KEY,
    id_remitente INTEGER REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    id_destinatario INTEGER REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    fecha_solicitud TIMESTAMP NOT NULL DEFAULT NOW(),
    estado estado_solicitud NOT NULL DEFAULT 'pendiente',
    descripcion TEXT
);

CREATE TABLE solicitud_usuario (
    id_solicitud INTEGER PRIMARY KEY
        REFERENCES solicitud(id_solicitud) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    edad SMALLINT CHECK (edad IS NULL OR edad BETWEEN 0 AND 120),
    sala VARCHAR(50)
);

CREATE TABLE solicitud_nutricionista (
    id_solicitud INTEGER PRIMARY KEY
        REFERENCES solicitud(id_solicitud) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    id_dieta INTEGER REFERENCES dieta(id_dieta) ON DELETE SET NULL
);

CREATE TABLE solicitud_revalorizacion (
    id_solicitud INTEGER PRIMARY KEY
        REFERENCES solicitud(id_solicitud) ON DELETE CASCADE,
    id_paciente INTEGER NOT NULL
        REFERENCES paciente(id_usuario) ON DELETE RESTRICT,
    id_nutricionista INTEGER NOT NULL
        REFERENCES nutricionista(id_usuario) ON DELETE RESTRICT,
    id_dieta INTEGER NOT NULL
        REFERENCES dieta(id_dieta) ON DELETE RESTRICT
);

-- ---------------------------------------------------------------------
-- ALIMENTOS (simples y platos compuestos)
-- ---------------------------------------------------------------------
CREATE TABLE alimento (
    id_alimento SERIAL PRIMARY KEY,
    nombre_alimento VARCHAR(150) NOT NULL,
    tipo_preparacion tipo_preparacion NOT NULL,
    nivel_calorico nivel_calorico NOT NULL,
    estado estado_aprobacion NOT NULL DEFAULT 'borrador',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    id_creador INTEGER NOT NULL
        REFERENCES nutricionista(id_usuario) ON DELETE RESTRICT
);

CREATE TABLE alimento_simple (
    id_alimento INTEGER PRIMARY KEY
        REFERENCES alimento(id_alimento) ON DELETE CASCADE
);

CREATE TABLE plato_compuesto (
    id_alimento INTEGER PRIMARY KEY
        REFERENCES alimento(id_alimento) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- MENUS
-- ---------------------------------------------------------------------
CREATE TABLE menu (
    id_menu SERIAL PRIMARY KEY,
    nombre_menu VARCHAR(150) NOT NULL,
    id_dieta INTEGER NOT NULL
        REFERENCES dieta(id_dieta) ON DELETE RESTRICT,
    id_creador INTEGER NOT NULL
        REFERENCES nutricionista(id_usuario) ON DELETE RESTRICT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    estado estado_aprobacion NOT NULL DEFAULT 'borrador',
    proporcion_preparacion JSONB NOT NULL DEFAULT '{}'::JSONB,
    cantidad_total INTEGER NOT NULL CHECK (cantidad_total > 0),
    cobertura_grupos JSONB NOT NULL DEFAULT '{}'::JSONB
);
