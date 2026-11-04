-- ---------------------------------------------------------------------
-- Usuarios: 1 administrador, 1 jefe, 3 nutricionistas, 12 pacientes
-- ---------------------------------------------------------------------
INSERT INTO usuario (id_usuario, nombre, email, contrasena, fecha_creacion) VALUES
(1,  'Marta Quesada',        'marta.quesada@menus.local',  '$2a$10$njZ.7G/4zsM4z1VrK2VHGe5y0n8OcPuog6NTYIW7ZXliorda4vpmK', '2026-08-01 08:00'),
(2,  'Dr. Alberto Cabrera',  'alberto.cabrera@menus.local','$2a$10$njZ.7G/4zsM4z1VrK2VHGe5y0n8OcPuog6NTYIW7ZXliorda4vpmK', '2026-08-01 08:05'),
(3,  'Lic. Elena Torres',    'elena.torres@menus.local',   '$2a$10$njZ.7G/4zsM4z1VrK2VHGe5y0n8OcPuog6NTYIW7ZXliorda4vpmK', '2026-08-01 08:10'),
(4,  'Lic. Raimundo Peña',   'raimundo.pena@menus.local',  '$2a$10$njZ.7G/4zsM4z1VrK2VHGe5y0n8OcPuog6NTYIW7ZXliorda4vpmK', '2026-08-01 08:15'),
(5,  'Lic. Sofía Valdés',    'sofia.valdes@menus.local',   '$2a$10$njZ.7G/4zsM4z1VrK2VHGe5y0n8OcPuog6NTYIW7ZXliorda4vpmK', '2026-08-01 08:20'),
(6,  'Ana Pérez',            'ana.perez@menus.local',      '$2a$10$njZ.7G/4zsM4z1VrK2VHGe5y0n8OcPuog6NTYIW7ZXliorda4vpmK', '2026-08-05 09:00'),
(7,  'Bruno Díaz',           'bruno.diaz@menus.local',     '$2a$10$njZ.7G/4zsM4z1VrK2VHGe5y0n8OcPuog6NTYIW7ZXliorda4vpmK', '2026-08-05 09:10'),
(8,  'Carla Gómez',          'carla.gomez@menus.local',    '$2a$10$njZ.7G/4zsM4z1VrK2VHGe5y0n8OcPuog6NTYIW7ZXliorda4vpmK', '2026-08-05 09:20'),
(9,  'Daniel Ruiz',          'daniel.ruiz@menus.local',    '$2a$10$njZ.7G/4zsM4z1VrK2VHGe5y0n8OcPuog6NTYIW7ZXliorda4vpmK', '2026-08-06 09:00'),
(10, 'Elisa Marín',          'elisa.marin@menus.local',    '$2a$10$njZ.7G/4zsM4z1VrK2VHGe5y0n8OcPuog6NTYIW7ZXliorda4vpmK', '2026-08-06 09:10'),
(11, 'Fabio León',           'fabio.leon@menus.local',     '$2a$10$njZ.7G/4zsM4z1VrK2VHGe5y0n8OcPuog6NTYIW7ZXliorda4vpmK', '2026-08-06 09:20'),
(12, 'Gloria Sosa',          'gloria.sosa@menus.local',    '$2a$10$njZ.7G/4zsM4z1VrK2VHGe5y0n8OcPuog6NTYIW7ZXliorda4vpmK', '2026-08-07 09:00'),
(13, 'Héctor Varela',        'hector.varela@menus.local',  '$2a$10$njZ.7G/4zsM4z1VrK2VHGe5y0n8OcPuog6NTYIW7ZXliorda4vpmK', '2026-08-07 09:10'),
(14, 'Irene Castro',         'irene.castro@menus.local',   '$2a$10$njZ.7G/4zsM4z1VrK2VHGe5y0n8OcPuog6NTYIW7ZXliorda4vpmK', '2026-08-07 09:20'),
(15, 'Julio Ortega',         'julio.ortega@menus.local',   '$2a$10$njZ.7G/4zsM4z1VrK2VHGe5y0n8OcPuog6NTYIW7ZXliorda4vpmK', '2026-08-07 09:30'),
(16, 'Karina Núñez',         'karina.nunez@menus.local',   NULL,                                                         '2026-10-20 10:00'),
(17, 'Leandro Mesa',         'leandro.mesa@menus.local',   NULL,                                                         '2026-10-20 10:05');
 
INSERT INTO administrador (id_usuario) VALUES (1);
 
