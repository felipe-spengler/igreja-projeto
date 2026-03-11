import React, { useState } from 'react';
import { LogIn, Building, FilePlus, HeartPulse, Map as MapIcon, LayoutDashboard, Calendar as CalendarIcon, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, logout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    return (
        <>
            {/* MOBILE TOP BAR */}
            <div className="lg:hidden bg-slate-900 text-white w-full p-4 flex justify-between items-center shadow-lg z-50 fixed top-0 left-0">
                <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
                    <HeartPulse size={20} className="text-indigo-500" />
                    <span className="font-bold text-sm tracking-tight">Impacto Toledo</span>
                </Link>
                <button onClick={toggleMenu} className="p-2 bg-slate-800 rounded-lg">
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* OVERLAY FOR MOBILE */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[51] transition-opacity"
                    onClick={closeMenu}
                ></div>
            )}

            {/* SIDEBAR SIDEBAR */}
            <nav className={`
                fixed inset-y-0 left-0 z-[52] w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:w-64 lg:min-h-screen py-8 shadow-2xl shrink-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex items-center gap-3 mb-10 px-6">
                    <div className="bg-indigo-500 p-2 rounded-xl">
                        <HeartPulse size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight leading-none">Impacto Toledo</h1>
                        <p className="text-indigo-300 text-[10px] font-medium uppercase tracking-wider mt-1">Rede de Solidariedade</p>
                    </div>
                </div>

                <div className="flex flex-col w-full px-4 gap-2 overflow-y-auto">
                    <NavLink to="/" icon={<MapIcon size={20} />} label="Mapa de Impacto" active={location.pathname === '/'} onClick={closeMenu} />
                    <NavLink to="/stats" icon={<LayoutDashboard size={20} />} label="Estatísticas" active={location.pathname === '/stats'} onClick={closeMenu} />
                    <NavLink to="/calendar" icon={<CalendarIcon size={20} />} label="Calendário" active={location.pathname === '/calendar'} onClick={closeMenu} />

                    <div className="my-6 border-t border-slate-800 pt-6">
                        <p className="text-[10px] text-slate-500 font-bold uppercase px-4 mb-3 tracking-widest">Colabore</p>
                        <NavLink to="/register-action" icon={<FilePlus size={18} />} label="Propor Ação" active={location.pathname === '/register-action'} onClick={closeMenu} />
                        <NavLink to="/register-church" icon={<Building size={18} />} label="Cadastrar Igreja" active={location.pathname === '/register-church'} onClick={closeMenu} />
                    </div>

                    {user ? (
                        <div className="mt-8 border-t border-slate-800 pt-6">
                            <p className="text-[10px] text-slate-500 font-bold uppercase px-4 mb-3 tracking-widest">Painel Admin</p>
                            <NavLink to="/admin" icon={<LayoutDashboard size={18} />} label="Painel Principal" active={location.pathname.startsWith('/admin')} onClick={closeMenu} />
                            <button
                                onClick={() => { logout(); closeMenu(); }}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-400 hover:bg-red-500/10 w-full"
                            >
                                <LogIn size={20} className="rotate-180" />
                                <span className="font-semibold text-sm">Sair da Conta</span>
                            </button>
                        </div>
                    ) : (
                        <div className="mt-8 pt-6">
                            <NavLink to="/login" icon={<LogIn size={20} />} label="Login Administrativo" active={location.pathname === '/login'} onClick={closeMenu} />
                        </div>
                    )}
                </div>

                {user && (
                    <div className="mt-auto pt-8 px-4 w-full">
                        <div className="bg-indigo-600/10 rounded-2xl p-4 border border-indigo-500/10">
                            <p className="text-[10px] text-indigo-400 mb-2 uppercase font-bold tracking-tighter">Identidade</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30 uppercase">
                                    {user.name?.[0] || 'U'}
                                </div>
                                <div className="truncate">
                                    <p className="text-xs font-black text-white truncate">{user.name}</p>
                                    <p className="text-[9px] text-indigo-400 uppercase font-black tracking-widest">{user.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
};

const NavLink = ({ to, icon, label, active, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
    >
        {icon}
        <span className="font-bold text-sm tracking-tight">{label}</span>
    </Link>
);

export default Navbar;
