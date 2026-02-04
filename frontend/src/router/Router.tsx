import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import SobreNos from '../pages/Sobre';
import Login from '../pages/Login';
import RegistrationPage from '@/pages/Registro';
import { VerifyEmailPage } from '@/pages/Verificar-email';
import EventosGestor from '../pages/gestor/PainelEventosPage';
import Perfil from '../pages/turista/Perfil';
import EventoDashboard from '../pages/gestor/DashboardIngressoEvento';
import ValidarIngresso from '../pages/gestor/ValidarIngressoPage';
import EventDetails from '../pages/event/EventDetails';
import Admin from '../pages/Admin';
import CalendarPage from '../pages/CalendarPage';
import MyTickets from '../pages/MyTickets';
import TicketDetail from '../pages/TicketDetail';

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
      <Route
        path="/gestor/eventos/:id/dashboard"
        element={<EventoDashboard />}
      />
      <Route path="/gestor/validar-ingresso" element={<ValidarIngresso />} />
      <Route path="/eventos/:id" element={<EventDetails />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/events/calendario" element={<CalendarPage />} />
      <Route path="/meus-ingressos" element={<MyTickets />} />
      <Route path="/ingresso/:orderId" element={<TicketDetail />} />
    </Routes>
  );
}
