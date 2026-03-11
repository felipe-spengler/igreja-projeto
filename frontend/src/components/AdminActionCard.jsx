import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, MapPin, Building, Users } from 'lucide-react';
import FormInput from './FormInput';

const AdminActionCard = ({ a, onApprove, onReject, showApprovalActions = true }) => {
    const [finishing, setFinishing] = useState(false);
    const [data, setData] = useState({
        pessoas_atendidas: a.pessoas_atendidas || 0,
        descricao: a.descricao || '',
        status: 'realizada'
    });

    const handleFinish = () => {
        onApprove(a.id, data);
        setFinishing(false);
    };

    return (
        <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 flex flex-col md:flex-row gap-8 shadow-xl group hover:border-amber-400/50 transition-all text-white">
            <div className="w-32 h-32 rounded-3xl overflow-hidden shrink-0 border-2 border-slate-700">
                <img src={a.fotos?.[0] || 'https://via.placeholder.com/300'} className="w-full h-full object-cover" />
            </div>
            <div className="grow">
                {!finishing ? (
                    <>
                        <h4 className="text-xl font-black mb-2 uppercase tracking-tighter">{a.titulo}</h4>
                        <p className="text-slate-400 text-sm mb-4 line-clamp-2">{a.descricao}</p>
                        <div className="flex flex-wrap gap-4 text-[9px] font-black uppercase">
                            <span className="bg-slate-700 px-3 py-1 rounded-lg text-amber-400 border border-amber-400/20">{a.status}</span>
                            <span className="bg-slate-700 px-3 py-1 rounded-lg text-indigo-300">Organizador: {a.clube?.nome || 'Prop. Externa'}</span>
                            <span className="flex items-center gap-1 text-slate-400"><MapPin size={10} /> {a.bairro?.nome}</span>
                        </div>

                        {showApprovalActions && (
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setFinishing(true)}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest shadow-lg active:scale-95 transition-all text-white"
                                >
                                    Vincular e Ativar
                                </button>
                                <button
                                    onClick={() => onReject(a.id)}
                                    className="bg-slate-700 hover:bg-red-500 text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest shadow-lg active:scale-95 transition-all text-white"
                                >
                                    Rejeitar
                                </button>
                            </div>
                        )}

                        {a.status === 'programada' && !showApprovalActions && (
                            <div className="mt-4">
                                <button
                                    onClick={() => setFinishing(true)}
                                    className="text-[10px] font-black uppercase tracking-widest text-indigo-400 border border-indigo-400/30 px-4 py-2 rounded-xl hover:bg-indigo-400/10 transition-all flex items-center gap-2"
                                >
                                    <CheckCircle size={14} /> Finalizar Ação
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        <h4 className="text-lg font-black uppercase text-indigo-400">Finalizar e Registrar Impacto</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Pessoas Impactadas"
                                type="number"
                                value={data.pessoas_atendidas}
                                onChange={e => setData({ ...data, pessoas_atendidas: e.target.value })}
                            />
                            <div className="flex items-end pb-1">
                                <p className="text-[10px] font-bold text-slate-500 italic">Mantenha a descrição original ou atualize os fatos.</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Relato da Ação</label>
                                <textarea
                                    className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all font-bold text-slate-300 min-h-[100px]"
                                    value={data.descricao}
                                    onChange={e => setData({ ...data, descricao: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={handleFinish}
                                className="bg-emerald-500 text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest flex items-center gap-2"
                            >
                                <CheckCircle size={14} /> Confirmar Impacto
                            </button>
                            <button
                                onClick={() => setFinishing(false)}
                                className="text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest text-slate-400"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminActionCard;
