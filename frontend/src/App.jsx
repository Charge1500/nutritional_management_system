import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import  AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    // AuthProvider envuelve todo para que cualquier componente pueda usar useAuth()
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;