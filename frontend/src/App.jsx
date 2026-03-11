import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import api, { API_BASE_URL } from './api';

// PAGES
import PublicHome from './pages/PublicHome';
import LoginPage from './pages/LoginPage';
import RegisterChurch from './pages/RegisterChurch';
import RegisterAction from './pages/RegisterAction';
import StatsPage from './pages/StatsPage';
import CalendarPage from './pages/CalendarPage';
import AdminDashboard from './pages/AdminDashboard';
import LogViewer from './pages/LogViewer';

// COMPONENTS
import Navbar from './components/Navbar';

const useAuth = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    api.post('/logs', {
      action: 'LOGIN',
      description: `User ${userData.name} logged into the system.`,
      status: 'success'
    });
  };
  const logout = () => {
    const u = JSON.parse(localStorage.getItem('user'));
    localStorage.removeItem('user');
    if (u) api.post('/logs', { action: 'LOGOUT', description: `User ${u.name} logged out.`, status: 'success' });
    setUser(null);
  };
  return { user, login, logout, isSuperAdmin: user?.role === 'super_admin' };
};

function App() {
  const auth = useAuth();
  const [acoes, setAcoes] = useState([]);
  const [igrejas, setIgrejas] = useState([]);
  const [bairros, setBairros] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterIgreja, setFilterIgreja] = useState('todas');
  const [filterClube, setFilterClube] = useState('todos');

  useEffect(() => {
    fetchData();
    const interceptorId = api.interceptors.response.use(
      response => response,
      error => {
        if (error.config && !error.config.url.includes('/logs')) {
          api.post('/logs', {
            action: 'API_ERROR',
            description: `Error on ${error.config.method.toUpperCase()} ${error.config.url}: ${error.message}`,
            status: 'failure'
          });
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptorId);
  }, []);

  const fetchData = async () => {
    try {
      const [acoesRes, bairrosRes, igrejasRes] = await Promise.all([
        api.get('/acoes'), api.get('/bairros'), api.get('/igrejas')
      ]).catch(e => {
        console.error("Fetch Data Error", e);
        return [[], [], []];
      });

      setAcoes(Array.isArray(acoesRes?.data) ? acoesRes.data : []);
      setBairros(Array.isArray(bairrosRes?.data) ? bairrosRes.data : []);
      setIgrejas(Array.isArray(igrejasRes?.data) ? igrejasRes.data : []);
    } finally {
      setLoading(false);
    }
  };

  const filteredAcoes = acoes.filter(a => {
    const matchIgreja = filterIgreja === 'todas' || a.clube?.igreja_id === parseInt(filterIgreja) || a.igreja_id === parseInt(filterIgreja);
    const matchClube = filterClube === 'todos' || a.clube?.nome === filterClube;
    return matchIgreja && matchClube && a.status_moderacao === 'aprovada';
  });

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-900 font-black text-white text-4xl tracking-tighter italic animate-pulse">CARREGANDO SISTEMA...</div>;

  return (
    <BrowserRouter>
      <div className="relative h-screen w-full bg-slate-50 font-sans overflow-hidden text-slate-800">
        <main className="h-full w-full relative overflow-y-auto bg-white">
          <Routes>
            <Route path="/" element={<PublicHome
              acoes={acoes} bairros={bairros} filteredAcoes={filteredAcoes}
              filterIgreja={filterIgreja} setFilterIgreja={setFilterIgreja}
              filterClube={filterClube} setFilterClube={setFilterClube}
              igrejas={igrejas}
            />}
            />
            <Route path="/login" element={<LoginPage onLogin={auth.login} />} />
            <Route path="/register-church" element={<RegisterChurch />} />
            <Route path="/register-action" element={<RegisterAction bairros={bairros} igrejas={igrejas} />} />
            <Route path="/stats" element={<StatsPage filteredAcoes={filteredAcoes} />} />
            <Route path="/calendar" element={<CalendarPage filteredAcoes={filteredAcoes} />} />
            <Route path="/admin" element={<AdminDashboard user={auth.user} />} />
            <Route path="/admin/logs" element={<LogViewer />} />
          </Routes>
        </main>

        <Navbar user={auth.user} logout={auth.logout} />

        <style dangerouslySetInnerHTML={{
          __html: `
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                    .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                    .leaflet-popup-content-wrapper { border-radius: 2.5rem !important; overflow: hidden !important; padding: 0 !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4) !important; }
                    .leaflet-popup-content { margin: 0 !important; width: 320px !important; }
                    .leaflet-popup-tip-container { display: none; }
                    body { margin: 0; padding: 0; overflow: hidden; height: 100vh; font-family: 'Outfit', sans-serif; -webkit-font-smoothing: antialiased; }
                    *::-webkit-scrollbar { width: 4px; display: none; }
                    @media (min-width: 1024px) { *::-webkit-scrollbar { display: block; } }
                    *::-webkit-scrollbar-track { background: transparent; }
                    *::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                    @media (max-width: 1024px) {
                      .leaflet-popup-content { width: 260px !important; }
                    }
                    h1, h2, h3, h4 { font-family: 'Outfit', sans-serif; font-weight: 900; letter-spacing: -0.05em; }
                `}} />
      </div>
    </BrowserRouter>
  );
}

export default App;
