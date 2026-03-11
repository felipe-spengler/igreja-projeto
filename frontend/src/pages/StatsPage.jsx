import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import StatBox from '../components/StatBox';

const StatsPage = ({ filteredAcoes }) => {
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
                    <h2 className="text-5xl font-black text-slate-800 tracking-tighter">Métricas de Impacto</h2>
                    <p className="text-slate-500 mt-2 font-medium text-lg">Acompanhamento das transformações sociais geradas.</p>
                </div>
                <div className="grid grid-cols-2 md:flex md:flex-row gap-4 w-full md:w-auto">
                    <StatBox count={fAtendidos} label="Impactadas" color="bg-indigo-600" />
                    <StatBox count={fRealizadas} label="Realizadas" color="bg-emerald-500" />
                    <div className="col-span-2 md:col-span-1">
                        <StatBox count={fProgramadas} label="Em Agenda" color="bg-amber-500" />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 h-[500px] flex flex-col">
                    <h3 className="text-xl font-bold mb-8 text-slate-800">Impacto por Clube</h3>
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

export default StatsPage;
