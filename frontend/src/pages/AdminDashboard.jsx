import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api';
import { Clock, Building, CheckCircle, XCircle, LayoutDashboard, Database, Shield } from 'lucide-react';
import AdminActionCard from '../components/AdminActionCard';
import { Link } from 'react-router-dom';

const AdminDashboard = ({ user }) => {
    const [data, setData] = useState({ acoes_pendentes: [], igrejas_pendentes: [], metricas: {} });
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('moderation'); // moderation, my_actions

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const res = await api.get('/admin/resumo');
            setData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveAction = async (id, updatedData = {}) => {
        try {
            // Need to specify a club_id if it's currently null
            const payload = updatedData.clube_id ? updatedData : { ...updatedData, clube_id: 1 }; // Default for dummy
            await api.patch(`/acoes/${id}/vincular`, payload);
            fetchAdminData();
        } catch (error) {
            console.error(error);
            alert('Erro ao aprovar ação.');
        }
    };

    const handleApproveChurch = async (id) => {
        try {
            await api.patch(`/igrejas/${id}/aprovar`);
            fetchAdminData();
        } catch (error) {
            console.error(error);
            alert('Erro ao aprovar igreja.');
        }
    };

    if (loading) return <div className="p-10 text-white bg-slate-900 h-screen font-black text-2xl">Carregando painel administrativo...</div>;

    return (
        <div className="p-10 h-screen overflow-y-auto bg-slate-900 text-white animate-fade-in relative">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-800 pb-10">
                <div>
                    <h2 className="text-5xl font-black tracking-tighter flex items-center gap-4">
                        <LayoutDashboard size={48} className="text-indigo-500" /> Control Center
                    </h2>
                    <p className="text-indigo-400 mt-2 font-bold text-lg uppercase tracking-widest">Painel Administrativo - Impacto Social Toledo</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setView('moderation')}
                        className={`px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${view === 'moderation' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        Moderar Pendentes
                    </button>
                    {user?.role === 'super_admin' && (
                        <Link
                            to="/admin/logs"
                            className="bg-slate-800 text-slate-400 px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:text-indigo-400 transition-all border border-slate-700 flex items-center gap-2"
                        >
                            <Shield size={14} /> Histórico de Auditoria
                        </Link>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <MiniStat label="Impacto Total" value={data.metricas.total_impacto} icon={<CheckCircle className="text-emerald-400" />} />
                <MiniStat label="Igrejas Ativas" value={data.metricas.total_igrejas} icon={<Building className="text-indigo-400" />} />
                <MiniStat label="Ações Autorizadas" value={data.metricas.total_acoes} icon={<Database className="text-amber-400" />} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Moderation section */}
                {view === 'moderation' && (
                    <>
                        <section className="space-y-6">
                            <h3 className="text-2xl font-black flex items-center gap-3"><Clock className="text-amber-400" /> Ações em análise ({data.acoes_pendentes.length})</h3>
                            <div className="space-y-4">
                                {data.acoes_pendentes.length > 0 ? (
                                    data.acoes_pendentes.map(a => (
                                        <AdminActionCard key={a.id} a={a} onApprove={handleApproveAction} onReject={() => { }} />
                                    ))
                                ) : (
                                    <div className="p-10 text-center border-2 border-dashed border-slate-800 rounded-[2.5rem] text-slate-600 font-bold uppercase text-xs tracking-widest italic">
                                        Nenhuma proposta pendente no momento.
                                    </div>
                                )}
                            </div>
                        </section>

                        {user?.role === 'super_admin' && (
                            <section className="space-y-6">
                                <h3 className="text-2xl font-black flex items-center gap-3"><Building className="text-indigo-400" /> Candidaturas de Igreja ({data.igrejas_pendentes.length})</h3>
                                <div className="space-y-4 text-white">
                                    {data.igrejas_pendentes.length > 0 ? (
                                        data.igrejas_pendentes.map(i => (
                                            <div key={i.id} className="bg-slate-800 p-8 rounded-[2.5rem] flex items-center justify-between border border-slate-700 shadow-xl group hover:border-indigo-500 transition-all">
                                                <div>
                                                    <h4 className="text-xl font-black mb-1">{i.nome}</h4>
                                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-loose">{i.endereco}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApproveChurch(i.id)}
                                                        className="bg-indigo-600 hover:bg-indigo-700 p-4 rounded-2xl text-white shadow-xl hover:shadow-indigo-600/30 active:scale-95 transition-all"
                                                    >
                                                        <CheckCircle size={24} />
                                                    </button>
                                                    <button className="bg-slate-700 hover:bg-red-500/20 p-4 rounded-2xl text-slate-400 hover:text-red-500 transition-all">
                                                        <XCircle size={24} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-10 text-center border-2 border-dashed border-slate-800 rounded-[2.5rem] text-slate-600 font-bold uppercase text-xs tracking-widest italic">
                                            Tudo em dia por aqui.
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>

            <div className="py-20 text-center opacity-20 pointer-events-none pb-10">
                <p className="font-black text-[120px] uppercase tracking-tighter leading-none m-0 p-0 overflow-hidden text-slate-700 select-none">Toledo Social Impact</p>
                <p className="text-xl font-black uppercase tracking-[0.5em] mt-8 text-slate-500">Security Engineering Division</p>
            </div>
        </div>
    );
};

const MiniStat = ({ label, value, icon }) => (
    <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 shadow-2xl flex items-center justify-between hover:border-slate-500 transition-all border-dashed">
        <div className="shrink-0 bg-slate-900/50 p-6 rounded-3xl">{icon}</div>
        <div className="text-right">
            <h4 className="text-4xl font-black tracking-tighter">{value || 0}</h4>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
        </div>
    </div>
);

export default AdminDashboard;
