import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';
import {
  Map as MapIcon, LayoutDashboard, Calendar as CalendarIcon,
  Users, HeartPulse, CheckCircle2, Clock, MapPin, Building,
  LogIn, UserPlus, FilePlus, ChevronRight, CheckCircle, XCircle, Plus
} from 'lucide-react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API_BASE_URL = 'http://localhost:8000/api';
const api = axios.create({ baseURL: API_BASE_URL });

// --- CONTEXT / MOCK AUTH ---
const useAuth = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };
  return { user, login, logout, isSuperAdmin: user?.role === 'super_admin', isAdmin: user?.role === 'admin_igreja' };
};

// --- COMPONENTS ---
const Navbar = ({ user, logout }) => {
  const location = useLocation();
  const isPublic = ['/', '/login', '/register-church', '/register-action'].includes(location.pathname);

  return (
    <nav className="bg-slate-900 text-white w-64 min-h-screen flex flex-col items-center py-8 shadow-2xl shrink-0">
      <div className="flex items-center gap-3 mb-12 px-4">
        <div className="bg-indigo-500 p-2 rounded-xl">
          <HeartPulse size={28} className="text-white" />
        </div>
        <Link to="/">
          <h1 className="text-xl font-bold tracking-tight leading-none">Impacto Toledo</h1>
          <p className="text-indigo-300 text-[10px] font-medium uppercase tracking-wider mt-1">Rede de Solidariedade</p>
        </Link>
      </div>

      <div className="flex flex-col w-full px-4 gap-2">
        <NavLink to="/" icon={<MapIcon size={20} />} label="Mapa de Impacto" active={location.pathname === '/'} />
        <NavLink to="/stats" icon={<LayoutDashboard size={20} />} label="Estatísticas" active={location.pathname === '/stats'} />
        <NavLink to="/calendar" icon={<CalendarIcon size={20} />} label="Calendário" active={location.pathname === '/calendar'} />

        <div className="my-6 border-t border-slate-800 pt-6">
          <p className="text-[10px] text-slate-500 font-bold uppercase px-4 mb-3 tracking-widest">Colabore</p>
          <NavLink to="/register-action" icon={<FilePlus size={18} />} label="Propor Ação" active={location.pathname === '/register-action'} />
          <NavLink to="/register-church" icon={<Building size={18} />} label="Cadastrar Igreja" active={location.pathname === '/register-church'} />
        </div>

        {user ? (
          <div className="mt-8 border-t border-slate-800 pt-6">
            <p className="text-[10px] text-slate-500 font-bold uppercase px-4 mb-3 tracking-widest">Painel Admin</p>
            <NavLink to="/admin" icon={<LayoutDashboard size={18} />} label="Admin Principal" active={location.pathname.startsWith('/admin')} />
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-400 hover:bg-red-500/10 w-full"
            >
              <LogIn size={20} className="rotate-180" />
              <span className="font-semibold">Sair</span>
            </button>
          </div>
        ) : (
          <div className="mt-8 pt-6">
            <NavLink to="/login" icon={<LogIn size={20} />} label="Login Admin" active={location.pathname === '/login'} />
          </div>
        )}
      </div>

      {user && (
        <div className="mt-auto px-6 w-full">
          <div className="bg-indigo-600/20 rounded-2xl p-4 border border-indigo-500/20">
            <p className="text-[10px] text-indigo-300 mb-1 uppercase font-bold tracking-tighter">Logado como</p>
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                {user.name?.[0] || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold truncate">{user.name}</p>
                <p className="text-[9px] text-indigo-400 uppercase font-black">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
  >
    {icon}
    <span className="font-semibold">{label}</span>
  </Link>
);

// --- PAGES ---

// 1. PUBLIC HOME (MAP)
const PublicHome = ({ acoes, bairros, filteredAcoes, filterIgreja, setFilterIgreja, filterClube, setFilterClube, igrejas }) => {
  const acoesPorBairro = {};
  filteredAcoes.forEach(a => {
    const b = a.bairro?.nome;
    if (b) acoesPorBairro[b] = (acoesPorBairro[b] || 0) + 1;
  });

  const getDistrictColor = (bairroNome) => {
    const count = acoesPorBairro[bairroNome] || 0;
    if (count === 0) return 'transparent';
    const maxAcoes = Math.max(...Object.values(acoesPorBairro), 1);
    const intensity = 0.4 + (count / maxAcoes) * 0.6;
    return `rgba(239, 68, 68, ${intensity})`;
  };

  return (
    <div className="h-full w-full relative z-0 animate-fade-in flex flex-col pt-4">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-2xl px-4">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-slate-200/50 flex flex-wrap md:flex-nowrap gap-4 items-center">
          <div className="flex flex-col px-2 grow min-w-[150px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest pl-1">Filtrar por Rede</span>
            <select
              value={filterIgreja}
              onChange={(e) => setFilterIgreja(e.target.value)}
              className="bg-slate-100/50 border-none text-sm font-bold text-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none pr-8 py-2"
            >
              <option value="todas">Todas as Igrejas</option>
              {igrejas.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
            </select>
          </div>
          <div className="w-[1px] h-8 bg-slate-200 hidden md:block"></div>
          <div className="flex flex-col px-2 grow min-w-[150px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest pl-1">Filtrar por Ministério</span>
            <select
              value={filterClube}
              onChange={(e) => setFilterClube(e.target.value)}
              className="bg-slate-100/50 border-none text-sm font-bold text-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none pr-8 py-2"
            >
              <option value="todos">Todos os Ministérios</option>
              {Array.from(new Set(acoes.map(a => a.clube?.nome))).filter(Boolean).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <MapContainer
        center={[-24.7199, -53.7433]}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
        style={{ backgroundColor: '#f8fafc' }}
      >
        {bairros.map((b) => {
          const count = acoesPorBairro[b.nome] || 0;
          const items = filteredAcoes.filter(a => a.bairro?.nome === b.nome);
          return b.geojson && (
            <GeoJSON
              key={b.id}
              data={b.geojson}
              pathOptions={{
                fillColor: getDistrictColor(b.nome),
                fillOpacity: count > 0 ? 0.7 : 0,
                color: '#000000',
                weight: 2,
                opacity: 1
              }}
            >
              <Popup className="font-sans min-w-[300px] !rounded-3xl !p-0 overflow-hidden shadow-2xl">
                <div className="bg-slate-900 text-white p-4">
                  <h4 className="font-bold text-lg">{b.nome}</h4>
                  <p className="text-[10px] text-indigo-300 uppercase font-black uppercase tracking-widest">{count} {count === 1 ? 'Impacto Registrado' : 'Impactos Registrados'}</p>
                </div>
                <div className="p-4 max-h-[300px] overflow-y-auto">
                  {count > 0 ? (
                    <div className="space-y-4">
                      {items.map(a => (
                        <div key={a.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0 group">
                          <div className="flex items-center gap-2 font-bold text-slate-800 mb-2 truncate">
                            <span className={`w-2.5 h-2.5 rounded-full ${a.status === 'realizada' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            <span className="uppercase text-xs">{a.titulo}</span>
                          </div>
                          {a.fotos && a.fotos.length > 0 && (
                            <img src={a.fotos[0]} className="w-full h-32 object-cover rounded-2xl mb-3 shadow-md border border-slate-100" alt={a.titulo} />
                          )}
                          <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase">
                            <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg">{a.pessoas_atendidas} impactadas</span>
                            <span>{a.data_inicio ? format(parseISO(a.data_inicio), 'dd/MM/yyyy') : ''}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 italic text-xs">Nenhuma ação vinculada neste bairro ainda.</div>
                  )}
                </div>
              </Popup>
            </GeoJSON>
          );
        })}
      </MapContainer>
    </div>
  );
};

// 2. LOGIN PAGE
const LoginPage = ({ onLogin }) => {
  const [cred, setCred] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // MOCK AUTH
    const mockUser = {
      name: cred.email.includes('admin') ? 'Admin Igreja' : 'Super Admin',
      email: cred.email,
      role: cred.email.includes('super') ? 'super_admin' : 'admin_igreja',
      igreja_id: cred.email.includes('admin') ? 1 : null
    };
    onLogin(mockUser);
    navigate('/');
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-6 bg-slate-50 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
        <div className="text-center mb-10">
          <div className="bg-indigo-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-200">
            <LogIn className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-slate-800">Painel Restrito</h2>
          <p className="text-slate-500 mt-2 font-medium">Acesse para gerenciar o impacto da sua rede.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">E-mail Corporativo</label>
            <input
              type="email"
              required
              value={cred.email}
              onChange={e => setCred({ ...cred, email: e.target.value })}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all font-bold text-slate-700"
              placeholder="exemplo@email.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Sua Senha</label>
            <input
              type="password"
              required
              value={cred.password}
              onChange={e => setCred({ ...cred, password: e.target.value })}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all font-bold text-slate-700"
              placeholder="••••••••"
            />
          </div>
          <button className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all active:scale-[0.98]">
            Entrar no Sistema
          </button>
          <div className="text-center pt-4">
            <p className="text-xs text-slate-400 italic">Dica: admin@projeto.com ou super@projeto.com</p>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. REGISTER CHURCH (PENDING APPROVAL)
const RegisterChurch = () => {
  const [sent, setSent] = useState(false);
  return (
    <div className="h-full w-full overflow-y-auto p-8 bg-slate-50 animate-fade-in flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-12 border border-slate-100">
        {!sent ? (
          <>
            <div className="mb-10 text-center">
              <Building className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-4xl font-black text-slate-800">Nova Igreja na Rede</h2>
              <p className="text-slate-500 mt-3 font-medium text-lg">Cadastre sua congregação para começar a mapear o impactoo na cidade!</p>
            </div>
            <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormInput label="Nome da Igreja" placeholder="Ex: Central Toledo" />
                <FormInput label="Responsável" placeholder="Pastor ou Diretor" />
                <div className="md:col-span-2">
                  <FormInput label="Endereço Completo" placeholder="Rua, Número, Bairro" />
                </div>
                <FormInput label="Telefone de Contato" placeholder="(45) 99999-9999" />
                <FormInput label="E-mail Principal" placeholder="contato@igreja.com" />
              </div>
              <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 font-medium text-amber-800 text-sm flex gap-4 items-center">
                <Clock className="shrink-0" />
                <p>Ao enviar, seu cadastro passará por análise do Administrador Geral. Você receberá o login por e-mail após a aprovação.</p>
              </div>
              <button className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl hover:bg-black transition-all shadow-xl hover:shadow-black/20">
                Solicitar Cadastro
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-10 animate-fade-in">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-4xl font-black text-slate-800 mb-4">Solicitação Enviada!</h2>
            <p className="text-slate-600 text-lg mb-10 leading-relaxed">
              Obrigado por se juntar à rede. <br />
              Nossa equipe técnica irá revisar os dados e entrar em contato em até 48 horas.
            </p>
            <Link to="/" className="inline-block bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold shadow-xl">Voltar ao Mapa</Link>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. REGISTER ACTION (PUBLIC PROPOSAL)
const RegisterAction = ({ bairros, igrejas }) => {
  const [sent, setSent] = useState(false);
  return (
    <div className="h-full w-full overflow-y-auto p-8 bg-slate-50 animate-fade-in flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl p-12 border border-slate-100">
        {!sent ? (
          <>
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><Plus size={32} /></div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">Propor Impacto Social</h2>
              </div>
              <p className="text-slate-500 text-lg font-medium pr-10">Viu algo inspirador acontecendo ou quer agendar um novo impacto? Registre aqui mesmo sem login!</p>
            </div>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <div className="md:col-span-2">
                <FormInput label="Título da Ação" placeholder="Ex: Entrega de Alimentos" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Vincular à Igreja (Opcional)</label>
                <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:border-indigo-500">
                  <option value="">Não sei ou é iniciativa independente</option>
                  {igrejas.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Bairro do Impacto</label>
                <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:border-indigo-500">
                  {bairros.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                </select>
              </div>
              <FormInput label="Data Sugerida" type="date" />
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Breve Descrição</label>
                <textarea className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 font-bold text-slate-700 outline-none focus:border-indigo-500 min-h-[120px]" placeholder="Conte um pouco sobre o que aconteceu ou o que é planejado..."></textarea>
              </div>
              <div className="md:col-span-2 flex flex-col md:flex-row gap-6 mt-4">
                <div className="flex-1 bg-indigo-50/50 p-6 rounded-3xl border border-dashed border-indigo-200 text-center cursor-pointer hover:bg-indigo-50 transition-all">
                  <Clock className="mx-auto mb-2 text-indigo-400" />
                  <p className="text-xs font-bold text-indigo-600">Sua proposta ficará em análise pelo admin da igreja.</p>
                </div>
                <button className="flex-[2] bg-slate-900 text-white py-6 rounded-3xl font-black text-xl hover:bg-black shadow-xl">Cadastrar Proposta</button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={48} /></div>
            <h2 className="text-4xl font-black text-slate-800 mb-2">Quase lá!</h2>
            <p className="text-slate-500 text-lg mb-10">Sua ação foi enviada e está aguardando vinculação oficial pelo administrador da igreja.</p>
            <Link to="/" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold shadow-xl">Voltar ao Mapa</Link>
          </div>
        )}
      </div>
    </div>
  );
};

const FormInput = ({ label, placeholder, type = "text" }) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">{label}</label>
    <input
      type={type}
      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all font-bold text-slate-700"
      placeholder={placeholder}
    />
  </div>
);

// --- MAIN APP ---
function App() {
  const auth = useAuth(null);
  const [acoes, setAcoes] = useState([]);
  const [igrejas, setIgrejas] = useState([]);
  const [bairros, setBairros] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterIgreja, setFilterIgreja] = useState('todas');
  const [filterClube, setFilterClube] = useState('todos');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [acoesRes, bairrosRes, igrejasRes] = await Promise.all([
        api.get('/acoes'), api.get('/bairros'), api.get('/igrejas')
      ]).catch(e => [[], [], []]);

      setAcoes(acoesRes.data || []);
      setBairros(bairrosRes.data || []);
      setIgrejas(igrejasRes.data || []);
    } finally { setLoading(false); }
  };

  const filteredAcoes = acoes.filter(a => {
    const matchIgreja = filterIgreja === 'todas' || a.clube?.igreja_id === parseInt(filterIgreja) || a.igreja_id === parseInt(filterIgreja);
    const matchClube = filterClube === 'todos' || a.clube?.nome === filterClube;
    // PUBLIC map only shows approved actions
    return matchIgreja && matchClube && a.status_moderacao === 'aprovada';
  });

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-900"><div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-indigo-500"></div></div>;

  return (
    <BrowserRouter>
      <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden text-slate-800">
        <Navbar user={auth.user} logout={auth.logout} />
        <main className="flex-1 h-full relative overflow-hidden">
          <Routes>
            <Route path="/" element={<PublicHome
              acoes={acoes}
              bairros={bairros}
              filteredAcoes={filteredAcoes}
              filterIgreja={filterIgreja} setFilterIgreja={setFilterIgreja}
              filterClube={filterClube} setFilterClube={setFilterClube}
              igrejas={igrejas}
            />}
            />
            <Route path="/login" element={<LoginPage onLogin={auth.login} />} />
            <Route path="/register-church" element={<RegisterChurch />} />
            <Route path="/register-action" element={<RegisterAction bairros={bairros} igrejas={igrejas} />} />
            <Route path="/stats" element={<StatsPage acoes={acoes} filteredAcoes={filteredAcoes} filterIgreja={filterIgreja} setFilterIgreja={setFilterIgreja} filterClube={filterClube} setFilterClube={setFilterClube} igrejas={igrejas} />} />
            <Route path="/calendar" element={<CalendarPage filteredAcoes={filteredAcoes} />} />
            <Route path="/admin" element={<AdminDashboard user={auth.user} acoes={acoes} igrejas={igrejas} />} />
          </Routes>
        </main>

        <style dangerouslySetInnerHTML={{
          __html: `
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                    .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                    .leaflet-popup-content-wrapper { border-radius: 2rem !important; overflow: hidden !important; padding: 0 !important; }
                    .leaflet-popup-content { margin: 0 !important; width: 300px !important; }
                    .leaflet-popup-tip-container { display: none; }
                `}} />
      </div>
    </BrowserRouter>
  );
}

// Stats & Calendar simplified refactors
const StatsPage = ({ filteredAcoes, ...props }) => {
  const fAtendidos = filteredAcoes.reduce((acc, a) => acc + (a.pessoas_atendidas || 0), 0);
  const fRealizadas = filteredAcoes.filter(a => a.status === 'realizada').length;
  const fProgramadas = filteredAcoes.filter(a => a.status === 'programada').length;

  // Chart logic
  const chartDataMap = {};
  filteredAcoes.forEach(a => {
    const nome = a.clube?.nome || 'Ações Independentes';
    if (!chartDataMap[nome]) chartDataMap[nome] = { nome, Atendidos: 0 };
    chartDataMap[nome].Atendidos += (a.pessoas_atendidas || 0);
  });
  const chartData = Object.values(chartDataMap);

  return (
    <div className="p-8 pb-32 w-full max-w-7xl mx-auto animate-fade-in h-screen overflow-y-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-800 tracking-tighter">Impacto Social</h2>
          <p className="text-slate-500 mt-2 font-medium text-lg">Dados em tempo real das congregações participantes.</p>
        </div>
        <div className="flex gap-4">
          <StatBox count={fAtendidos} label="Impactadas" color="bg-indigo-600" />
          <StatBox count={fRealizadas} label="Realizadas" color="bg-emerald-500" />
          <StatBox count={fProgramadas} label="Em Agenda" color="bg-amber-500" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 h-[500px] flex flex-col">
          <h3 className="text-xl font-bold mb-8 text-slate-800">Impacto por Ministério</h3>
          <div className="grow w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="nome" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Bar dataKey="Atendidos" fill="#6366f1" radius={[10, 10, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
          <h3 className="text-xl font-bold mb-8 text-slate-800">Atividades Registradas</h3>
          <div className="grow overflow-y-auto pr-4 space-y-6">
            {filteredAcoes.map(a => (
              <div key={a.id} className="flex gap-6 items-start group">
                <div className="w-20 h-20 rounded-3xl overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                  <img src={a.fotos?.[0] || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" />
                </div>
                <div className="grow border-b border-slate-100 pb-6 group-last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-black text-slate-800 uppercase text-xs tracking-tight">{a.titulo}</h4>
                    <span className="text-[10px] font-black text-slate-400">{format(parseISO(a.data_inicio), 'dd MMM')}</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-3">{a.descricao}</p>
                  <div className="flex gap-4">
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">{a.pessoas_atendidas} Impactadas</span>
                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest truncate">{a.clube?.nome || 'Independente'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ count, label, color }) => (
  <div className="bg-white px-8 py-6 rounded-3xl shadow-xl border border-slate-100 min-w-[140px] text-center">
    <h4 className={`text-3xl font-black mb-1 ${color.replace('bg-', 'text-')}`}>{count}</h4>
    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
  </div>
);

const CalendarPage = ({ filteredAcoes }) => {
  // ... logic simplified
  return (
    <div className="p-8 h-screen overflow-y-auto bg-slate-50">
      <h2 className="text-5xl font-black text-slate-800 tracking-tighter mb-10">Calendário Social</h2>
      <div className="space-y-6 max-w-4xl">
        {filteredAcoes.sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio)).map(a => (
          <div key={a.id} className="bg-white p-8 rounded-[2rem] shadow-xl flex gap-8 items-center border border-slate-100 hover:shadow-2xl transition-all group">
            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex flex-col items-center justify-center border-2 border-slate-100 shrink-0 group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all">
              <span className="text-xs uppercase font-black opacity-60 tracking-widest">{format(parseISO(a.data_inicio), 'MMM', { locale: ptBR })}</span>
              <span className="text-4xl font-black leading-none">{format(parseISO(a.data_inicio), 'dd')}</span>
            </div>
            <div className="grow">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{a.titulo}</h3>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${a.status === 'realizada' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {a.status}
                </span>
              </div>
              <p className="text-slate-500 font-medium line-clamp-2">{a.descricao}</p>
              <div className="flex gap-6 mt-4 opacity-50 text-[10px] font-black uppercase">
                <span className="flex items-center gap-1"><MapPin size={12} /> {a.bairro?.nome}</span>
                <span className="flex items-center gap-1"><Building size={12} /> {a.clube?.igreja?.nome || 'Rede Geral'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = ({ user, acoes, igrejas }) => {
  return (
    <div className="p-10 h-screen overflow-y-auto bg-slate-900 text-white">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black tracking-tighter">Central de Moderação</h2>
          <p className="text-indigo-400 mt-2 font-bold text-lg uppercase tracking-widest">Controle Administrativo Global</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase">Status do Sistema</p>
            <p className="text-emerald-400 font-black">Operacional</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Pending Actions for Admin Moderation */}
        <section className="space-y-6">
          <h3 className="text-2xl font-black flex items-center gap-3"><Clock className="text-amber-400" /> Ações Pendentes ({acoes.filter(a => a.status_moderacao === 'pendente').length})</h3>
          <div className="space-y-4">
            {acoes.filter(a => a.status_moderacao === 'pendente').map(a => (
              <AdminActionCard key={a.id} a={a} />
            ))}
          </div>
        </section>

        {/* Pending Churches (Super Admin only) */}
        {user?.role === 'super_admin' && (
          <section className="space-y-6">
            <h3 className="text-2xl font-black flex items-center gap-3"><Building className="text-indigo-400" /> Novas Igrejas ({igrejas.filter(i => i.status === 'pendente').length})</h3>
            <div className="space-y-4">
              {igrejas.filter(i => i.status === 'pendente').map(i => (
                <div key={i.id} className="bg-slate-800 p-8 rounded-[2.5rem] flex items-center justify-between border border-slate-700 shadow-xl group hover:border-indigo-500 transition-all">
                  <div>
                    <h4 className="text-xl font-black mb-1">{i.nome}</h4>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{i.endereco}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-emerald-500 hover:bg-emerald-600 p-3 rounded-2xl text-white shadow-lg"><CheckCircle /></button>
                    <button className="bg-red-500 hover:bg-red-600 p-3 rounded-2xl text-white shadow-lg"><XCircle /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const AdminActionCard = ({ a }) => (
  <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 flex flex-col md:flex-row gap-8 shadow-xl group hover:border-amber-400/50 transition-all">
    <div className="w-32 h-32 rounded-3xl overflow-hidden shrink-0 border-2 border-slate-700">
      <img src={a.fotos?.[0] || 'https://via.placeholder.com/300'} className="w-full h-full object-cover" />
    </div>
    <div className="grow">
      <h4 className="text-xl font-black mb-2 uppercase tracking-tighter">{a.titulo}</h4>
      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{a.descricao}</p>
      <div className="flex flex-wrap gap-4 text-[9px] font-black uppercase">
        <span className="bg-slate-700 px-3 py-1 rounded-lg text-amber-400 border border-amber-400/20">{a.status}</span>
        <span className="bg-slate-700 px-3 py-1 rounded-lg text-indigo-300">Organizador: {a.clube?.nome || 'Prop. Externa'}</span>
      </div>
      <div className="flex gap-3 mt-6">
        <button className="bg-emerald-500 hover:bg-emerald-600 text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest shadow-lg active:scale-95 transition-all">Vincular e Ativar</button>
        <button className="bg-slate-700 hover:bg-red-500 text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest shadow-lg active:scale-95 transition-all">Arquivar</button>
      </div>
    </div>
  </div>
);

export default App;