INSERT INTO nutricionista (id_usuario, especialidad) VALUES
(2, 'Nutrición clínica'),
(3, 'Control de peso'),
(4, 'Nutrición cardiovascular'),
(5, 'Nutrición deportiva');
 
INSERT INTO jefe (id_usuario) VALUES (2);
 
-- Pacientes 6-15 activos (6, 7, 8 y 12 registrados por un nutricionista,
-- el resto creados por el administrador); 16 y 17 pendientes de activación.
INSERT INTO paciente (id_usuario, edad, sala, estado_cuenta, id_nutri_registra, fecha_registro) VALUES
(6,  34, 'Sala A', 'activa',    3,    '2026-08-05 08:50'),
(7,  52, 'Sala A', 'activa',    3,    '2026-08-05 09:00'),
(8,  61, 'Sala A', 'activa',    4,    '2026-08-05 09:10'),
(9,  47, 'Sala B', 'activa',    NULL, NULL),
(10, 58, 'Sala B', 'activa',    NULL, NULL),
(11, 66, 'Sala B', 'activa',    NULL, NULL),
(12, 29, 'Sala C', 'activa',    5,    '2026-08-07 08:50'),
(13, 41, 'Sala C', 'activa',    NULL, NULL),
(14, 38, 'Sala C', 'activa',    NULL, NULL),
(15, 55, 'Sala C', 'activa',    NULL, NULL),
(16, 44, 'Sala A', 'pendiente', 3,    '2026-10-20 10:00'),
(17, 72, 'Sala B', 'pendiente', 4,    '2026-10-20 10:05');
 
-- ---------------------------------------------------------------------
-- Dietas y grupos nutricionales
-- ---------------------------------------------------------------------
INSERT INTO dieta (id_dieta, nombre_dieta, programa, fecha_creacion, estado) VALUES
(1, 'Hipocalórica',          'Control de peso',        '2026-08-10 10:00', 'guardado'),
(2, 'Diabética',             'Enfermedades crónicas',  '2026-08-10 10:10', 'guardado'),
(3, 'Hiposódica',            'Cardiovascular',         '2026-08-10 10:20', 'guardado'),
(4, 'Alta en proteínas',     'Rehabilitación',         '2026-08-10 10:30', 'guardado');
 
INSERT INTO grupo_nutricional (id_grupo_nutricional, nombre_grupo, descripcion, estado, fecha_creacion) VALUES
(1, 'Cereales y tubérculos',       'Arroz, viandas, pan y derivados',         'guardado', '2026-08-08 09:00'),
(2, 'Verduras y hortalizas',       'Vegetales frescos o cocidos',             'guardado', '2026-08-08 09:00'),
(3, 'Frutas',                      'Frutas frescas y jugos naturales',        'guardado', '2026-08-08 09:00'),
(4, 'Lácteos',                     'Leche, yogur y derivados',                'guardado', '2026-08-08 09:00'),
(5, 'Carnes, pescados y huevos',   'Fuentes de proteína animal',              'guardado', '2026-08-08 09:00'),
(6, 'Legumbres',                   'Frijoles, lentejas, chícharos',           'guardado', '2026-08-08 09:00'),
(7, 'Grasas y dulces',             'Postres y productos azucarados',          'guardado', '2026-08-08 09:00'),
(8, 'Bebidas e infusiones',        'Infusiones y bebidas sin lácteos',        'guardado', '2026-08-08 09:00');
 
-- Cubre: grupos que cubre cada dieta.
INSERT INTO dieta_grupo (id_dieta, id_grupo_nutricional) VALUES
(1, 2), (1, 3), (1, 4), (1, 5), (1, 8),
(2, 1), (2, 2), (2, 5), (2, 6), (2, 4), (2, 3), (2, 8),
(3, 2), (3, 3), (3, 5), (3, 8), (3, 1),
(4, 4), (4, 5), (4, 6), (4, 1), (4, 7);
 
-- Atiende: autorizaciones de los nutricionistas (el jefe atiende todas).
INSERT INTO nutricionista_dieta (id_nutricionista, id_dieta) VALUES
(2, 1), (2, 2), (2, 3), (2, 4),
(3, 1), (3, 2),
(4, 2), (4, 3),
(5, 1), (5, 3), (5, 4);
 
-- Inscrito: solo pacientes activos.
INSERT INTO inscripcion_dieta (id_paciente, id_dieta) VALUES
(6, 1), (7, 1), (8, 1), (8, 3), (9, 2), (10, 2), (11, 2), (11, 3),
(12, 3), (13, 4), (14, 4), (15, 1), (15, 4);
 
