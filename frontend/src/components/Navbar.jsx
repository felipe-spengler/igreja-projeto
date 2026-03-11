import React, { useState } from 'react';
import { LogIn, Building, FilePlus, HeartPulse, Map as MapIcon, LayoutDashboard, Calendar as CalendarIcon, Menu, X, Shield, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, logout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // Doca Flutuante: Minimalista, moderna e com efeito de vidro (glassmorphism)
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] w-auto animate-fade-in">
            <div className="bg-slate-900/90 backdrop-blur-xl px-4 py-3 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 flex items-center gap-2">

                {/* BRAND / HOME */}
                <Link to="/" className={`p-3 rounded-full transition-all ${location.pathname === '/' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                    <MapIcon size={24} />
                </Link>

                <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

                {/* MAIN NAV */}
                <NavLink to="/stats" icon={<LayoutDashboard size={22} />} active={location.pathname === '/stats'} />
                <NavLink to="/calendar" icon={<CalendarIcon size={22} />} active={location.pathname === '/calendar'} />

                <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

                {/* COLLABORATE */}
                <NavLink to="/register-action" icon={<PlusIcon size={22} />} active={location.pathname === '/register-action'} color="text-emerald-400" />
                <NavLink to="/register-church" icon={<Building size={22} />} active={location.pathname === '/register-church'} color="text-amber-400" />

                {/* ADMIN / USER */}
                {user ? (
                    <>
                        <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
                        <NavLink to="/admin" icon={<Shield size={22} />} active={location.pathname.startsWith('/admin')} color="text-indigo-400" />
                        <button
                            onClick={logout}
                            className="p-3 text-red-400 hover:bg-red-500/10 rounded-full transition-all"
                        >
                            <LogOut size={22} />
                        </button>
                    </>
                ) : (
                    <NavLink to="/login" icon={<LogIn size={22} />} active={location.pathname === '/login'} />
                )}
            </div>
        </div>
    );
};

const NavLink = ({ to, icon, active, color = 'text-slate-400' }) => (
    <Link
        to={to}
        className={`p-3 rounded-full transition-all relative group ${active ? 'bg-white/20 text-white' : `${color} hover:text-white hover:bg-white/10`}`}
    >
        {icon}
        {active && <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-900"></span>}
    </Link>
);

const PlusIcon = ({ size }) => (
    <div className="relative">
        <FilePlus size={size} />
        <span className="absolute -top-1 -right-1 bg-emerald-500 w-3 h-3 rounded-full border-2 border-slate-900 flex items-center justify-center text-[8px]">+</span>
    </div>
);

export default Navbar;
