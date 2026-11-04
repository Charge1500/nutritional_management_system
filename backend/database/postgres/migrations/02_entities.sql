-- =====================================================================
-- Entidades base independientes.
-- =====================================================================

-- ---------------------------------------------------------------------
-- USUARIOS (entidad general y especializaciones)
-- ---------------------------------------------------------------------
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    -- Si no se aporta, un trigger genera id_usuario@dominio institucional.
    email VARCHAR(150) NOT NULL UNIQUE
        CHECK (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
    -- Solo puede ser NULL mientras el paciente esté pendiente (ver 04).
    contrasena VARCHAR(255),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);
 
CREATE TABLE nutricionista (
    id_usuario INTEGER PRIMARY KEY
        REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    especialidad VARCHAR(100) NOT NULL
);
 
CREATE TABLE jefe (
    id_usuario INTEGER PRIMARY KEY
        REFERENCES nutricionista(id_usuario) ON DELETE CASCADE
);
 
CREATE TABLE administrador (
    id_usuario INTEGER PRIMARY KEY
        REFERENCES usuario(id_usuario) ON DELETE CASCADE
);
 
CREATE TABLE paciente (
    id_usuario INTEGER PRIMARY KEY
        REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    edad SMALLINT NOT NULL CHECK (edad BETWEEN 0 AND 120),
    sala VARCHAR(50) NOT NULL,
    estado_cuenta estado_cuenta NOT NULL DEFAULT 'pendiente',
    -- Interrelación Registra: quién y cuándo registró al paciente.
    -- Ambos NULL si lo creó directamente el administrador.
    id_nutri_registra INTEGER
        REFERENCES nutricionista(id_usuario) ON DELETE RESTRICT,
    fecha_registro TIMESTAMP,
    CHECK ((id_nutri_registra IS NULL) = (fecha_registro IS NULL))
);

-- ---------------------------------------------------------------------
-- DIETAS Y GRUPOS NUTRICIONALES
-- ---------------------------------------------------------------------
CREATE TABLE dieta (
    id_dieta SERIAL PRIMARY KEY,
    nombre_dieta VARCHAR(100) NOT NULL UNIQUE,
    programa VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    estado estado_catalogo NOT NULL DEFAULT 'borrador'
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
    id_remitente INTEGER NOT NULL
        REFERENCES usuario(id_usuario) ON DELETE RESTRICT,
    id_destinatario INTEGER NOT NULL
        REFERENCES usuario(id_usuario) ON DELETE RESTRICT,
    fecha_solicitud TIMESTAMP NOT NULL DEFAULT NOW(),
    estado estado_solicitud NOT NULL DEFAULT 'pendiente',
    descripcion TEXT
);
 
CREATE TABLE solicitud_nutricionista (
    id_solicitud INTEGER PRIMARY KEY
        REFERENCES solicitud(id_solicitud) ON DELETE CASCADE,
    tipo tipo_solicitud_nutricionista NOT NULL
);
 
CREATE TABLE solicitud_revalorizacion (
    id_solicitud INTEGER PRIMARY KEY
        REFERENCES solicitud(id_solicitud) ON DELETE CASCADE
);
-- ---------------------------------------------------------------------
-- ALIMENTOS (simples y platos compuestos)
-- ---------------------------------------------------------------------
CREATE TABLE alimento (
    id_alimento SERIAL PRIMARY KEY,
    nombre_alimento VARCHAR(150) NOT NULL,
    tipo_preparacion tipo_preparacion NOT NULL,
    nivel_calorico nivel_calorico NOT NULL,
    estado estado_catalogo NOT NULL DEFAULT 'borrador',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    id_grupo_nutricional INTEGER NOT NULL
        REFERENCES grupo_nutricional(id_grupo_nutricional) ON DELETE RESTRICT,
    id_creador INTEGER NOT NULL
        REFERENCES nutricionista(id_usuario) ON DELETE RESTRICT
);
 