-- ---------------------------------------------------------------------
-- Alimentos: 20 simples (1-20) y 4 platos compuestos (21-24)
-- ---------------------------------------------------------------------
INSERT INTO alimento (id_alimento, nombre_alimento, tipo_preparacion, nivel_calorico, estado, fecha_creacion, id_grupo_nutricional, id_creador) VALUES
(1,  'Ensalada de lechuga y tomate',     'entrante',     'bajo',  'guardado', '2026-08-12 10:00', 2, 3),
(2,  'Sopa de verduras',                 'entrante',     'bajo',  'guardado', '2026-08-12 10:05', 2, 3),
(3,  'Caldo de pollo',                   'entrante',     'bajo',  'guardado', '2026-08-12 10:10', 5, 4),
(4,  'Arroz blanco',                     'plato_fuerte', 'medio', 'guardado', '2026-08-12 10:15', 1, 3),
(5,  'Pechuga de pollo a la plancha',    'plato_fuerte', 'bajo',  'guardado', '2026-08-12 10:20', 5, 4),
(6,  'Pescado al vapor',                 'plato_fuerte', 'bajo',  'guardado', '2026-08-12 10:25', 5, 4),
(7,  'Puré de papa',                     'plato_fuerte', 'medio', 'guardado', '2026-08-12 10:30', 1, 5),
(8,  'Frijoles negros',                  'plato_fuerte', 'medio', 'guardado', '2026-08-12 10:35', 6, 5),
(9,  'Lentejas guisadas',                'plato_fuerte', 'medio', 'guardado', '2026-08-12 10:40', 6, 5),
(10, 'Cerdo asado',                      'plato_fuerte', 'alto',  'guardado', '2026-08-12 10:45', 5, 5),
(11, 'Viandas hervidas',                 'plato_fuerte', 'medio', 'guardado', '2026-08-12 10:50', 1, 3),
(12, 'Vegetales salteados',              'plato_fuerte', 'bajo',  'guardado', '2026-08-12 10:55', 2, 4),
(13, 'Tortilla de huevo',                'plato_fuerte', 'medio', 'guardado', '2026-08-12 11:00', 5, 5),
(14, 'Guayaba fresca',                   'postre',       'bajo',  'guardado', '2026-08-12 11:05', 3, 3),
(15, 'Yogur natural',                    'postre',       'bajo',  'guardado', '2026-08-12 11:10', 4, 4),
(16, 'Flan',                             'postre',       'alto',  'guardado', '2026-08-12 11:15', 7, 5),
(17, 'Dulce de coco',                    'postre',       'alto',  'guardado', '2026-08-12 11:20', 7, 5),
(18, 'Jugo de naranja natural',          'bebida',       'medio', 'guardado', '2026-08-12 11:25', 3, 3),
(19, 'Té de manzanilla',                 'bebida',       'bajo',  'guardado', '2026-08-12 11:30', 8, 3),
(20, 'Leche descremada',                 'bebida',       'bajo',  'guardado', '2026-08-12 11:35', 4, 4),
(21, 'Arroz con pollo',                  'plato_fuerte', 'alto',  'guardado', '2026-08-13 10:00', 1, 5),
(22, 'Potaje de lentejas con vegetales', 'plato_fuerte', 'medio', 'guardado', '2026-08-13 10:10', 6, 4),
(23, 'Ensalada mixta con huevo',         'entrante',     'medio', 'guardado', '2026-08-13 10:20', 2, 3),
(24, 'Arroz con leche',                  'postre',       'alto',  'guardado', '2026-08-13 10:30', 1, 5);
 
INSERT INTO alimento_simple (id_alimento) SELECT g FROM generate_series(1, 20) g;
INSERT INTO plato_compuesto (id_alimento) SELECT g FROM generate_series(21, 24) g;
 
INSERT INTO plato_ingrediente (id_plato, id_ingrediente) VALUES
(21, 4), (21, 5),
(22, 9), (22, 12),
(23, 1), (23, 13),
(24, 4), (24, 20);
 
-- Restringe/cubre: límites por dieta para algunos alimentos.
INSERT INTO dieta_alimento (id_dieta, id_alimento, cantidad_minima, cantidad_maxima) VALUES
(1, 16, 0, 0),
(1, 17, 0, 0),
(2, 17, 0, 0),
(2, 18, 0, 1),
(3, 10, 0, 1),
(4, 5,  1, 2);
 
