import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, Clock, CheckCircle } from 'lucide-react';
import FormInput from '../components/FormInput';
import axios from 'axios';
import api from '../api';

const RegisterChurch = () => {
    const [sent, setSent] = useState(false);
    const [formData, setFormData] = useState({ nome: '', endereco: '', responsavel: '', telefone: '', email: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/propor-igreja', formData);
            setSent(true);
        } catch (error) {
            console.error(error);
            alert('Erro ao enviar solicitação.');
        }
    };

    return (
        <div className="h-full w-full overflow-y-auto p-8 bg-slate-50 animate-fade-in flex items-center justify-center">
            <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-12 border border-slate-100">
                {!sent ? (
                    <>
                        <div className="mb-10 text-center">
                            <Building className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                            <h2 className="text-4xl font-black text-slate-800">Nova Igreja na Rede</h2>
                            <p className="text-slate-500 mt-3 font-medium text-lg">Cadastre sua congregação para começar a mapear o impacto na cidade!</p>
                        </div>
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormInput
                                    label="Nome da Igreja" placeholder="Ex: Central Toledo"
                                    value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                    required
                                />
                                <FormInput
                                    label="Responsável" placeholder="Pastor ou Diretor"
                                    value={formData.responsavel} onChange={e => setFormData({ ...formData, responsavel: e.target.value })}
                                    required
                                />
                                <div className="md:col-span-2">
                                    <FormInput
                                        label="Endereço Completo" placeholder="Rua, Número, Bairro"
                                        value={formData.endereco} onChange={e => setFormData({ ...formData, endereco: e.target.value })}
                                        required
                                    />
                                </div>
                                <FormInput
                                    label="Telefone de Contato" placeholder="(45) 99999-9999"
                                    value={formData.telefone} onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                                />
                                <FormInput
                                    label="E-mail Principal" placeholder="contato@igreja.com"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
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

export default RegisterChurch;
