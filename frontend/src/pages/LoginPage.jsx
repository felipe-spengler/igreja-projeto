import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
    const [cred, setCred] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // MOCK AUTH
        const mockUser = {
            name: cred.email.includes('admin') ? 'Admin Igreja' : 'Super Admin',
            email: cred.email,
            role: cred.email.includes('super') ? 'super_admin' : 'admin_igreja',
            igreja_id: cred.email.includes('admin') ? 1 : null
        };
        onLogin(mockUser);
        navigate('/');
    };

    return (
        <div className="h-full w-full flex items-center justify-center p-6 bg-slate-50 animate-fade-in">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100">
                <div className="text-center mb-10">
                    <div className="bg-indigo-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-200">
                        <LogIn className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800">Painel Restrito</h2>
                    <p className="text-slate-500 mt-2 font-medium">Acesse para gerenciar o impacto da sua rede.</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">E-mail Corporativo</label>
                        <input
                            type="email"
                            required
                            value={cred.email}
                            onChange={e => setCred({ ...cred, email: e.target.value })}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all font-bold text-slate-700"
                            placeholder="exemplo@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Sua Senha</label>
                        <input
                            type="password"
                            required
                            value={cred.password}
                            onChange={e => setCred({ ...cred, password: e.target.value })}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all font-bold text-slate-700"
                            placeholder="••••••••"
                        />
                    </div>
                    <button className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all active:scale-[0.98]">
                        Entrar no Sistema
                    </button>
                    <div className="text-center pt-4">
                        <p className="text-xs text-slate-400 italic">Dica: admin@projeto.com ou super@projeto.com</p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
