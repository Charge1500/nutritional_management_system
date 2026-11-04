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

-- Alimentos que contiene cada menú.
CREATE TABLE menu_alimento (
	id_menu INTEGER NOT NULL
		REFERENCES menu(id_menu) ON DELETE CASCADE,
	id_alimento INTEGER NOT NULL
		REFERENCES alimento(id_alimento) ON DELETE RESTRICT,
	PRIMARY KEY (id_menu, id_alimento)
);

-- Parámetro de generación: proporción por tipo de preparación
-- (atributo multivaluado compuesto proporcion_preparacion {tipo, proporcion}).
CREATE TABLE proporcion_menu (
	id_menu INTEGER NOT NULL
		REFERENCES menu(id_menu) ON DELETE CASCADE,
	tipo_preparacion tipo_preparacion NOT NULL,
	proporcion NUMERIC(5, 2) NOT NULL
		CHECK (proporcion BETWEEN 0 AND 100),
	PRIMARY KEY (id_menu, tipo_preparacion)
);

-- Cobertura de grupos nutricionales (Abarca).
CREATE TABLE menu_grupo (
	id_menu INTEGER NOT NULL
		REFERENCES menu(id_menu) ON DELETE CASCADE,
	id_grupo_nutricional INTEGER NOT NULL
		REFERENCES grupo_nutricional(id_grupo_nutricional) ON DELETE RESTRICT,
	PRIMARY KEY (id_menu, id_grupo_nutricional)
);


-- Origina: vincula la solicitud de revalorización con la valoración.
CREATE TABLE origina (
	id_solicitud INTEGER PRIMARY KEY
		REFERENCES solicitud_revalorizacion(id_solicitud) ON DELETE RESTRICT,
	id_valoracion INTEGER NOT NULL UNIQUE
		REFERENCES valoracion_nutricional(id_valoracion) ON DELETE RESTRICT
);
 
-- Índices para las consultas informacionales.
CREATE INDEX idx_menu_dieta ON menu(id_dieta);
CREATE INDEX idx_menu_asignado_menu ON menu_asignado(id_menu);
CREATE INDEX idx_consumo_asignacion ON consumo(id_menu_asignado);
CREATE INDEX idx_consumo_alimento ON consumo(id_alimento);
CREATE INDEX idx_valoracion_asignacion ON valoracion_nutricional(id_menu_asignado);
CREATE INDEX idx_alimento_grupo ON alimento(id_grupo_nutricional);