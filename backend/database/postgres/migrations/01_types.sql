-- =====================================================================
-- Tipos enumerados compartidos por las entidades del dominio.
-- =====================================================================

CREATE TYPE rol_usuario AS ENUM (
    'paciente',
    'nutricionista',
    'jefe',
    'administrador'
);

CREATE TYPE estado_solicitud AS ENUM (
    'pendiente',
    'atendida'
);

CREATE TYPE estado_catalogo AS ENUM (
    'borrador',
    'guardado'
);

CREATE TYPE estado_aprobacion AS ENUM (
    'borrador',
    'pendiente',
    'aprobado',
    'rechazado'
);

CREATE TYPE resultado_validacion AS ENUM (
    'aprobado',
    'rechazado'
);

CREATE TYPE tipo_preparacion AS ENUM (
    'entrante',
    'plato_fuerte',
    'postre',
    'bebida'
);

CREATE TYPE nivel_calorico AS ENUM (
    'bajo',
    'medio',
    'alto'
);

CREATE TYPE tipo_valoracion AS ENUM (
    'ordinaria',
    'revalorizacion'
);
