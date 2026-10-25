import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login/Login';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { ROLES } from '../data/roles';
import { NutritionistHome } from '../pages/Nutritionist/NutritionistHome';
import { DietDetails } from '../pages/Nutritionist/DietDetails';
import { NutritionistFood } from '../pages/Nutritionist/NutritionistFood';
import { FoodDetails } from '../pages/Nutritionist/FoodDetails';
import { FoodForm } from '../pages/Nutritionist/FoodForm';
import { NutritionistMenu } from '../pages/Nutritionist/NutritionistMenu';
import { MenuDetails } from '../pages/Nutritionist/MenuDetails';

import { ReportsHome } from '../pages/Reports/ReportsHome';
import { ReportMenusByDiet } from '../pages/Reports/ReportMenusByDiet';
import { ReportValidatedMenus } from '../pages/Reports/ReportValidatedMenus';

// Componente temporal: cada *compañero* lo sustituye por su página real
const Placeholder = ({ title }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
    <p className="mt-2 text-gray-600">Pantalla en construcción por el equipo.</p>
  </div>
);

export function AppRoutes() {
  return(
  <Routes>
    {/* Rutas públicas */}
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<Navigate to="/login" replace />} />

    {/* 1er nivel: exige sesión. 2do nivel: layout con navbar y sidebar. 3er nivel: exige el rol */}
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>

        {/*Rutas exclusivas para Pacientes*/}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.PACIENTE]} />}>
          <Route path="/paciente" element={<Placeholder title="Dashboard Paciente" />} />
          <Route path="/paciente/menus" element={<Placeholder title="Mis Menús" />} />
          <Route path="/paciente/consumo" element={<Placeholder title="Registrar Consumo" />} />
          <Route path="/paciente/revaloracion" element={<Placeholder title="Solicitar Revaloración" />} />
          <Route path="/paciente/valoraciones" element={<Placeholder title="Mis  Valoraciones" />} />
        </Route>

        {/*Rutas exclusivas para Nutricionistas y Jefe de Nutrición*/}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.NUTRICIONISTA, ROLES.JEFE]} />}>
          <Route path="/nutricionista" element={<NutritionistHome/>} />
          <Route path="/nutricionista/alimentos" element={<NutritionistFood />} />
          <Route path="/nutricionista/alimentos/nuevo" element={<FoodForm/>} />
          <Route path="/nutricionista/ficha-nutricional" element={<Placeholder title="Fichas Nutricionales" />} />
          <Route path="/nutricionista/menus" element={<NutritionistMenu />} />
          <Route path="/nutricionista/menus/nuevo" element={<Placeholder title="Crear Menú" />} />
           <Route path="/nutricionista/menus/:id" element={<MenuDetails />} />
          <Route path="/nutricionista/valoraciones" element={<Placeholder title="Gestión de Valoraciones" />} />
          <Route path="/nutricionista/solicitudes" element={<Placeholder title="Solicitudes de Pacientes" />} />
          <Route path="/nutricionista/dietas/:id"element={<DietDetails/>}/>
          <Route path="/nutricionista/alimentos/:id"element={<FoodDetails/>}/>
        </Route>

        {/*Rutas exclusivas para Jefe de Nutrición*/}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.JEFE]} />}>
          <Route path="/jefe" element={<Placeholder title="Dashboard Jefe" />} />
          <Route path="/jefe/menus" element={<Placeholder title="Validación de Menús" />} />
          <Route path="/jefe/alimentos" element={<Placeholder title="Validación de Alimentos" />} />
          <Route path="/jefe/dietas" element={<Placeholder title="Gestión de Dietas" />} />
          <Route path="/jefe/grupos" element={<Placeholder title="Gestión de Grupos Nutricionales" />} />
        </Route>

        {/*Rutas exclusivas para Admin*/}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route path="/admin" element={<Placeholder title="Dashboard Admin" />} />
          <Route path="/admin/usuarios" element={<Placeholder title="Gestión de Usuarios" />} />
          <Route path="/admin/alimentos" element={<Placeholder title="Auditoría de Alimentos" />} />
          <Route path="/admin/solicitudes" element={<Placeholder title="Auditoría de Solicitudes" />} />
        </Route>

        {/* Ruta compartida por varios roles */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.NUTRICIONISTA, ROLES.JEFE, ROLES.ADMIN]} />}>
          <Route path="/reportes" element={<ReportsHome />} />
          <Route path="/reportes/menus-por-dieta" element={<ReportMenusByDiet />} />
          <Route path="/reportes/menus-validados" element={<ReportValidatedMenus />} />
        </Route>

      </Route>
    </Route>

    {/* Cualquier URL desconocida vuelve al login (que reenvía al dashboard si hay sesión) */}
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);
}
export default AppRoutes;