-- =====================================================================
-- Relaciones M:N y entidades dependientes.
-- =====================================================================

-- Grupos nutricionales que cubre cada dieta.
CREATE TABLE dieta_grupo (
	id_dieta INTEGER NOT NULL
		REFERENCES dieta(id_dieta) ON DELETE CASCADE,
	id_grupo_nutricional INTEGER NOT NULL
		REFERENCES grupo_nutricional(id_grupo_nutricional) ON DELETE RESTRICT,
	PRIMARY KEY (id_dieta, id_grupo_nutricional)
);

-- Alimentos que una dieta restringe o cubre.
CREATE TABLE dieta_alimento (
	id_dieta INTEGER NOT NULL
		REFERENCES dieta(id_dieta) ON DELETE CASCADE,
	id_alimento INTEGER NOT NULL
		REFERENCES alimento(id_alimento) ON DELETE RESTRICT,
	cantidad_minima INTEGER NOT NULL DEFAULT 0
		CHECK (cantidad_minima >= 0),
	cantidad_maxima INTEGER NOT NULL
		CHECK (cantidad_maxima >= cantidad_minima),
	PRIMARY KEY (id_dieta, id_alimento)
);

-- Dietas que puede atender cada nutricionista.
CREATE TABLE nutricionista_dieta (
	id_nutricionista INTEGER NOT NULL
		REFERENCES nutricionista(id_usuario) ON DELETE CASCADE,
	id_dieta INTEGER NOT NULL
		REFERENCES dieta(id_dieta) ON DELETE CASCADE,
	PRIMARY KEY (id_nutricionista, id_dieta)
);

-- Dietas en las que está inscrito cada paciente.
CREATE TABLE inscripcion_dieta (
	id_paciente INTEGER NOT NULL
		REFERENCES paciente(id_usuario) ON DELETE CASCADE,
	id_dieta INTEGER NOT NULL
		REFERENCES dieta(id_dieta) ON DELETE CASCADE,
	fecha_inscripcion DATE NOT NULL DEFAULT CURRENT_DATE,
	PRIMARY KEY (id_paciente, id_dieta)
);

-- Un plato contiene uno o más alimentos simples.
CREATE TABLE plato_ingrediente (
	id_plato INTEGER NOT NULL
		REFERENCES plato_compuesto(id_alimento) ON DELETE CASCADE,
	id_ingrediente INTEGER NOT NULL
		REFERENCES alimento_simple(id_alimento) ON DELETE RESTRICT,
	PRIMARY KEY (id_plato, id_ingrediente),
	CHECK (id_plato <> id_ingrediente)
);

-- Un alimento puede pertenecer a varios grupos nutricionales.
CREATE TABLE alimento_grupo (
	id_alimento INTEGER NOT NULL
		REFERENCES alimento(id_alimento) ON DELETE CASCADE,
	id_grupo_nutricional INTEGER NOT NULL
		REFERENCES grupo_nutricional(id_grupo_nutricional) ON DELETE RESTRICT,
	PRIMARY KEY (id_alimento, id_grupo_nutricional)
);

-- El jefe valida alimentos.
CREATE TABLE validacion_alimento (
	id_validacion SERIAL PRIMARY KEY,
	id_alimento INTEGER NOT NULL
		REFERENCES alimento(id_alimento) ON DELETE RESTRICT,
	id_jefe INTEGER NOT NULL
		REFERENCES jefe(id_usuario) ON DELETE RESTRICT,
	fecha_validacion TIMESTAMP NOT NULL DEFAULT NOW(),
	observaciones TEXT,
	resultado resultado_validacion NOT NULL
);

-- Alimentos que contiene cada menú.
CREATE TABLE menu_alimento (
	id_menu INTEGER NOT NULL
		REFERENCES menu(id_menu) ON DELETE CASCADE,
	id_alimento INTEGER NOT NULL
		REFERENCES alimento(id_alimento) ON DELETE RESTRICT,
	cantidad NUMERIC(10, 2) CHECK (cantidad IS NULL OR cantidad > 0),
	unidad VARCHAR(30),
	orden INTEGER CHECK (orden IS NULL OR orden > 0),
	PRIMARY KEY (id_menu, id_alimento)
);

-- El jefe valida menús.
CREATE TABLE validacion_menu (
	id_validacion SERIAL PRIMARY KEY,
	id_menu INTEGER NOT NULL
		REFERENCES menu(id_menu) ON DELETE RESTRICT,
	id_jefe INTEGER NOT NULL
		REFERENCES jefe(id_usuario) ON DELETE RESTRICT,
	fecha_validacion TIMESTAMP NOT NULL DEFAULT NOW(),
	observaciones TEXT,
	resultado resultado_validacion NOT NULL
);

-- Menú asignado a un paciente por un nutricionista.
CREATE TABLE menu_asignado (
	id_menu_asignado SERIAL PRIMARY KEY,
	id_menu INTEGER NOT NULL
		REFERENCES menu(id_menu) ON DELETE RESTRICT,
	id_paciente INTEGER NOT NULL
		REFERENCES paciente(id_usuario) ON DELETE RESTRICT,
	id_nutricionista INTEGER NOT NULL
		REFERENCES nutricionista(id_usuario) ON DELETE RESTRICT,
	fecha_asignacion TIMESTAMP NOT NULL DEFAULT NOW(),
	UNIQUE (id_menu, id_paciente)
);

-- Consumo directo de un alimento realizado por un paciente.
CREATE TABLE consumo (
	id_consumo SERIAL PRIMARY KEY,
	id_paciente INTEGER NOT NULL
		REFERENCES paciente(id_usuario) ON DELETE RESTRICT,
	id_alimento INTEGER NOT NULL
		REFERENCES alimento(id_alimento) ON DELETE RESTRICT,
	fecha_hora TIMESTAMP NOT NULL DEFAULT NOW(),
	aceptado BOOLEAN NOT NULL,
	porcentaje_consumido SMALLINT NOT NULL DEFAULT 100
		CHECK (porcentaje_consumido BETWEEN 0 AND 100)
);

-- Valoración nutricional de un paciente respecto a una dieta.
CREATE TABLE valoracion_nutricional (
	id_valoracion SERIAL PRIMARY KEY,
	id_paciente INTEGER NOT NULL
		REFERENCES paciente(id_usuario) ON DELETE RESTRICT,
	id_nutricionista INTEGER NOT NULL
		REFERENCES nutricionista(id_usuario) ON DELETE RESTRICT,
	id_dieta INTEGER NOT NULL
		REFERENCES dieta(id_dieta) ON DELETE RESTRICT,
	id_menu INTEGER REFERENCES menu(id_menu) ON DELETE SET NULL,
	fecha TIMESTAMP NOT NULL DEFAULT NOW(),
	puntuacion NUMERIC(4, 2) NOT NULL
		CHECK (puntuacion BETWEEN 0 AND 100),
	observaciones TEXT,
	tipo tipo_valoracion NOT NULL DEFAULT 'ordinaria',
	id_solicitud_reval INTEGER UNIQUE
		REFERENCES solicitud_revalorizacion(id_solicitud) ON DELETE RESTRICT,
	CHECK (
		(tipo = 'revalorizacion') = (id_solicitud_reval IS NOT NULL)
	)
);