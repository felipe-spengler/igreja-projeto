import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CheckCircle, Clock } from 'lucide-react';
import FormInput from '../components/FormInput';
import axios from 'axios';
import api from '../api';

const RegisterAction = ({ bairros, igrejas }) => {
    const [sent, setSent] = useState(false);
    const [formData, setFormData] = useState({
        titulo: '', descricao: '', bairro_id: '', igreja_id: '', data_inicio: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/propor-acao', formData);
            setSent(true);
        } catch (error) {
            console.error(error);
            alert('Erro ao enviar proposta.');
        }
    };

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
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={handleSubmit}>
                            <div className="md:col-span-2">
                                <FormInput
                                    label="Título da Ação" placeholder="Ex: Entrega de Alimentos"
                                    value={formData.titulo} onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Vincular ao Clube (Opcional)</label>
                                <select
                                    value={formData.igreja_id} onChange={e => setFormData({ ...formData, igreja_id: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:border-indigo-500"
                                >
                                    <option value="">Não sei ou é iniciativa independente</option>
                                    {igrejas.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Bairro do Impacto</label>
                                <select
                                    value={formData.bairro_id} onChange={e => setFormData({ ...formData, bairro_id: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:border-indigo-500"
                                    required
                                >
                                    <option value="">Selecione o Bairro</option>
                                    {bairros.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                                </select>
                            </div>
                            <FormInput
                                label="Data Sugerida" type="date"
                                value={formData.data_inicio} onChange={e => setFormData({ ...formData, data_inicio: e.target.value })}
                            />
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Breve Descrição</label>
                                <textarea
                                    value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-6 py-4 font-bold text-slate-700 outline-none focus:border-indigo-500 min-h-[120px]"
                                    placeholder="Conte um pouco sobre o que aconteceu ou o que é planejado..."
                                />
                            </div>
                            <div className="md:col-span-2 flex flex-col md:flex-row gap-6 mt-4">
                                <div className="flex-1 bg-indigo-50/50 p-6 rounded-3xl border border-dashed border-indigo-200 text-center cursor-pointer hover:bg-indigo-50 transition-all">
                                    <Clock className="mx-auto mb-2 text-indigo-400" />
                                    <p className="text-xs font-bold text-indigo-600">Sua proposta ficará em análise pelo admin da igreja.</p>
                                </div>
                                <button className="flex-[2] bg-slate-900 text-white py-6 rounded-3xl font-black text-xl hover:bg-black shadow-xl transition-all">
                                    Solicitar Registro de Impacto
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-20 animate-fade-in">
                        <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={48} /></div>
                        <h2 className="text-4xl font-black text-slate-800 mb-2">Impacto Recebido!</h2>
                        <p className="text-slate-500 text-lg mb-10">Sua proposta foi salva e será analisada para aparecer no mapa oficial em breve. Obrigado!</p>
                        <Link to="/" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold shadow-xl">Voltar ao Mapa</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegisterAction;
