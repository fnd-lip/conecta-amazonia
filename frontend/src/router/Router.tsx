import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import SobreNos from '../pages/Sobre';
import Login from '../pages/Login';
import RegistrationPage from '@/pages/Registro';
import { VerifyEmailPage } from '@/pages/Verificar-email';
import EventosGestor from '../pages/gestor/Eventos';
import Perfil from '../pages/turista/Perfil';
import EventDetails from '../pages/EventDetails';
import Admin from '../pages/Admin';
import CalendarPage from '../pages/CalendarPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sobre" element={<SobreNos />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<RegistrationPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/gestor/eventos" element={<EventosGestor />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/eventos/:id" element={<EventDetails />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/events/calendario" element={<CalendarPage />} />
    </Routes>
  );
}
