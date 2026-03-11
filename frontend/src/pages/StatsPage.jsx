import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import { SortDesc, Calendar, Users, Activity, ChevronRight } from 'lucide-react';
import StatBox from '../components/StatBox';

const StatsPage = ({ filteredAcoes }) => {
    const [sortBy, setSortBy] = useState('recent');

    const sortedAcoes = [...filteredAcoes].sort((a, b) => {
        if (sortBy === 'recent') return new Date(b.data_inicio) - new Date(a.data_inicio);
        if (sortBy === 'impact') return (Number(b.pessoas_atendidas) || 0) - (Number(a.pessoas_atendidas) || 0);
        if (sortBy === 'alphabetical') return a.titulo.localeCompare(b.titulo);
        return 0;
    });

    const fAtendidos = filteredAcoes.reduce((acc, a) => acc + (Number(a.pessoas_atendidas) || 0), 0);
    const fRealizadas = filteredAcoes.filter(a => a.status === 'realizada').length;
    const fProgramadas = filteredAcoes.filter(a => a.status === 'programada').length;

    const chartDataMap = {};
    filteredAcoes.forEach(a => {
        const nome = a.clube?.nome || 'OUTROS';
        if (!chartDataMap[nome]) chartDataMap[nome] = { nome, Atendidos: 0 };
        chartDataMap[nome].Atendidos += (Number(a.pessoas_atendidas) || 0);
    });
    const chartData = Object.values(chartDataMap);

    return (
        <div className="p-6 pb-32 w-full max-w-7xl mx-auto animate-fade-in min-h-screen overflow-y-auto custom-scrollbar uppercase tracking-tighter">
            <header className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">MÉTRICAS</h2>
                    <p className="text-slate-500 mt-2 font-black text-[9px] uppercase tracking-widest pl-1">Impacto Social em Toledo</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-1.5 pr-4 rounded-2xl shadow-sm border border-slate-100 w-full md:w-auto">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-3 shrink-0">Ordenar</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-slate-50 border-none text-[9px] font-black uppercase text-slate-800 rounded-xl px-4 py-2 outline-none cursor-pointer w-full md:w-auto"
                        >
                            <option value="recent">RECENTES</option>
                            <option value="impact">IMPACTO</option>
                            <option value="alphabetical">A - Z</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 md:flex md:flex-row gap-3 w-full md:w-auto">
                        <StatBox count={fAtendidos} label="Atendidas" color="bg-indigo-600" />
                        <StatBox count={fRealizadas} label="Ações" color="bg-emerald-500" />
                        <div className="hidden md:block">
                            <StatBox count={fProgramadas} label="Agenda" color="bg-amber-500" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* GRAFICO COM ALTURA MINIMA FIXA PARA CELULAR */}
                <div className="bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-100 min-h-[400px] flex flex-col">
                    <h3 className="text-[10px] font-black text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={14} className="text-indigo-500" /> IMPACTO POR CLUBE
                    </h3>
                    <div className="grow w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="nome" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 7, fontWeight: 900 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 900 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="Atendidos" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-100 flex flex-col">
                    <h3 className="text-[10px] font-black text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-2">
                        <SortDesc size={14} className="text-indigo-500" /> ATIVIDADES REGISTRADAS
                    </h3>
                    <div className="space-y-6">
                        {sortedAcoes.map(a => (
                            <div key={a.id} className="flex gap-5 items-center group border-b border-slate-50 pb-5 last:border-0">
                                <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden shrink-0 shadow-lg border border-slate-100 group-hover:scale-110 transition-transform">
                                    <img src={a.fotos?.[0] || 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=200&auto=format&fit=crop'} className="w-full h-full object-cover" />
                                </div>
                                <div className="grow">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-black text-slate-900 uppercase text-[10px] italic tracking-tight group-hover:text-indigo-600 transition-colors">{a.titulo}</h4>
                                        <span className="text-[8px] font-black text-slate-400 uppercase">{format(parseISO(a.data_inicio), 'dd MMM yy')}</span>
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg text-[8px] font-black border border-emerald-100 shadow-sm">{Number(a.pessoas_atendidas || 0)} ATENDIDAS</span>
                                        <span className="text-[8px] font-black text-slate-400 uppercase italic truncate max-w-[120px]">{a.clube?.nome || 'INDEPENDENTE'}</span>
                                    </div>
                                </div>
                                <ChevronRight className="text-slate-200 group-hover:text-indigo-400 transition-colors" size={16} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 3px; height: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
            `}} />
        </div>
    );
};

export default StatsPage;
