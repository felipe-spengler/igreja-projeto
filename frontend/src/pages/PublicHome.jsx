import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import { format, parseISO } from 'date-fns';
import { List, X, Info, Users, Activity, Filter, Layers } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const PublicHome = ({ acoes, bairros, filteredAcoes, filterIgreja, setFilterIgreja, filterClube, setFilterClube, igrejas }) => {
    const [showList, setShowList] = useState(false);
    const [viewMode, setViewMode] = useState('actions'); // 'actions' ou 'impact'
    const [autoTimer, setAutoTimer] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (!autoTimer) return;
        const interval = setInterval(() => {
            setViewMode(prev => prev === 'actions' ? 'impact' : 'actions');
        }, 15000);
        return () => clearInterval(interval);
    }, [autoTimer]);

    const statsPorBairro = {};
    filteredAcoes.forEach(a => {
        const b = a.bairro?.nome;
        if (!b) return;
        if (!statsPorBairro[b]) {
            statsPorBairro[b] = { actions: 0, impact: 0 };
        }
        statsPorBairro[b].actions += 1;
        statsPorBairro[b].impact += Number(a.pessoas_atendidas || 0);
    });

    const getDistrictColor = (bairroNome) => {
        const stats = statsPorBairro[bairroNome];
        if (!stats) return 'rgba(241, 245, 249, 0.5)';
        const value = viewMode === 'actions' ? stats.actions : stats.impact;
        if (value === 0) return 'rgba(241, 245, 249, 0.5)';
        const allValues = Object.values(statsPorBairro).map(s => viewMode === 'actions' ? s.actions : s.impact);
        const max = Math.max(...allValues, 1);
        const ratio = value / max;
        if (ratio < 0.25) return '#fde047';
        if (ratio < 0.5) return '#fb923c';
        if (ratio < 0.75) return '#ef4444';
        return '#a855f7';
    };

    return (
        <div className="h-full w-full relative z-0 animate-fade-in flex flex-col uppercase tracking-tighter overflow-hidden">

            {/* BOTÃO MOBILE */}
            {!isMenuOpen && (
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="md:hidden absolute top-4 left-4 z-[1002] bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-white/10 active:scale-90 transition-all"
                >
                    <Filter size={20} />
                </button>
            )}

            {/* PAINEL DE CONTROLE (COMPACTO NO DESKTOP, SCROLL NO MOBILE) */}
            <div className={`
                absolute z-[1001] transition-all duration-500 ease-out
                ${isMenuOpen ? 'inset-0 bg-slate-950/60 backdrop-blur-sm pointer-events-auto' : 'pointer-events-none md:top-6 md:left-6'}
            `}>
                <div className={`
                    bg-slate-900/95 backdrop-blur-xl shadow-2xl border border-white/10 pointer-events-auto flex flex-col
                    w-full max-w-[320px] md:w-[240px] md:max-h-[calc(100vh-80px)] md:rounded-[2rem] h-full md:h-auto relative
                    transition-all duration-500 overflow-y-auto custom-scrollbar
                    ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>

                    {/* CONTEÚDO DO MENU */}
                    <div className="p-6 md:p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-center mb-0">
                            <div>
                                <h2 className="text-lg font-black text-white italic tracking-tighter">FILTROS</h2>
                                <p className="text-[8px] text-slate-500 font-bold tracking-widest uppercase">Visualização</p>
                            </div>
                            <button onClick={() => setIsMenuOpen(false)} className="md:hidden text-slate-400 p-2"><X size={24} /></button>
                        </div>

                        {/* TOGGLE MODOS (MAIS COMPACTO) */}
                        <div className="flex bg-white/5 p-1 rounded-xl relative border border-white/5">
                            <div className={`absolute inset-y-1 w-1/2 bg-indigo-600 rounded-lg transition-all duration-300 ${viewMode === 'impact' ? 'left-[48%]' : 'left-1'}`}></div>
                            <button onClick={() => { setViewMode('actions'); setAutoTimer(false); }} className={`flex-1 py-1.5 text-[9px] font-black z-10 flex items-center justify-center gap-1.5 ${viewMode === 'actions' ? 'text-white' : 'text-slate-500'}`}><Activity size={10} /> AÇÕES</button>
                            <button onClick={() => { setViewMode('impact'); setAutoTimer(false); }} className={`flex-1 py-1.5 text-[9px] font-black z-10 flex items-center justify-center gap-1.5 ${viewMode === 'impact' ? 'text-white' : 'text-slate-500'}`}><Users size={10} /> IMPACTO</button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest pl-1">Rede</span>
                                <select value={filterIgreja} onChange={(e) => setFilterIgreja(e.target.value)} className="bg-white/5 border-white/5 border text-[10px] font-bold text-white rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none px-3 py-2.5 appearance-none cursor-pointer w-full uppercase">
                                    <option value="todas" className="bg-slate-900">Todas as Igrejas</option>
                                    {igrejas.map(i => <option key={i.id} value={i.id} className="bg-slate-900">{i.nome}</option>)}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest pl-1">Clube</span>
                                <select value={filterClube} onChange={(e) => setFilterClube(e.target.value)} className="bg-white/5 border-white/5 border text-[10px] font-bold text-white rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none px-3 py-2.5 appearance-none cursor-pointer w-full uppercase">
                                    <option value="todos" className="bg-slate-900">Todos os Clubes</option>
                                    {Array.from(new Set(acoes.map(a => a.clube?.nome))).filter(Boolean).map(name => (
                                        <option key={name} value={name} className="bg-slate-900">{name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button onClick={() => { setShowList(true); setIsMenuOpen(false); }} className="bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"><List size={12} /> LISTA DE ATIVIDADES</button>

                        {autoTimer && (
                            <div className="mt-1">
                                <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-400 animate-[progress_15s_linear_infinite]"></div>
                                </div>
                                <p className="text-[7px] text-slate-600 font-bold tracking-widest text-center mt-1">AUTO-SWITCH ATIVO</p>
                            </div>
                        )}

                        <div className="mt-2 pt-4 border-t border-white/5">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Layers size={10} /> Escala de Intensidade</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <LegendItem color="#fde047" label="Baixo" isDark />
                                <LegendItem color="#fb923c" label="Médio" isDark />
                                <LegendItem color="#ef4444" label="Alta" isDark />
                                <LegendItem color="#a855f7" label="Focal" isDark />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* LISTA LATERAL (DRAWER) */}
            {showList && (
                <div className="absolute inset-y-0 right-0 w-full md:w-[380px] z-[2005] animate-fade-in flex">
                    <div className="flex-1 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.15)] flex flex-col border-l border-slate-100">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 italic">ATIVIDADES</h3>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{filteredAcoes.length} Registros</p>
                            </div>
                            <button onClick={() => setShowList(false)} className="p-2 text-slate-400 hover:text-red-500 transition-all"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                            {filteredAcoes.map(a => (
                                <div key={a.id} className="group border-b border-slate-50 pb-5 last:border-0 cursor-pointer">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-md border border-slate-100">
                                            <img src={a.fotos?.[0] || 'https://via.placeholder.com/100'} className="w-full h-full object-cover group-hover:scale-110 transition-all" />
                                        </div>
                                        <div className="grow">
                                            <h4 className="font-black text-slate-900 text-[11px] leading-tight uppercase group-hover:text-indigo-600 mb-1">{a.titulo}</h4>
                                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest block mb-2">{a.bairro?.nome || 'TOLEDO'}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 truncate">{Number(a.pessoas_atendidas || 0)} ATENDIDAS</span>
                                                <span className="text-[8px] font-black text-slate-400 uppercase">{a.data_inicio ? format(parseISO(a.data_inicio), 'dd/MM/yy') : ''}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <MapContainer
                center={[-24.7199, -53.7433]} zoom={13} className="h-full w-full"
                zoomControl={false} style={{ backgroundColor: '#f1f5f9' }}
            >
                {bairros.map((b) => {
                    const stats = statsPorBairro[b.nome] || { actions: 0, impact: 0 };
                    const items = filteredAcoes.filter(a => a.bairro?.nome === b.nome);
                    return b.geojson && (
                        <GeoJSON
                            key={b.id} data={b.geojson}
                            pathOptions={{
                                fillColor: getDistrictColor(b.nome),
                                fillOpacity: (viewMode === 'actions' ? stats.actions : stats.impact) > 0 ? 0.75 : 0.05,
                                color: '#334155', weight: 1, opacity: 0.15
                            }}
                        >
                            <Popup className="custom-popup !rounded-[2rem] !p-0 shadow-2xl" offset={[120, 0]}>
                                <div className="bg-slate-900 text-white p-6 rounded-t-[2rem]">
                                    <h4 className="font-black text-lg tracking-tighter mb-1 italic uppercase">{b.nome}</h4>
                                    <p className="text-[9px] text-indigo-300 uppercase font-black tracking-widest">{stats.actions} AÇÕES · {stats.impact} IMPACTADOS</p>
                                </div>
                                <div className="p-6 max-h-[300px] overflow-y-auto space-y-6 bg-white rounded-b-[2rem] custom-scrollbar">
                                    {stats.actions > 0 ? (
                                        items.map(a => (
                                            <div key={a.id} className="pb-4 border-b border-slate-100 last:border-0">
                                                {a.fotos && a.fotos.length > 0 && <img src={a.fotos[0]} className="w-full h-32 object-cover rounded-xl mb-3 border border-slate-50" />}
                                                <p className="text-[10px] font-black text-slate-900 uppercase mb-2 italic leading-tight">{a.titulo}</p>
                                                <div className="flex justify-between items-center text-[8px] font-black italic">
                                                    <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg uppercase">{Number(a.pessoas_atendidas || 0)} ATENDIDOS</span>
                                                    <span className="text-slate-400">{a.data_inicio ? format(parseISO(a.data_inicio), 'dd/MM/yy') : ''}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center py-4 text-slate-400 italic text-[9px] uppercase font-bold">Nenhum registro</p>
                                    )}
                                </div>
                            </Popup>
                        </GeoJSON>
                    );
                })}
            </MapContainer>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes progress { from { width: 0%; } to { width: 100%; } }
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; }
            ` }} />
        </div>
    );
};

const LegendItem = ({ color, label, isDark }) => (
    <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded shadow-sm shrink-0" style={{ backgroundColor: color }}></div>
        <span className={`text-[8px] font-black tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{label}</span>
    </div>
);

export default PublicHome;
