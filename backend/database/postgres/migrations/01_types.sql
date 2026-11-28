-- =====================================================================
-- Tipos enumerados compartidos por las entidades del dominio.
-- =====================================================================


-- Dom_estado_cuenta_Paciente
CREATE TYPE estado_cuenta AS ENUM (
    'pendiente',
    'activa'
);

-- Dom_Estado_Solicitud
CREATE TYPE estado_solicitud AS ENUM (
    'pendiente',
    'atendida'
);

-- Dom_Estado_Dieta, Dom_Estado_GrupoNutricional y Dom_Estado_Alimento
CREATE TYPE estado_catalogo AS ENUM (
    'borrador',
    'guardado'
);

-- Dom_Estado_Menu
CREATE TYPE estado_menu AS ENUM (
    'borrador',
    'pendiente',
    'aprobado',
    'rechazado'
);

-- Dom_origen_menu
CREATE TYPE origen_menu AS ENUM (
    'automatico',
    'manual'
);

-- Dom_resultado_revision
CREATE TYPE resultado_revision AS ENUM (
    'aprobado',
    'rechazado'
);

-- Dom_resultado_consumo (el MERX usa {aceptado, rechazado})
CREATE TYPE resultado_consumo AS ENUM (
    'aceptado',
    'rechazado'
);

-- Dom_Tipo_Alimento (tipo de preparación)
CREATE TYPE tipo_preparacion AS ENUM (
    'entrante',
    'plato_fuerte',
    'postre',
    'bebida'
);

-- Dom_Nivel_calorico_Alimento
CREATE TYPE nivel_calorico AS ENUM (
    'bajo',
    'medio',
    'alto'
);

-- Dom_Tipo_Valoracion
CREATE TYPE tipo_valoracion AS ENUM (
    'ordinaria',
    'revalorizacion'
);

-- Tipo de Solicitud de Nutricionista: tipo(menu, alimento)
CREATE TYPE tipo_solicitud_nutricionista AS ENUM (
    'menu',
    'alimento'
);
