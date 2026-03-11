import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import { SortAsc, SortDesc, Calendar, Users, Activity } from 'lucide-react';
import StatBox from '../components/StatBox';

const StatsPage = ({ filteredAcoes }) => {
    const [sortBy, setSortBy] = useState('recent'); // 'recent', 'impact', 'alphabetical'

    const sortedAcoes = [...filteredAcoes].sort((a, b) => {
        if (sortBy === 'recent') {
            return new Date(b.data_inicio) - new Date(a.data_inicio);
        }
        if (sortBy === 'impact') {
            return (b.pessoas_atendidas || 0) - (a.pessoas_atendidas || 0);
        }
        if (sortBy === 'alphabetical') {
            return a.titulo.localeCompare(b.titulo);
        }
        return 0;
    });

    const fAtendidos = filteredAcoes.reduce((acc, a) => acc + (Number(a.pessoas_atendidas) || 0), 0);
    const fRealizadas = filteredAcoes.filter(a => a.status === 'realizada').length;
    const fProgramadas = filteredAcoes.filter(a => a.status === 'programada').length;

    // Chart logic
    const chartDataMap = {};
    filteredAcoes.forEach(a => {
        const nome = a.clube?.nome || 'Independentes';
        if (!chartDataMap[nome]) chartDataMap[nome] = { nome, Atendidos: 0 };
        chartDataMap[nome].Atendidos += (Number(a.pessoas_atendidas) || 0);
    });
    const chartData = Object.values(chartDataMap);

    return (
        <div className="p-8 pb-32 w-full max-w-7xl mx-auto animate-fade-in min-h-screen overflow-y-auto">
            <header className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                <div>
                    <h2 className="text-5xl font-black text-slate-800 tracking-tighter uppercase italic">MÉTRICAS</h2>
                    <p className="text-slate-500 mt-2 font-medium text-lg uppercase tracking-widest text-[12px]">Impacto Social em Toledo</p>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* FILTRO DE ORDENAÇÃO */}
                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 shrink-0">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Ordenar:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-slate-50 border-none text-[10px] font-black uppercase text-slate-700 rounded-xl px-4 py-2 outline-none cursor-pointer hover:bg-slate-100 transition-all"
                        >
                            <option value="recent">MAIS RECENTES</option>
                            <option value="impact">MAIOR IMPACTO</option>
                            <option value="alphabetical">A - Z (TÍTULO)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 md:flex md:flex-row gap-4 w-full md:w-auto">
                        <StatBox count={fAtendidos} label="Atendidas" color="bg-indigo-600" />
                        <StatBox count={fRealizadas} label="Ações" color="bg-emerald-500" />
                        <div className="col-span-2 md:col-span-1">
                            <StatBox count={fProgramadas} label="Agenda" color="bg-amber-500" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 h-[500px] flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <Activity size={16} className="text-indigo-500" /> TOP IMPACTO POR CLUBE
                        </h3>
                    </div>
                    <div className="grow w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="nome" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="Atendidos" fill="#6366f1" radius={[12, 12, 0, 0]} maxBarSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
                    <h3 className="text-sm font-black text-slate-800 mb-8 uppercase tracking-widest flex items-center gap-2">
                        <SortDesc size={16} className="text-indigo-500" /> {sortBy === 'impact' ? 'RANKING DE IMPACTO' : 'CRONOGRAMA DE ATIVIDADES'}
                    </h3>
                    <div className="grow overflow-y-auto pr-4 space-y-6">
                        {sortedAcoes.map(a => (
                            <div key={a.id} className="flex gap-6 items-start group">
                                <div className="w-20 h-20 rounded-[2rem] overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-transform border border-slate-100">
                                    <img src={a.fotos?.[0] || 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=200&auto=format&fit=crop'} className="w-full h-full object-cover" />
                                </div>
                                <div className="grow border-b border-slate-50 pb-6 group-last:border-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-black text-slate-800 uppercase text-xs tracking-tight leading-tight group-hover:text-indigo-600 transition-colors uppercase">{a.titulo}</h4>
                                        <div className="flex items-center gap-1 text-slate-400">
                                            <Calendar size={10} />
                                            <span className="text-[9px] font-black uppercase">{format(parseISO(a.data_inicio), 'dd MMM yy')}</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mb-3 font-medium line-clamp-2 uppercase tracking-tight">{a.descricao}</p>
                                    <div className="flex gap-3">
                                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                            <Users size={10} /> {Number(a.pessoas_atendidas || 0)} IMPACTADOS
                                        </span>
                                        <span className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest truncate max-w-[150px]">
                                            {a.clube?.nome || 'INDEPENDENTE'}
                                        </span>
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

export default StatsPage;