-- nombre único
CREATE UNIQUE INDEX uq_alimento_nombre
    ON alimento (lower(btrim(nombre_alimento)));
 
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
    estado estado_menu NOT NULL DEFAULT 'borrador',
    origen origen_menu NOT NULL DEFAULT 'automatico',
    -- Interrelación Indica: solo los menús manuales la tienen.
    id_jefe_indica INTEGER
        REFERENCES jefe(id_usuario) ON DELETE RESTRICT,
    -- NULL permitido solo en menús manuales.
    cantidad_total_alimentos INTEGER
        CHECK (cantidad_total_alimentos IS NULL OR cantidad_total_alimentos > 0),
    CHECK ((origen = 'manual') = (id_jefe_indica IS NOT NULL))
);

-- ---------------------------------------------------------------------
-- REVISIONES, ASIGNACIONES, CONSUMOS Y VALORACIONES
-- ---------------------------------------------------------------------
 
-- Revisión: entidad débil de menú, identificada por (id_menu, num_revision).
CREATE TABLE revision_menu (
	id_menu INTEGER NOT NULL
		REFERENCES menu(id_menu) ON DELETE CASCADE,
	num_revision INTEGER NOT NULL CHECK (num_revision >= 1),
	id_jefe INTEGER NOT NULL
		REFERENCES jefe(id_usuario) ON DELETE RESTRICT,
	fecha_revision TIMESTAMP NOT NULL DEFAULT NOW(),
	resultado resultado_revision NOT NULL,
	observaciones TEXT,
	PRIMARY KEY (id_menu, num_revision),
	-- Obligatorias solo si se rechaza.
	CHECK (resultado = 'aprobado' OR NULLIF(btrim(observaciones), '') IS NOT NULL)
);
 
-- Agregación Asignación (interrelación Se_asigna entre Paciente y Menú).
-- La clave única impide la asignación doble del mismo menú al mismo
-- paciente en la misma fecha.
CREATE TABLE menu_asignado (
	id_menu_asignado SERIAL PRIMARY KEY,
	id_menu INTEGER NOT NULL
		REFERENCES menu(id_menu) ON DELETE RESTRICT,
	id_paciente INTEGER NOT NULL
		REFERENCES paciente(id_usuario) ON DELETE RESTRICT,
	id_nutricionista INTEGER NOT NULL
		REFERENCES nutricionista(id_usuario) ON DELETE RESTRICT,
	fecha_asignacion DATE NOT NULL DEFAULT CURRENT_DATE,
	UNIQUE (id_paciente, id_menu, fecha_asignacion)
);
 
-- Consumo: cada ocasión en que un paciente consume un alimento servido.
-- Un mismo alimento puede consumirse varias veces (otra fecha/hora).
CREATE TABLE consumo (
	id_consumo SERIAL PRIMARY KEY,
	id_menu_asignado INTEGER NOT NULL
		REFERENCES menu_asignado(id_menu_asignado) ON DELETE RESTRICT,
	id_alimento INTEGER NOT NULL
		REFERENCES alimento(id_alimento) ON DELETE RESTRICT,
	fecha_hora TIMESTAMP NOT NULL DEFAULT NOW(),
	resultado resultado_consumo NOT NULL,
	UNIQUE (id_menu_asignado, id_alimento, fecha_hora)
);
 
-- Valoración nutricional, siempre sobre una asignación concreta (así queda
-- ligada al paciente, al menú y a la dieta).
CREATE TABLE valoracion_nutricional (
	id_valoracion SERIAL PRIMARY KEY,
	id_menu_asignado INTEGER NOT NULL
		REFERENCES menu_asignado(id_menu_asignado) ON DELETE RESTRICT,
	id_nutricionista INTEGER NOT NULL
		REFERENCES nutricionista(id_usuario) ON DELETE RESTRICT,
	fecha TIMESTAMP NOT NULL DEFAULT NOW(),
	puntuacion SMALLINT NOT NULL CHECK (puntuacion BETWEEN 1 AND 100),
	observaciones TEXT,
	tipo tipo_valoracion NOT NULL DEFAULT 'ordinaria'
);