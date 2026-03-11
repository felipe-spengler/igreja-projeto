import React, { useState } from 'react';
import { LogIn, Building, FilePlus, Map as MapIcon, LayoutDashboard, Calendar as CalendarIcon, Shield, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, logout }) => {
    const location = useLocation();

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] w-auto animate-fade-in px-4">
            <div className="bg-slate-900/90 backdrop-blur-xl px-2 py-2 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 flex items-center gap-1">

                {/* MAPA */}
                <NavLink to="/" icon={<MapIcon size={20} />} label="Mapa" active={location.pathname === '/'} />

                <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

                {/* MAIN NAV */}
                <NavLink to="/stats" icon={<LayoutDashboard size={20} />} label="Impacto" active={location.pathname === '/stats'} />
                <NavLink to="/calendar" icon={<CalendarIcon size={20} />} label="Agenda" active={location.pathname === '/calendar'} />

                <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

                {/* COLLABORATE */}
                <NavLink to="/register-action" icon={<PlusIcon size={20} />} label="Ação" active={location.pathname === '/register-action'} color="text-emerald-400" />
                <NavLink to="/register-church" icon={<Building size={20} />} label="Igreja" active={location.pathname === '/register-church'} color="text-amber-400" />

                {/* ADMIN / USER */}
                {user ? (
                    <>
                        <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
                        <NavLink to="/admin" icon={<Shield size={20} />} label="Admin" active={location.pathname.startsWith('/admin')} color="text-indigo-400" />
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-full transition-all group"
                        >
                            <LogOut size={20} />
                            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out">
                                <span className="text-[10px] font-black uppercase tracking-widest pl-1">Sair</span>
                            </span>
                        </button>
                    </>
                ) : (
                    <>
                        <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
                        <NavLink to="/login" icon={<LogIn size={20} />} label="Login" active={location.pathname === '/login'} />
                    </>
                )}
            </div>
        </div>
    );
};

const NavLink = ({ to, icon, label, active, color = 'text-slate-400' }) => (
    <Link
        to={to}
        className={`flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 px-3 md:px-4 py-2 md:py-2 rounded-2xl md:rounded-full transition-all duration-500 ease-in-out relative group 
            ${active ? 'bg-indigo-600 text-white shadow-lg' : `${color} hover:text-white hover:bg-white/10`}`}
    >
        <span className="shrink-0">{icon}</span>

        {/* Texto do Label: Em baixo no mobile, lado no desktop */}
        <span className={`
            overflow-hidden transition-all duration-500 ease-in-out text-center
            ${active ? 'max-h-8 md:max-w-xs md:ml-1' : 'max-h-0 md:max-w-0 md:group-hover:max-w-xs md:group-hover:ml-1'}
        `}>
            <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap block">
                {label}
            </span>
        </span>

        {active && !to.includes('register') && (
            <span className="absolute top-1 right-1 md:-top-1 md:-right-1 w-1.5 h-1.5 bg-white rounded-full border border-indigo-600"></span>
        )}
    </Link>
);

const PlusIcon = ({ size }) => (
    <div className="relative">
        <FilePlus size={size} />
    </div>
);

export default Navbar;
