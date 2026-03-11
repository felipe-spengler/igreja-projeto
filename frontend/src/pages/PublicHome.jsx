import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import { format, parseISO } from 'date-fns';
import { List, X, Info, Users, Activity, ChevronRight, ChevronLeft, Filter, Settings2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const PublicHome = ({ acoes, bairros, filteredAcoes, filterIgreja, setFilterIgreja, filterClube, setFilterClube, igrejas }) => {
    const [showList, setShowList] = useState(false);
    const [viewMode, setViewMode] = useState('actions'); // 'actions' ou 'impact'
    const [autoTimer, setAutoTimer] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobile menu toggle

    // Lógica de Autocycle (Troca a cada 15s)
    useEffect(() => {
        if (!autoTimer) return;
        const interval = setInterval(() => {
            setViewMode(prev => prev === 'actions' ? 'impact' : 'actions');
        }, 15000);
        return () => clearInterval(interval);
    }, [autoTimer]);

    // Cálculo das métricas por bairro
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

            {/* BOTÃO MOBILE PARA ABRIR MENU (FICA NO TOPO ESQUERDO) */}
            {!isMenuOpen && (
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="md:hidden absolute top-6 left-6 z-[1002] bg-slate-900 text-white p-4 rounded-3xl shadow-2xl border border-white/10 active:scale-90 transition-all"
                >
                    <Filter size={24} />
                </button>
            )}

            {/* PAINEL DE CONTROLE (FILTROS + MODOS) */}
            <div className={`
                absolute md:top-6 md:left-6 z-[1001] transition-all duration-500 ease-out
                ${isMenuOpen ? 'inset-0 bg-slate-950/40 backdrop-blur-md pointer-events-auto' : 'pointer-events-none -translate-x-full md:translate-x-0'}
            `}>
                <div className={`
                    bg-slate-900/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10 pointer-events-auto flex flex-col gap-6
                    w-full max-w-sm h-full md:h-auto md:w-80 md:rounded-[2.5rem] relative
                    transition-all duration-500
                    ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>

                    {/* BOTÃO FECHAR MOBILE */}
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="md:hidden absolute top-8 right-8 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={28} />
                    </button>

                    <div className="mb-4">
                        <h2 className="text-2xl font-black text-white italic tracking-tighter">CONFIGURAÇÕES</h2>
                        <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Personalize seu mapa</p>
                    </div>

                    {/* INDICADOR DE MODO ATUAL */}
                    <div className="flex bg-white/5 p-1 rounded-2xl relative border border-white/5">
                        <div
                            className={`absolute inset-y-1 w-1/2 bg-indigo-600 rounded-xl transition-all duration-500 ease-in-out ${viewMode === 'impact' ? 'left-[48.5%]' : 'left-1'}`}
                        ></div>
                        <button
                            onClick={() => { setViewMode('actions'); setAutoTimer(false); }}
                            className={`flex-1 py-3 text-[10px] font-black z-10 transition-colors flex items-center justify-center gap-2 ${viewMode === 'actions' ? 'text-white' : 'text-slate-400'}`}
                        >
                            <Activity size={12} /> POR AÇÕES
                        </button>
                        <button
                            onClick={() => { setViewMode('impact'); setAutoTimer(false); }}
                            className={`flex-1 py-3 text-[10px] font-black z-10 transition-colors flex items-center justify-center gap-2 ${viewMode === 'impact' ? 'text-white' : 'text-slate-400'}`}
                        >
                            <Users size={12} /> POR IMPACTO
                        </button>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] pl-1">Filtrar por Rede</span>
                        <select
                            value={filterIgreja}
                            onChange={(e) => setFilterIgreja(e.target.value)}
                            className="bg-white/5 border-white/5 border text-xs font-bold text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none px-4 py-4 appearance-none cursor-pointer hover:bg-white/10 transition-all w-full"
                        >
                            <option value="todas" className="bg-slate-900">Todas as Igrejas</option>
                            {igrejas.map(i => <option key={i.id} value={i.id} className="bg-slate-900">{i.nome}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] pl-1">Filtrar por Clube</span>
                        <select
                            value={filterClube}
                            onChange={(e) => setFilterClube(e.target.value)}
                            className="bg-white/5 border-white/5 border text-xs font-bold text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none px-4 py-4 appearance-none cursor-pointer hover:bg-white/10 transition-all w-full"
                        >
                            <option value="todos" className="bg-slate-900">Todos os Clubes</option>
                            {Array.from(new Set(acoes.map(a => a.clube?.nome))).filter(Boolean).map(name => (
                                <option key={name} value={name} className="bg-slate-900">{name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => { setShowList(true); setIsMenuOpen(false); }}
                        className="mt-4 bg-white text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 border-b-4 border-slate-300"
                    >
                        <List size={16} /> Ver Lista Total de Ações
                    </button>

                    {autoTimer && (
                        <div className="mt-2 flex flex-col gap-2">
                            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-400 animate-[progress_15s_linear_infinite]"></div>
                            </div>
                            <span className="text-[8px] text-slate-500 font-bold tracking-widest text-center">TROCA AUTOMÁTICA ATIVA</span>
                        </div>
                    )}

                    {/* LEGENDA DENTRO DO MENU NO MOBILE, FORA NO PC */}
                    <div className="mt-8 bg-white/5 p-6 rounded-3xl border border-white/5">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <Info size={14} className="text-slate-500" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Intensidade de {viewMode === 'actions' ? 'Ações' : 'Impacto'}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <LegendItem color="#fde047" label="BAIXO" isDark />
                            <LegendItem color="#fb923c" label="MÉDIO" isDark />
                            <LegendItem color="#ef4444" label="ALTA" isDark />
                            <LegendItem color="#a855f7" label="FOCAL" isDark />
                        </div>
                    </div>
                </div>
            </div>

            {/* DRAWER LATERAL (LISTA) */}
            {showList && (
                <div className="absolute inset-y-0 right-0 w-full md:w-[450px] z-[2005] animate-fade-in flex">
                    <div className="flex-1 bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.2)] flex flex-col border-l border-slate-100">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 backdrop-blur-md sticky top-0 z-10">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">LISTAGEM GERAL</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">{filteredAcoes.length} Registros encontrados em Toledo</p>
                            </div>
                            <button onClick={() => setShowList(false)} className="p-4 bg-white rounded-[1.5rem] text-slate-400 hover:text-red-500 shadow-sm transition-all border border-slate-100 active:scale-90">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {filteredAcoes.map(a => (
                                <div key={a.id} className="group cursor-pointer">
                                    <div className="flex gap-6 items-start">
                                        <div className="w-24 h-24 rounded-[2rem] overflow-hidden shrink-0 shadow-xl border border-slate-100">
                                            <img src={a.fotos?.[0] || 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=200&auto=format&fit=crop'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="grow">
                                            <h4 className="font-black text-slate-900 text-sm leading-tight uppercase group-hover:text-indigo-600 transition-colors mb-2 italic tracking-tighter">{a.titulo}</h4>
                                            <span className="text-[9px] text-slate-400 font-black tracking-widest border border-slate-100 px-3 py-1 rounded-full mb-3 inline-block">{a.bairro?.nome || 'TOLEDO'}</span>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">{Number(a.pessoas_atendidas || 0)} ATENDIDAS</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 italic"><Activity size={10} /> {a.data_inicio ? format(parseISO(a.data_inicio), 'dd/MM/yy') : ''}</span>
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
                                color: '#334155', weight: 1.5, opacity: 0.2
                            }}
                        >
                            <Popup className="custom-popup !rounded-[2.5rem] !p-0 shadow-2xl" offset={[150, 0]}>
                                <div className="bg-slate-900 text-white p-8 rounded-t-[2.5rem]">
                                    <h4 className="font-black text-2xl tracking-tighter mb-2 italic uppercase">{b.nome}</h4>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full animate-pulse ${stats.actions > 0 ? 'bg-indigo-500' : 'bg-slate-600'}`}></div>
                                        <p className="text-[11px] text-indigo-300 uppercase font-black tracking-[0.1em]">
                                            {stats.actions} AÇÕES · {stats.impact} IMPACTADOS
                                        </p>
                                    </div>
                                </div>
                                <div className="p-8 max-h-[400px] overflow-y-auto space-y-8 bg-white rounded-b-[2.5rem]">
                                    {stats.actions > 0 ? (
                                        items.map(a => (
                                            <div key={a.id} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                                                {a.fotos && a.fotos.length > 0 && (
                                                    <img
                                                        src={a.fotos[0]}
                                                        className="w-full h-40 object-cover rounded-[2rem] mb-4 shadow-sm border border-slate-100"
                                                        alt={a.titulo}
                                                    />
                                                )}
                                                <p className="text-[11px] font-black text-slate-900 uppercase mb-3 leading-tight italic tracking-tighter">{a.titulo}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-xl font-black border border-emerald-100">{Number(a.pessoas_atendidas || 0)} ATENDIDOS</span>
                                                    <span className="text-[10px] text-slate-400 font-black italic tracking-widest">{a.data_inicio ? format(parseISO(a.data_inicio), 'dd/MM/yy') : ''}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <Info size={24} className="mx-auto text-slate-200 mb-2" />
                                            <p className="text-slate-400 italic text-xs font-black uppercase tracking-widest">Sem registros no momento</p>
                                        </div>
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
                .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; }
                .leaflet-popup-tip { background: #0f172a !important; }
            ` }} />
        </div>
    );
};

const LegendItem = ({ color, label, isDark }) => (
    <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-lg shadow-sm shrink-0" style={{ backgroundColor: color }}></div>
        <span className={`text-[9px] font-black tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</span>
    </div>
);

export default PublicHome;