-- ---------------------------------------------------------------------
-- Menús
-- Los menús automáticos llevan sus tres parámetros (cantidad total,
-- proporción por tipo que suma 100 y cobertura de grupos). El estado de
-- cada menú ya refleja el resultado de su última revisión.
-- ---------------------------------------------------------------------
INSERT INTO menu (id_menu, nombre_menu, id_dieta, id_creador, fecha_creacion, estado, origen, id_jefe_indica, cantidad_total_alimentos) VALUES
(1,  'Hipocalórico - Semana 1',       1, 3, '2026-09-14 09:00', 'aprobado', 'automatico', NULL, 8),
(2,  'Hipocalórico - Semana 2',       1, 5, '2026-09-15 09:00', 'aprobado', 'automatico', NULL, 8),
(3,  'Hipocalórico reforzado',        1, 5, '2026-09-16 09:00', 'aprobado', 'manual',     2,    NULL),
(4,  'Diabética - Plan base',         2, 3, '2026-09-14 10:00', 'aprobado', 'automatico', NULL, 8),
(5,  'Diabética - Plan legumbres',    2, 4, '2026-09-15 10:00', 'aprobado', 'automatico', NULL, 8),
(6,  'Diabética - Plan en revisión',  2, 4, '2026-10-26 10:00', 'pendiente', 'automatico', NULL, 8),
(7,  'Hiposódica - Plan base',        3, 5, '2026-09-14 11:00', 'aprobado', 'automatico', NULL, 8),
(8,  'Hiposódica - Borrador',         3, 4, '2026-10-27 11:00', 'borrador',  'automatico', NULL, 8),
(9,  'Proteica - Plan base',          4, 5, '2026-09-14 12:00', 'aprobado', 'automatico', NULL, 8),
(10, 'Proteica indicada por el jefe', 4, 5, '2026-09-17 12:00', 'aprobado', 'manual',     2,    NULL);
 
-- Parámetro: proporción por tipo de preparación (suma 100).
INSERT INTO proporcion_menu (id_menu, tipo_preparacion, proporcion)
SELECT m.id_menu, t.tipo::tipo_preparacion, t.p
FROM menu m
CROSS JOIN (VALUES ('entrante', 25), ('plato_fuerte', 40), ('postre', 20), ('bebida', 15)) AS t(tipo, p)
WHERE m.origen = 'automatico';
 
-- Parámetro: cobertura de grupos (Abarca), siempre dentro de los que cubre la dieta.
INSERT INTO menu_grupo (id_menu, id_grupo_nutricional) VALUES
(1, 2), (1, 3), (1, 5),
(2, 2), (2, 4), (2, 5),
(4, 1), (4, 2), (4, 5),
(5, 2), (5, 6), (5, 4),
(6, 1), (6, 2), (6, 5),
(7, 2), (7, 3), (7, 5),
(8, 2), (8, 5),
(9, 4), (9, 5), (9, 6);
 
-- Composición real (Contiene). Los menús manuales (3 y 10) no tienen
-- parámetros y pueden contener cualquier número de alimentos.
INSERT INTO menu_alimento (id_menu, id_alimento) VALUES
(1, 1), (1, 2), (1, 5), (1, 12), (1, 6), (1, 14), (1, 15), (1, 19),
(2, 2), (2, 23), (2, 6), (2, 8), (2, 12), (2, 14), (2, 15), (2, 20),
(3, 1), (3, 3), (3, 5), (3, 12), (3, 14), (3, 19),
(4, 2), (4, 3), (4, 5), (4, 6), (4, 12), (4, 15), (4, 14), (4, 19),
(5, 1), (5, 2), (5, 9), (5, 12), (5, 8), (5, 14), (5, 15), (5, 20),
(6, 2), (6, 23), (6, 5), (6, 11), (6, 12), (6, 14), (6, 15), (6, 19),
(7, 2), (7, 23), (7, 6), (7, 7), (7, 11), (7, 14), (7, 18), (7, 19),
(8, 2), (8, 23), (8, 6), (8, 12), (8, 11), (8, 14), (8, 15), (8, 19),
(9, 3), (9, 13), (9, 10), (9, 5), (9, 9), (9, 15), (9, 16), (9, 20),
(10, 3), (10, 13), (10, 5), (10, 22), (10, 15), (10, 20);
 
