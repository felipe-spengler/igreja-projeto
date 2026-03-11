import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SortDesc, Users, Activity, ChevronRight, TrendingUp, LayoutGrid, List as ListIcon, Info } from 'lucide-react';
import StatBox from '../components/StatBox';

const StatsPage = ({ filteredAcoes }) => {
    const [activeTab, setActiveTab] = useState('visão-geral'); // 'visão-geral', 'listagem'
    const [filterClube, setFilterClube] = useState('todos');
    const [sortBy, setSortBy] = useState('recent');

    // Filtro por Clube (aplica-se a tudo)
    const clubFilteredAcoes = filteredAcoes.filter(a => filterClube === 'todos' || a.clube?.nome === filterClube);

    // Ordenação (para a aba de listagem)
    const sortedAcoes = [...clubFilteredAcoes].sort((a, b) => {
        if (sortBy === 'recent') return new Date(b.data_inicio) - new Date(a.data_inicio);
        if (sortBy === 'impact') return (Number(b.pessoas_atendidas) || 0) - (Number(a.pessoas_atendidas) || 0);
        if (sortBy === 'alphabetical') return a.titulo.localeCompare(b.titulo);
        return 0;
    });

    // Métricas
    const fAtendidos = clubFilteredAcoes.reduce((acc, a) => acc + (Number(a.pessoas_atendidas) || 0), 0);
    const fTotalAcoes = clubFilteredAcoes.length;
    const fRealizadas = clubFilteredAcoes.filter(a => a.status === 'realizada').length;
    const fProgramadas = clubFilteredAcoes.filter(a => a.status === 'programada').length;

    // Dados para os Gráficos
    const chartDataByClube = {};
    clubFilteredAcoes.forEach(a => {
        const nome = a.clube?.nome || 'OUTROS';
        if (!chartDataByClube[nome]) chartDataByClube[nome] = { nome, Atendidos: 0, Ações: 0 };
        chartDataByClube[nome].Atendidos += (Number(a.pessoas_atendidas) || 0);
        chartDataByClube[nome].Ações += 1;
    });
    const barChartData = Object.values(chartDataByClube);

    const pieData = [
        { name: 'Realizadas', value: fRealizadas, color: '#10b981' },
        { name: 'Programadas', value: fProgramadas, color: '#f59e0b' }
    ];

    const clubesDisponiveis = Array.from(new Set(filteredAcoes.map(a => a.clube?.nome).filter(Boolean)));

    return (
        <div className="h-screen flex flex-col bg-slate-50 uppercase tracking-tighter overflow-hidden">
            {/* CABEÇALHO */}
            <header className="p-8 pb-4 bg-white/50 backdrop-blur-md">
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 max-w-7xl mx-auto">
                    <div className="animate-fade-in">
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">MÉTRICAS</h2>
                        <p className="text-slate-500 mt-2 font-black text-[10px] uppercase tracking-widest pl-1">Impacto Social por {filterClube === 'todos' ? 'Toledo' : filterClube}</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        {/* FILTRO POR CLUBE */}
                        <div className="flex items-center gap-2 bg-white p-1 pr-4 rounded-2xl shadow-xl border border-slate-100 w-full md:w-auto overflow-hidden">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-3 shrink-0">Clube</span>
                            <select
                                value={filterClube}
                                onChange={(e) => setFilterClube(e.target.value)}
                                className="bg-slate-50 border-none text-[10px] font-black uppercase text-indigo-600 rounded-xl px-4 py-2 outline-none cursor-pointer w-full md:w-auto"
                            >
                                <option value="todos">VER TODOS</option>
                                {clubesDisponiveis.map(nome => <option key={nome} value={nome}>{nome.toUpperCase()}</option>)}
                            </select>
                        </div>

                        {/* TABS SELETOR */}
                        <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200">
                            <button
                                onClick={() => setActiveTab('visão-geral')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all ${activeTab === 'visão-geral' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                <TrendingUp size={12} /> DASHBOARD
                            </button>
                            <button
                                onClick={() => setActiveTab('listagem')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all ${activeTab === 'listagem' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                <ListIcon size={12} /> LISTAGEM
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
                <div className="max-w-7xl mx-auto">

                    {/* STATS RAPIDOS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatBox count={fAtendidos} label="Impactados" color="bg-indigo-600" />
                        <StatBox count={fTotalAcoes} label="Ações Totais" color="bg-slate-900" />
                        <StatBox count={fRealizadas} label="Realizadas" color="bg-emerald-500" />
                        <StatBox count={fProgramadas} label="Programadas" color="bg-amber-500" />
                    </div>

                    {activeTab === 'visão-geral' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                            {/* GRÁFICO BARRA (2/3 da largura no desktop) */}
                            <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 min-h-[450px] flex flex-col">
                                <h3 className="text-[11px] font-black text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-2">
                                    <Activity size={16} className="text-indigo-500" /> Impacto {filterClube === 'todos' ? 'Geral' : 'do Clube'}
                                </h3>
                                <div className="grow w-full h-[300px]">
                                    <ResponsiveContainer width="99%" height="100%">
                                        <BarChart data={barChartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="nome" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 900 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                                            <Bar dataKey="Atendidos" fill="#6366f1" radius={[12, 12, 0, 0]} maxBarSize={60} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* GRÁFICO PIE (Status) */}
                            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 flex flex-col items-center">
                                <h3 className="text-[11px] font-black text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-2 self-start w-full">
                                    <Info size={16} className="text-emerald-500" /> Distribuição de Status
                                </h3>
                                <div className="grow w-full h-[250px] flex justify-center items-center">
                                    {fTotalAcoes > 0 ? (
                                        <ResponsiveContainer width="99%" height="100%">
                                            <PieChart>
                                                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={10} dataKey="value">
                                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p className="text-slate-300 italic text-[10px] font-black uppercase">Sem dados</p>
                                    )}
                                </div>
                                <div className="w-full space-y-3 mt-4">
                                    {pieData.map(item => (
                                        <div key={item.name} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                            <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div> {item.name}</span>
                                            <span className="text-slate-900">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ABA DE LISTAGEM - MAIS DETALHADA */
                        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border border-slate-100">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <SortDesc size={16} className="text-indigo-500" /> Atividades Filtradas ({clubFilteredAcoes.length})
                                </h3>
                                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 w-full md:w-auto">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-3 shrink-0">Ordenar por</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="bg-white border-none text-[9px] font-black uppercase text-slate-800 rounded-xl px-4 py-2 outline-none cursor-pointer w-full md:w-auto shadow-sm"
                                    >
                                        <option value="recent">MAIS RECENTES</option>
                                        <option value="impact">MAIOR IMPACTO</option>
                                        <option value="alphabetical">ALFABÉTICA (A-Z)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sortedAcoes.map(a => (
                                    <div key={a.id} className="flex gap-6 items-center p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden">
                                        <div className="w-24 h-24 rounded-[2rem] overflow-hidden shrink-0 shadow-lg border border-slate-200 group-hover:scale-105 transition-transform duration-500">
                                            <img src={a.fotos?.[0] || 'https://via.placeholder.com/200'} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="grow min-w-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-black text-slate-900 uppercase text-sm italic tracking-tighter truncate group-hover:text-indigo-600 transition-colors">{a.titulo}</h4>
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg border ${a.status === 'realizada' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{a.status}</span>
                                            </div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">{format(parseISO(a.data_inicio), 'dd MMMM yyyy', { locale: ptBR })}</p>
                                            <div className="flex gap-3 items-center">
                                                <StatTag label={`${Number(a.pessoas_atendidas || 0)} IMPACTADAS`} color="text-indigo-600 bg-indigo-50 border-indigo-100" />
                                                <StatTag label={a.clube?.nome || 'INDEP.'} color="text-slate-400 bg-white border-slate-200" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
            `}} />
        </div>
    );
};

const StatTag = ({ label, color }) => (
    <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black border uppercase italic tracking-tighter shadow-sm shrink-0 truncate max-w-[120px] ${color}`}>
        {label}
    </span>
);

export default StatsPage;
