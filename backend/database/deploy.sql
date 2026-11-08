-- Script maestro para inicializar la base PostgreSQL.
-- Ejecutar desde psql conectado a menus_db:
--   psql -U menus_user -d menus_db -f backend/database/deploy.sql

\set ON_ERROR_STOP on

BEGIN;

\ir postgres/migrations/01_types.sql
\ir postgres/migrations/02_entities.sql
\ir postgres/migrations/03_relationships.sql
\ir postgres/seeds/01_mock_data.sql

COMMIT;