-- ---------------------------------------------------------------------
-- Revisiones del jefe 
-- El menú 4 se rechaza, se corrige y se aprueba: historial de 2 revisiones.
-- Los menús 6 (pendiente) y 8 (borrador) no tienen revisiones.
-- ---------------------------------------------------------------------
INSERT INTO revision_menu (id_menu, num_revision, id_jefe, fecha_revision, resultado, observaciones) VALUES
(1, 1, 2, '2026-09-15 10:00', 'aprobado',  NULL),
(2, 1, 2, '2026-09-16 10:00', 'aprobado',  'Buen equilibrio entre grupos.'),
(3, 1, 2, '2026-09-17 10:00', 'aprobado',  NULL),
(4, 1, 2, '2026-09-15 11:00', 'rechazado', 'Falta variedad en los postres.'),
(4, 2, 2, '2026-09-17 11:00', 'aprobado',  'Corregido: se añadió fruta y yogur.'),
(5, 1, 2, '2026-09-16 11:00', 'aprobado',  NULL),
(7, 1, 2, '2026-09-15 12:00', 'aprobado',  NULL),
(9, 1, 2, '2026-09-15 13:00', 'aprobado',  NULL),
(10,1, 2, '2026-09-18 10:00', 'aprobado',  'Atiende el criterio indicado por el jefe.');

-- ---------------------------------------------------------------------
-- Asignaciones: cada paciente recibe, en dos fechas, los menús aprobados
-- de las dietas en las que está inscrito.
-- ---------------------------------------------------------------------
INSERT INTO menu_asignado (id_menu, id_paciente, id_nutricionista, fecha_asignacion)
SELECT m.id_menu, i.id_paciente,
       (SELECT min(nd.id_nutricionista) FROM nutricionista_dieta nd
        WHERE nd.id_dieta = m.id_dieta AND nd.id_nutricionista <> 2),
       f.fecha
FROM inscripcion_dieta i
JOIN menu m ON m.id_dieta = i.id_dieta AND m.estado = 'aprobado'
CROSS JOIN (VALUES (DATE '2026-10-05'), (DATE '2026-10-12')) AS f(fecha);
 
-- ---------------------------------------------------------------------
-- Consumos: cada alimento del menú se consume el día de la asignación y
-- el siguiente. El resultado es pseudoaleatorio pero reproducible; los
-- alimentos de nivel alto tienden a rechazarse más, para que la demanda 6
-- tenga algo que mostrar.
-- ---------------------------------------------------------------------
INSERT INTO consumo (id_menu_asignado, id_alimento, fecha_hora, resultado)
SELECT ma.id_menu_asignado, mal.id_alimento,
       (ma.fecha_asignacion + d.dia) + CASE a.tipo_preparacion
            WHEN 'entrante' THEN TIME '12:30' WHEN 'plato_fuerte' THEN TIME '13:00'
            WHEN 'postre' THEN TIME '13:40' ELSE TIME '13:10' END,
       CASE WHEN (abs(hashtext(ma.id_menu_asignado::text || '-' || mal.id_alimento || '-' || d.dia)) % 100)
                 < CASE a.nivel_calorico WHEN 'bajo' THEN 80 WHEN 'medio' THEN 60 ELSE 35 END
            THEN 'aceptado'::resultado_consumo ELSE 'rechazado'::resultado_consumo END
FROM menu_asignado ma
JOIN menu_alimento mal ON mal.id_menu = ma.id_menu
JOIN alimento a ON a.id_alimento = mal.id_alimento
CROSS JOIN (VALUES (0), (1)) AS d(dia);
 
-- ---------------------------------------------------------------------
-- Valoraciones ordinarias: una por asignación del 5 de octubre, hecha por
-- el nutricionista que asignó. La puntuación mock sale de la proporción de
-- consumos aceptados (en la aplicación la asigna el nutricionista).
-- ---------------------------------------------------------------------
INSERT INTO valoracion_nutricional (id_menu_asignado, id_nutricionista, fecha, puntuacion, observaciones, tipo)
SELECT ma.id_menu_asignado, ma.id_nutricionista,
       ma.fecha_asignacion + TIME '18:00' + INTERVAL '2 days',
       GREATEST(1, LEAST(100, (30 + 70 * avg((c.resultado = 'aceptado')::int))::int
            + (abs(hashtext(ma.id_menu_asignado::text)) % 11) - 5)),
       NULL,
       'ordinaria'
