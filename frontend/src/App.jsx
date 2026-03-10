import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';
import {
  Map as MapIcon, LayoutDashboard, Calendar as CalendarIcon,
  Users, HeartPulse, CheckCircle2, Clock, MapPin, Building
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

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [acoes, setAcoes] = useState([]);
  const [igrejas, setIgrejas] = useState([]);
  const [bairros, setBairros] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [totalAtendidos, setTotalAtendidos] = useState(0);
  const [acoesRealizadas, setAcoesRealizadas] = useState(0);
  const [acoesProgramadas, setAcoesProgramadas] = useState(0);

  const api = axios.create({ baseURL: 'http://localhost:8000/api' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real scenario we'd await Promise.all
      // Fallback data if API fails
      const fallbackAcoes = [
        {
          id: 1, titulo: 'Feira de Saúde', descricao: 'Atendimento médico e nutricional gratuito.',
          lat: -24.7150, lng: -53.7433,
          data_inicio: new Date(Date.now() - 86400000 * 2).toISOString(),
          data_fim: new Date(Date.now() - 86400000 * 1).toISOString(),
          status: 'realizada', pessoas_atendidas: 150,
          clube: { nome: 'Ministério da Mulher', igreja: { nome: 'Igreja Central de Toledo' } },
          bairro: { nome: 'Centro' }
        },
        {
          id: 2, titulo: 'Distribuição de Alimentos', descricao: 'Entrega de cestas básicas na comunidade.',
          lat: -24.7050, lng: -53.7550,
          data_inicio: new Date(Date.now() + 86400000 * 5).toISOString(),
          data_fim: new Date(Date.now() + 86400000 * 5).toISOString(),
          status: 'programada', pessoas_atendidas: 0,
          clube: { nome: 'Aventureiros Estrelas do Oeste', igreja: { nome: 'Igreja Central de Toledo' } },
          bairro: { nome: 'Jardim Coopagro' }
        },
        {
          id: 3, titulo: 'Evangelismo de Impacto', descricao: 'Distribuição de literatura no parque.',
          lat: -24.7199, lng: -53.7400,
          data_inicio: new Date(Date.now() - 86400000 * 10).toISOString(),
          data_fim: new Date(Date.now() - 86400000 * 10).toISOString(),
          status: 'realizada', pessoas_atendidas: 500,
          clube: { nome: 'Clube de Desbravadores', igreja: { nome: 'Igreja Central de Toledo' } },
          bairro: { nome: 'Centro' }
        }
      ];

      const fallbackBairros = [
        {
          id: 1, nome: "Centro", cor: "#ef4444",
          geojson: { type: "Polygon", coordinates: [[[-53.7450, -24.7150], [-53.7350, -24.7150], [-53.7350, -24.7250], [-53.7450, -24.7250], [-53.7450, -24.7150]]] }
        },
        {
          id: 2, nome: "Jardim Coopagro", cor: "#22c55e",
          geojson: { type: "Polygon", coordinates: [[[-53.7550, -24.7050], [-53.7450, -24.7050], [-53.7450, -24.7150], [-53.7550, -24.7150], [-53.7550, -24.7050]]] }
        }
      ];

      let dataAcoes = fallbackAcoes;
      let dataBairros = fallbackBairros;

      try {
        const [acoesRes, bairrosRes, igrejasRes] = await Promise.all([
          api.get('/acoes'), api.get('/bairros'), api.get('/igrejas')
        ]);
        if (acoesRes.data && acoesRes.data.length > 0) dataAcoes = acoesRes.data;
        if (bairrosRes.data && bairrosRes.data.length > 0) dataBairros = bairrosRes.data;
        if (igrejasRes.data) setIgrejas(igrejasRes.data);
      } catch (err) {
        console.log("Using fallback data for preview", err);
      }

      setAcoes(dataAcoes);
      setBairros(dataBairros);

      // Calc stats
      let atendidos = 0;
      let realizadas = 0;
      let programadas = 0;

      dataAcoes.forEach(a => {
        atendidos += (a.pessoas_atendidas || 0);
        if (a.status === 'realizada') realizadas++;
        if (a.status === 'programada') programadas++;
      });

      setTotalAtendidos(atendidos);
      setAcoesRealizadas(realizadas);
      setAcoesProgramadas(programadas);

    } finally {
      setLoading(false);
    }
  };

  const Navbar = () => (
    <nav className="bg-slate-900 text-white w-64 min-h-screen flex flex-col items-center py-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-12 px-4">
        <div className="bg-indigo-500 p-2 rounded-xl">
          <HeartPulse size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight leading-none">Minha Igreja</h1>
          <p className="text-indigo-300 text-xs font-medium uppercase tracking-wider mt-1">Impacto Multi-Igrejas</p>
        </div>
      </div>

      <div className="flex flex-col w-full px-4 gap-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <LayoutDashboard size={20} />
          <span className="font-semibold">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('mapa')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'mapa' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <MapIcon size={20} />
          <span className="font-semibold">Mapa de Ações</span>
        </button>

        <button
          onClick={() => setActiveTab('calendario')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'calendario' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <CalendarIcon size={20} />
          <span className="font-semibold">Calendário</span>
        </button>
      </div>

      <div className="mt-auto px-6 w-full">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-2 uppercase font-bold">Rede Ativa</p>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Building size={16} className="text-indigo-400" />
            <span>Igreja Central de Toledo</span>
          </div>
        </div>
      </div>
    </nav>
  );

  const [filterIgreja, setFilterIgreja] = useState('todas');
  const [filterClube, setFilterClube] = useState('todos');

  const filteredAcoes = acoes.filter(a => {
    const matchIgreja = filterIgreja === 'todas' || a.clube?.igreja_id === parseInt(filterIgreja) || a.clube?.igreja?.nome === filterIgreja;
    const matchClube = filterClube === 'todos' || a.clube_id === parseInt(filterClube) || a.clube?.nome === filterClube;
    return matchIgreja && matchClube;
  });

  const DashboardData = () => {
    // Group chart data by clube
    const chartDataMap = {};
    filteredAcoes.forEach(a => {
      const nome = a.clube?.nome || 'Desconhecido';
      if (!chartDataMap[nome]) chartDataMap[nome] = { nome, Atendidos: 0, Acoes: 0 };
      chartDataMap[nome].Atendidos += (a.pessoas_atendidas || 0);
      chartDataMap[nome].Acoes += 1;
    });
    const chartData = Object.values(chartDataMap);

    const fAtendidos = filteredAcoes.reduce((acc, a) => acc + (a.pessoas_atendidas || 0), 0);
    const fRealizadas = filteredAcoes.filter(a => a.status === 'realizada').length;
    const fProgramadas = filteredAcoes.filter(a => a.status === 'programada').length;

    return (
      <div className="p-8 pb-32 w-full max-w-7xl mx-auto animate-fade-in h-screen overflow-y-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800">Impacto da Rede</h2>
            <p className="text-slate-500 mt-1">Filtrando resultados por igreja e ministério.</p>
          </div>

          <div className="flex flex-wrap gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-col px-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">Igreja</span>
              <select
                value={filterIgreja}
                onChange={(e) => setFilterIgreja(e.target.value)}
                className="bg-slate-50 border-none text-sm font-bold text-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none pr-8"
              >
                <option value="todas">Todas as Igrejas</option>
                {igrejas.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
              </select>
            </div>
            <div className="w-[1px] bg-slate-100 hidden md:block"></div>
            <div className="flex flex-col px-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ministério</span>
              <select
                value={filterClube}
                onChange={(e) => setFilterClube(e.target.value)}
                className="bg-slate-50 border-none text-sm font-bold text-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none pr-8"
              >
                <option value="todos">Todos os Ministérios</option>
                {/* We can unique clubs from all acoes or just show some */}
                {Array.from(new Set(acoes.map(a => a.clube?.nome))).filter(Boolean).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-slate-500 mb-1">Pessoas Impactadas</p>
              <h3 className="text-4xl font-extrabold text-slate-800">{fAtendidos}</h3>
            </div>
            <div className="bg-indigo-100 p-4 rounded-full relative z-10">
              <Users className="text-indigo-600 w-8 h-8" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-slate-500 mb-1">Ações Realizadas</p>
              <h3 className="text-4xl font-extrabold text-emerald-600">{fRealizadas}</h3>
            </div>
            <div className="bg-emerald-100 p-4 rounded-full relative z-10">
              <CheckCircle2 className="text-emerald-600 w-8 h-8" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-slate-500 mb-1">Impactos Agendados</p>
              <h3 className="text-4xl font-extrabold text-amber-500">{fProgramadas}</h3>
            </div>
            <div className="bg-amber-100 p-4 rounded-full relative z-10">
              <Clock className="text-amber-500 w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Charts and Action List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Impacto por Ministério</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="nome" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="Atendidos" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Lista de Ações</h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[400px]">
              {filteredAcoes.length === 0 ? (
                <div className="text-center py-20 text-slate-400 italic">Nenhuma ação encontrada com esses filtros.</div>
              ) : (
                filteredAcoes.map((acao) => (
                  <div key={acao.id} className="flex p-4 rounded-xl border border-slate-100 hover:shadow-md transition-shadow group cursor-pointer bg-slate-50/50">
                    <div className={`mt-1 mr-4 w-3 h-3 rounded-full flex-shrink-0 ${acao.status === 'realizada' ? 'bg-emerald-500' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse'}`}></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors uppercase text-xs">{acao.titulo}</h4>
                        <span className="text-[10px] font-semibold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200 uppercase">
                          {acao.data_inicio ? format(parseISO(acao.data_inicio), "dd MMM", { locale: ptBR }) : ''}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-2 truncate">{acao.descricao}</p>
                      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1 text-slate-600">
                          <Users size={12} /> {acao.pessoas_atendidas || 0} impactadas
                        </span>
                        <span className="flex items-center gap-1 text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {acao.clube?.nome}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MapaInterativo = () => {
    // Calculate actions per neighborhood
    const acoesPorBairro = {};
    filteredAcoes.forEach(a => {
      const bairroName = a.bairro?.nome;
      if (bairroName) {
        acoesPorBairro[bairroName] = (acoesPorBairro[bairroName] || 0) + 1;
      }
    });

    const maxAcoes = Math.max(...Object.values(acoesPorBairro), 1);

    const getDistrictColor = (bairroNome) => {
      const count = acoesPorBairro[bairroNome] || 0;
      if (count === 0) return 'transparent'; // No fill for empty neighborhoods

      // Calculate intensity purely based on count vs max
      const intensity = 0.4 + (count / maxAcoes) * 0.6;
      return `rgba(239, 68, 68, ${intensity})`; // Premium red to match the image better and contrast with black borders
    };

    return (
      <div className="h-full w-full relative z-0 animate-fade-in flex flex-col">
        <div className="bg-white p-4 shadow-sm border-b border-slate-200 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Mapa de Impacto por Bairro</h2>
            <p className="text-sm text-slate-500">Desenho oficial da cidade de Toledo - PR</p>
          </div>
          <div className="flex gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Com Ações
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span> Sem Ações
            </span>
          </div>
        </div>

        <div className="flex-1 w-full" style={{ backgroundColor: '#f8fafc' }}>
          <MapContainer
            center={[-24.7199, -53.7433]} // Toledo, PR Center
            zoom={12}
            className="h-full w-full"
            style={{ backgroundColor: '#f8fafc' }} // Clean slate background instead of map
          >
            {/* TILE LAYER REMOVED: NO OTHER CITIES/STREETS WILL SHOW, ONLY THE SHAPES */}

            {/* Bairros Coloridos (Choropleth) */}
            {bairros.map((bairro) => {
              const countAcoes = acoesPorBairro[bairro.nome] || 0;
              const acoesNoBairro = filteredAcoes.filter(a => a.bairro?.nome === bairro.nome);

              return bairro.geojson && (
                <GeoJSON
                  key={bairro.id}
                  data={bairro.geojson}
                  pathOptions={{
                    fillColor: getDistrictColor(bairro.nome),
                    fillOpacity: countAcoes > 0 ? 0.7 : 0, // totally transparent if 0
                    color: '#000000', // Strong black border!
                    weight: 2, // Thicker border for all so it matches the image
                    opacity: 1 // Full opacity borders
                  }}
                >
                  <Popup className="font-sans min-w-[300px] !rounded-xl">
                    <div className="font-bold text-slate-800 text-lg mb-1">{bairro.nome}</div>
                    <div className="text-xs font-bold text-indigo-700 mb-3 bg-indigo-100 uppercase tracking-widest inline-block px-2 py-1 rounded">
                      {countAcoes} {countAcoes === 1 ? 'Ação Registrada' : 'Ações Registradas'}
                    </div>

                    {countAcoes > 0 ? (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1 mt-2">
                        {acoesNoBairro.map(a => (
                          <div key={a.id} className="text-xs border-b border-slate-100 pb-3 mb-1 last:border-0 last:pb-0 group">
                            <div className="flex items-center gap-2 font-bold text-slate-700 mb-1">
                              <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${a.status === 'realizada' ? 'bg-emerald-500' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'}`}></span>
                              <span className="truncate group-hover:text-indigo-600 transition-colors uppercase">{a.titulo}</span>
                            </div>

                            {a.fotos && a.fotos.length > 0 && (
                              <img src={a.fotos[0]} alt={a.titulo} className="w-full h-24 object-cover rounded-lg mb-2 shadow-sm" />
                            )}

                            <div className="text-slate-500 flex flex-col gap-1 ml-4">
                              <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                                <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{a.pessoas_atendidas} impactadas</span>
                                <span className="text-slate-400">{a.data_inicio ? format(parseISO(a.data_inicio), 'dd/MM/yyyy') : ''}</span>
                              </div>
                              <span className="truncate text-[10px] bg-slate-100 p-1 rounded font-bold text-slate-600 italic">Org: {a.clube?.nome}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">Nenhuma ação solidária vinculada neste bairro ainda com os filtros atuais.</div>
                    )}
                  </Popup>
                </GeoJSON>
              );
            })}
          </MapContainer>
        </div>
      </div >
    );
  };

  const CalendarioEventos = () => {
    // Sort actions by date
    const sortedAcoes = [...filteredAcoes].sort((a, b) => {
      if (!a.data_inicio) return 1;
      if (!b.data_inicio) return -1;
      return new Date(a.data_inicio) - new Date(b.data_inicio);
    });

    const programadas = sortedAcoes.filter(a => a.status === 'programada');
    const realizadas = sortedAcoes.filter(a => a.status === 'realizada');

    return (
      <div className="p-8 pb-32 w-full max-w-5xl mx-auto animate-fade-in h-screen overflow-y-auto">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800">Calendário de Impacto</h2>
            <p className="text-slate-500 mt-1">Planejamento e histórico da rede selecionada.</p>
          </div>
          {/* Filters also in calendar if needed? User might want to see. 
              But they are global state so they apply here too. */}
        </div>

        <div className="space-y-12">
          {/* Próximas Ações */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-2">
              <Clock className="text-amber-500" size={24} />
              <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Eventos Futuros <span className="text-amber-500 font-extrabold">({programadas.length})</span></h3>
            </div>

            <div className="space-y-4">
              {programadas.length === 0 ? (
                <p className="text-slate-400 italic bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">Nenhum evento futuro encontrado para estes filtros.</p>
              ) : (
                programadas.map(acao => (
                  <div key={acao.id} className="bg-white rounded-2xl p-6 shadow-sm border border-l-4 border-slate-100 border-l-amber-500 flex flex-col md:flex-row gap-6 md:items-center transform transition-transform hover:-translate-y-1 hover:shadow-md">
                    <div className="flex flex-col items-center justify-center bg-amber-50 min-w-24 py-3 rounded-xl">
                      <span className="text-amber-600 font-bold uppercase text-xs tracking-wider">{acao.data_inicio ? format(parseISO(acao.data_inicio), 'MMM', { locale: ptBR }) : ''}</span>
                      <span className="text-3xl font-black text-amber-500 leading-none py-1">{acao.data_inicio ? format(parseISO(acao.data_inicio), 'dd') : '--'}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-bold text-slate-800 uppercase tracking-tight">{acao.titulo}</h4>
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Pendente</span>
                      </div>
                      <p className="text-slate-600 text-sm mb-3 line-clamp-2">{acao.descricao}</p>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-300" /> {acao.bairro?.nome || 'Local não definido'}</span>
                        <span className="flex items-center gap-1"><Building size={12} className="text-slate-300" /> {acao.clube?.igreja?.nome || 'Igreja'}</span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end min-w-[150px]">
                      <span className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-black border border-slate-100 uppercase tracking-widest">{acao.clube?.nome}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Histórico Realizado */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-2">
              <CheckCircle2 className="text-emerald-500" size={24} />
              <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Impactos Concluídos <span className="text-emerald-500 font-extrabold">({realizadas.length})</span></h3>
            </div>

            <div className="space-y-4">
              {realizadas.length === 0 ? (
                <p className="text-slate-400 italic bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">Nenhum impacto realizado encontrado.</p>
              ) : (
                realizadas.slice(0, 10).map(acao => (
                  <div key={acao.id} className="bg-slate-50/50 rounded-2xl p-6 border border-l-4 border-slate-200 border-l-emerald-500 flex flex-col md:flex-row gap-6 md:items-center hover:bg-white transition-all shadow-sm">
                    <div className="flex flex-col items-center justify-center bg-emerald-50 min-w-24 py-3 rounded-xl grayscale-[30%]">
                      <span className="text-emerald-700 font-bold uppercase text-xs tracking-wider">{acao.data_inicio ? format(parseISO(acao.data_inicio), 'MMM', { locale: ptBR }) : ''}</span>
                      <span className="text-3xl font-black text-emerald-600 leading-none py-1">{acao.data_inicio ? format(parseISO(acao.data_inicio), 'dd') : '--'}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-bold text-slate-700 uppercase tracking-tight">{acao.titulo}</h4>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Concluído</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><Users size={12} /> {acao.pessoas_atendidas} IMPACTADAS</span>
                        <span className="flex items-center gap-1"><MapPin size={12} /> {acao.bairro?.nome}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    );
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div></div>;

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden text-slate-800">
      <Navbar />
      <main className="flex-1 h-full w-full relative">
        {activeTab === 'dashboard' && <DashboardData />}
        {activeTab === 'mapa' && <MapaInterativo />}
        {activeTab === 'calendario' && <CalendarioEventos />}
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}} />
    </div>
  );
}

export default App;
