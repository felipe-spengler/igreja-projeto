import React, { useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import { format, parseISO } from 'date-fns';
import { List, X, Info } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const PublicHome = ({ acoes, bairros, filteredAcoes, filterIgreja, setFilterIgreja, filterClube, setFilterClube, igrejas }) => {
    const [showList, setShowList] = useState(false);

    const acoesPorBairro = {};
    filteredAcoes.forEach(a => {
        const b = a.bairro?.nome;
        if (b) acoesPorBairro[b] = (acoesPorBairro[b] || 0) + 1;
    });

    // Cores estilo "previsão do tempo" (térmico)
    const getDistrictColor = (bairroNome) => {
        const count = acoesPorBairro[bairroNome] || 0;
        if (count === 0) return 'rgba(241, 245, 249, 0.5)'; // Slate muito claro/transparente

        const counts = Object.values(acoesPorBairro);
        const max = Math.max(...counts, 1);
        const ratio = count / max;

        // Escala: Amarelo -> Laranja -> Vermelho -> Roxo (Intenso)
        if (ratio < 0.25) return '#fde047'; // Amarelo
        if (ratio < 0.5) return '#fb923c';  // Laranja
        if (ratio < 0.75) return '#ef4444'; // Vermelho
        return '#a855f7';                  // Roxo
    };

    return (
        <div className="h-full w-full relative z-0 animate-fade-in flex flex-col">
            {/* FILTROS NO CANTO SUPERIOR ESQUERDO */}
            <div className="absolute top-6 left-6 z-[1001] w-72 pointer-events-none">
                <div className="bg-slate-900/95 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-white/10 pointer-events-auto flex flex-col gap-5">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] pl-1">Filtrar Rede</span>
                        <select
                            value={filterIgreja}
                            onChange={(e) => setFilterIgreja(e.target.value)}
                            className="bg-white/5 border-none text-xs font-bold text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none px-4 py-3 appearance-none cursor-pointer hover:bg-white/10 transition-all"
                        >
                            <option value="todas" className="bg-slate-900">Todas as Igrejas</option>
                            {igrejas.map(i => <option key={i.id} value={i.id} className="bg-slate-900">{i.nome}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] pl-1">Filtrar Clube</span>
                        <select
                            value={filterClube}
                            onChange={(e) => setFilterClube(e.target.value)}
                            className="bg-white/5 border-none text-xs font-bold text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none px-4 py-3 appearance-none cursor-pointer hover:bg-white/10 transition-all"
                        >
                            <option value="todos" className="bg-slate-900">Todos os Clubes</option>
                            {Array.from(new Set(acoes.map(a => a.clube?.nome))).filter(Boolean).map(name => (
                                <option key={name} value={name} className="bg-slate-900">{name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => setShowList(true)}
                        className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                    >
                        <List size={14} /> Ver Todas as Ações
                    </button>
                </div>

                {/* LEGENDA PEQUENA ABAIXO DO FILTRO */}
                <div className="mt-4 bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-slate-200 pointer-events-auto">
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Info size={12} className="text-slate-400" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Intensidade de Impacto</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <LegendItem color="#fde047" label="Baixa" />
                        <LegendItem color="#fb923c" label="Média" />
                        <LegendItem color="#ef4444" label="Alta" />
                        <LegendItem color="#a855f7" label="Foco Total" />
                    </div>
                </div>
            </div>

            {/* LISTAGEM LATERAL (DRAWER) */}
            {showList && (
                <div className="absolute inset-y-0 right-0 w-full md:w-[400px] z-[2005] animate-fade-in flex">
                    <div className="flex-1 bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col border-l border-slate-100">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Todas as Ações</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{filteredAcoes.length} Registros Encontrados</p>
                            </div>
                            <button onClick={() => setShowList(false)} className="p-3 bg-white rounded-2xl text-slate-400 hover:text-red-500 shadow-sm transition-all border border-slate-100">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {filteredAcoes.map(a => (
                                <div key={a.id} className="group cursor-pointer">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-md">
                                            <img src={a.fotos?.[0] || 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=200&auto=format&fit=crop'} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="grow">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-slate-800 text-sm leading-tight uppercase group-hover:text-indigo-600 transition-colors">{a.titulo}</h4>
                                            </div>
                                            <p className="text-[10px] text-slate-500 mb-2 font-medium bg-slate-100 px-2 py-1 rounded-lg inline-block">{a.bairro?.nome || 'Toledo'}</p>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md">{a.pessoas_atendidas} Pessoas</span>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{a.data_inicio ? format(parseISO(a.data_inicio), 'dd/MM') : ''}</span>
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
                center={[-24.7199, -53.7433]}
                zoom={13}
                className="h-full w-full"
                zoomControl={false}
                style={{ backgroundColor: '#f8fafc' }}
            >
                {bairros.map((b) => {
                    const count = acoesPorBairro[b.nome] || 0;
                    const items = filteredAcoes.filter(a => a.bairro?.nome === b.nome);
                    return b.geojson && (
                        <GeoJSON
                            key={b.id}
                            data={b.geojson}
                            pathOptions={{
                                fillColor: getDistrictColor(b.nome),
                                fillOpacity: count > 0 ? 0.75 : 0.1,
                                color: '#ffffff',
                                weight: 1.5,
                                opacity: 0.8
                            }}
                        >
                            <Popup className="custom-popup !rounded-[2.5rem] !p-0">
                                <div className="bg-slate-900 text-white p-6 rounded-t-[2.5rem]">
                                    <h4 className="font-black text-xl tracking-tighter mb-1">{b.nome}</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                        <p className="text-[10px] text-indigo-300 uppercase font-black tracking-[0.1em]">{count} IMPACTOS</p>
                                    </div>
                                </div>
                                <div className="p-5 max-h-[250px] overflow-y-auto space-y-4 bg-white rounded-b-[2.5rem]">
                                    {count > 0 ? (
                                        items.map(a => (
                                            <div key={a.id} className="pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                                <p className="text-[10px] font-black text-slate-800 uppercase mb-2 leading-tight">{a.titulo}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg font-bold">{a.pessoas_atendidas} atendidas</span>
                                                    <span className="text-[9px] text-slate-400 font-bold">{a.data_inicio ? format(parseISO(a.data_inicio), 'dd/MM/yy') : ''}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-slate-400 italic text-xs py-4">Nenhum impacto registrado ainda.</p>
                                    )}
                                </div>
                            </Popup>
                        </GeoJSON>
                    );
                })}
            </MapContainer>
        </div>
    );
};

const LegendItem = ({ color, label }) => (
    <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-md shadow-sm" style={{ backgroundColor: color }}></div>
        <span className="text-[10px] font-bold text-slate-600 tracking-tight">{label}</span>
    </div>
);

export default PublicHome;