FROM menu_asignado ma
JOIN consumo c USING (id_menu_asignado)
WHERE ma.fecha_asignacion = DATE '2026-10-05'
GROUP BY ma.id_menu_asignado, ma.id_nutricionista, ma.fecha_asignacion;
 
-- ---------------------------------------------------------------------
-- Solicitudes
--  * 3 solicitudes de revalorización: pacientes 6, 9 y 13. La del 9 sigue
--    pendiente; las otras ya tienen su valoración (Origina).
--  * 2 solicitudes de nutricionista a nutricionista.
-- ---------------------------------------------------------------------
INSERT INTO solicitud (id_solicitud, id_remitente, id_destinatario, fecha_solicitud, estado, descripcion) VALUES
(1, 6,  3, '2026-10-14 09:00', 'pendiente', 'No estoy de acuerdo con la última valoración.'),
(2, 9,  4, '2026-10-30 09:30', 'pendiente', 'Solicito revisar mi plan nutricional.'),
(3, 13, 5, '2026-10-15 10:00', 'pendiente', 'Quisiera una nueva evaluación.'),
(4, 3,  2, '2026-10-01 08:00', 'pendiente', 'Necesito un menú proteico para pacientes de rehabilitación.'),
(5, 4,  5, '2026-10-02 08:30', 'pendiente', 'Falta registrar un alimento bajo en sodio.');
 
INSERT INTO solicitud_revalorizacion (id_solicitud) VALUES (1), (2), (3);
INSERT INTO solicitud_nutricionista (id_solicitud, tipo) VALUES (4, 'menu'), (5, 'alimento');
 
-- Valoraciones de revalorización (sobre la asignación del 12 de octubre)
-- para las solicitudes 1 y 3; la solicitud 2 queda pendiente.
INSERT INTO valoracion_nutricional (id_menu_asignado, id_nutricionista, fecha, puntuacion, observaciones, tipo)
SELECT ma.id_menu_asignado, x.nutri, x.fecha, x.punt, x.obs, 'revalorizacion'
FROM (VALUES (6,  1, 3, TIMESTAMP '2026-10-16 15:00', 82, 'Revalorización manual: mejora clara.'),
             (13, 9, 5, TIMESTAMP '2026-10-17 15:00', 58, 'Revalorización manual: poca adherencia.')) AS x(pac, menu, nutri, fecha, punt, obs)
JOIN menu_asignado ma ON ma.id_paciente = x.pac AND ma.id_menu = x.menu
                      AND ma.fecha_asignacion = DATE '2026-10-12';
 
INSERT INTO origina (id_solicitud, id_valoracion)
SELECT 1, v.id_valoracion FROM valoracion_nutricional v
JOIN menu_asignado ma USING (id_menu_asignado)
WHERE v.tipo = 'revalorizacion' AND ma.id_paciente = 6;
INSERT INTO origina (id_solicitud, id_valoracion)
SELECT 3, v.id_valoracion FROM valoracion_nutricional v
JOIN menu_asignado ma USING (id_menu_asignado)
WHERE v.tipo = 'revalorizacion' AND ma.id_paciente = 13;
 
-- ---------------------------------------------------------------------
-- Reajustar secuencias tras los inserts con id explícito.
-- ---------------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('usuario', 'id_usuario'),               (SELECT max(id_usuario) FROM usuario));
SELECT setval(pg_get_serial_sequence('dieta', 'id_dieta'),                   (SELECT max(id_dieta) FROM dieta));
SELECT setval(pg_get_serial_sequence('grupo_nutricional', 'id_grupo_nutricional'), (SELECT max(id_grupo_nutricional) FROM grupo_nutricional));
SELECT setval(pg_get_serial_sequence('alimento', 'id_alimento'),             (SELECT max(id_alimento) FROM alimento));
SELECT setval(pg_get_serial_sequence('menu', 'id_menu'),                     (SELECT max(id_menu) FROM menu));
SELECT setval(pg_get_serial_sequence('solicitud', 'id_solicitud'),           (SELECT max(id_solicitud) FROM solicitud));
SELECT setval(pg_get_serial_sequence('menu_asignado', 'id_menu_asignado'),   (SELECT max(id_menu_asignado) FROM menu_asignado));
SELECT setval(pg_get_serial_sequence('consumo', 'id_consumo'),               (SELECT max(id_consumo) FROM consumo));
SELECT setval(pg_get_serial_sequence('valoracion_nutricional', 'id_valoracion'), (SELECT max(id_valoracion) FROM valoracion_nutricional));