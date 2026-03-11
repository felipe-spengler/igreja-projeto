import React from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import { format, parseISO } from 'date-fns';
import 'leaflet/dist/leaflet.css';

const PublicHome = ({ acoes, bairros, filteredAcoes, filterIgreja, setFilterIgreja, filterClube, setFilterClube, igrejas }) => {
    const acoesPorBairro = {};
    filteredAcoes.forEach(a => {
        const b = a.bairro?.nome;
        if (b) acoesPorBairro[b] = (acoesPorBairro[b] || 0) + 1;
    });

    const getDistrictColor = (bairroNome) => {
        const count = acoesPorBairro[bairroNome] || 0;
        if (count === 0) return 'transparent';
        const maxAcoes = Math.max(...Object.values(acoesPorBairro), 1);
        const intensity = 0.4 + (count / maxAcoes) * 0.6;
        return `rgba(239, 68, 68, ${intensity})`;
    };

    return (
        <div className="h-full w-full relative z-0 animate-fade-in flex flex-col pt-4">
            <div className="absolute top-4 lg:top-8 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-2xl px-4">
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-slate-200/50 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex flex-col px-2 w-full md:grow min-w-[150px]">
                        <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest pl-1">Filtrar por Rede</span>
                        <select
                            value={filterIgreja}
                            onChange={(e) => setFilterIgreja(e.target.value)}
                            className="bg-slate-100/50 border-none text-sm font-bold text-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none pr-8 py-2"
                        >
                            <option value="todas">Todas as Igrejas</option>
                            {igrejas.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                        </select>
                    </div>
                    <div className="w-full md:w-[1px] h-[1px] md:h-8 bg-slate-200"></div>
                    <div className="flex flex-col px-2 w-full md:grow min-w-[150px]">
                        <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest pl-1">Filtrar por Ministério</span>
                        <select
                            value={filterClube}
                            onChange={(e) => setFilterClube(e.target.value)}
                            className="bg-slate-100/50 border-none text-sm font-bold text-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none pr-8 py-2"
                        >
                            <option value="todos">Todos os Ministérios</option>
                            {Array.from(new Set(acoes.map(a => a.clube?.nome))).filter(Boolean).map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

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
                                fillOpacity: count > 0 ? 0.7 : 0,
                                color: '#000000',
                                weight: 2,
                                opacity: 1
                            }}
                        >
                            <Popup className="font-sans min-w-[300px] !rounded-3xl !p-0 overflow-hidden shadow-2xl">
                                <div className="bg-slate-900 text-white p-4">
                                    <h4 className="font-bold text-lg">{b.nome}</h4>
                                    <p className="text-[10px] text-indigo-300 uppercase font-black uppercase tracking-widest">{count} {count === 1 ? 'Impacto Registrado' : 'Impactos Registrados'}</p>
                                </div>
                                <div className="p-4 max-h-[300px] overflow-y-auto">
                                    {count > 0 ? (
                                        <div className="space-y-4">
                                            {items.map(a => (
                                                <div key={a.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0 group">
                                                    <div className="flex items-center gap-2 font-bold text-slate-800 mb-2 truncate">
                                                        <span className={`w-2.5 h-2.5 rounded-full ${a.status === 'realizada' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                        <span className="uppercase text-xs">{a.titulo}</span>
                                                    </div>
                                                    {a.fotos && a.fotos.length > 0 && (
                                                        <img src={a.fotos[0]} className="w-full h-32 object-cover rounded-2xl mb-3 shadow-md border border-slate-100" alt={a.titulo} />
                                                    )}
                                                    <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase">
                                                        <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg">{a.pessoas_atendidas} impactadas</span>
                                                        <span>{a.data_inicio ? format(parseISO(a.data_inicio), 'dd/MM/yyyy') : ''}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-slate-400 italic text-xs">Nenhuma ação vinculada neste bairro ainda.</div>
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

export default PublicHome;
