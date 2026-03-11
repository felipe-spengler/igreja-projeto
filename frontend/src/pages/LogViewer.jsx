import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { Clock, User, Shield, AlertCircle, CheckCircle } from 'lucide-react';

const LogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/logs');
            setLogs(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-white">Carregando logs de auditoria...</div>;

    return (
        <div className="p-10 h-screen overflow-y-auto bg-slate-900 text-white animate-fade-in">
            <header className="mb-12">
                <h2 className="text-5xl font-black tracking-tighter">Audit Logs</h2>
                <p className="text-indigo-400 mt-2 font-bold text-lg uppercase tracking-widest">Rastreabilidade Total do Sistema (últimos 15 dias)</p>
            </header>

            <div className="bg-slate-800 rounded-[2.5rem] border border-slate-700 overflow-x-auto shadow-2xl">
                <table className="w-full text-left min-w-[800px] lg:min-w-full">
                    <thead>
                        <tr className="border-b border-slate-700 bg-slate-800/50">
                            <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500">Data/Hora</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500">Usuário</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500">Ação</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500">Status</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500">Detalhes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-700/30 transition-all group">
                                <td className="px-8 py-6 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <Clock size={14} className="text-slate-500" />
                                        <span className="text-xs font-bold">{format(parseISO(log.created_at), 'dd/MM/yyyy HH:mm')}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-black">
                                            {log.user?.name?.[0] || 'G'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black">{log.user?.name || 'Visitante'}</span>
                                            <span className="text-[9px] text-indigo-400 uppercase font-bold">{log.user?.role || 'Guest'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-xs font-black px-3 py-1 bg-slate-900 rounded-lg border border-slate-700">{log.action}</span>
                                </td>
                                <td className="px-8 py-6">
                                    {log.status === 'success' ? (
                                        <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-black uppercase">
                                            <CheckCircle size={12} /> Sucesso
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-red-400 text-[10px] font-black uppercase">
                                            <AlertCircle size={12} /> Falha
                                        </div>
                                    )}
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-xs text-slate-400 max-w-md truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:text-slate-200">
                                        {log.description}
                                    </p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LogViewer;
