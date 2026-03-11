import React, { useState, useEffect, useRef } from 'react';
import { format, parseISO, isPast, isToday, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Building, Calendar as CalendarIcon, Filter, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

const CalendarPage = ({ filteredAcoes }) => {
    const [statusFilter, setStatusFilter] = useState('todos'); // 'todos', 'realizada', 'programada'
    const listRef = useRef(null);
    const todayRef = useRef(null);

    const sortedAcoes = [...filteredAcoes].sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio));

    const finalAcoes = sortedAcoes.filter(a => {
        if (statusFilter === 'todos') return true;
        return a.status === statusFilter;
    });

    // Encontrar o ID da ação mais próxima de hoje para o scroll automático
    const closestActionId = sortedAcoes.find(a => isToday(parseISO(a.data_inicio)) || isFuture(parseISO(a.data_inicio)))?.id;

    useEffect(() => {
        if (todayRef.current) {
            todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [finalAcoes]);

    return (
        <div className="h-screen flex flex-col bg-slate-50 uppercase tracking-tighter">
            <header className="p-8 pb-4 bg-white/50 backdrop-blur-md sticky top-0 z-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-6xl mx-auto">
                    <div className="animate-fade-in">
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">AGENDA</h2>
                        <p className="text-slate-500 mt-2 font-black text-[10px] uppercase tracking-widest pl-1">Cronograma de Impacto Social</p>
                    </div>

                    {/* FILTROS */}
                    <div className="flex bg-white p-1 rounded-2xl shadow-xl border border-slate-100 self-start animate-fade-in">
                        <button
                            onClick={() => setStatusFilter('todos')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${statusFilter === 'todos' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            TODOS
                        </button>
                        <button
                            onClick={() => setStatusFilter('programada')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${statusFilter === 'programada' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            AGENDADOS
                        </button>
                        <button
                            onClick={() => setStatusFilter('realizada')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${statusFilter === 'realizada' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            REALIZADOS
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar" ref={listRef}>
                <div className="max-w-4xl mx-auto space-y-4">
                    {finalAcoes.length > 0 ? (
                        finalAcoes.map((a, idx) => {
                            const isTodayOrFuture = isToday(parseISO(a.data_inicio)) || isFuture(parseISO(a.data_inicio));
                            const isPastAction = isPast(parseISO(a.data_inicio)) && !isToday(parseISO(a.data_inicio));
                            const isClosest = a.id === closestActionId;

                            return (
                                <div
                                    key={a.id}
                                    ref={isClosest ? todayRef : null}
                                    className={`
                                        bg-white p-6 rounded-[2rem] shadow-xl flex flex-col md:flex-row gap-6 items-center border transition-all group relative overflow-hidden
                                        ${isPastAction ? 'opacity-60 grayscale-[0.5] scale-[0.98]' : 'hover:shadow-2xl hover:scale-[1.01]'}
                                        ${isClosest ? 'border-indigo-500' : 'border-slate-100'}
                                    `}
                                >
                                    {isClosest && (
                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                    )}

                                    {/* DATA CARD */}
                                    <div className={`
                                        w-20 md:w-24 h-20 md:h-24 rounded-[2rem] flex flex-col items-center justify-center border-2 shrink-0 transition-all
                                        ${isPastAction ? 'bg-slate-50 border-slate-100 text-slate-400' : 'bg-white border-slate-100 text-slate-800 shadow-sm'}
                                        ${!isPastAction ? 'group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white group-hover:shadow-indigo-200' : ''}
                                    `}>
                                        <span className="text-[10px] uppercase font-black tracking-widest leading-none mb-1">{format(parseISO(a.data_inicio), 'MMM', { locale: ptBR })}</span>
                                        <span className="text-3xl font-black leading-none">{format(parseISO(a.data_inicio), 'dd')}</span>
                                    </div>

                                    {/* INFO */}
                                    <div className="grow text-center md:text-left">
                                        <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-tight italic">{a.titulo}</h3>
                                            <span className={`
                                                px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5
                                                ${a.status === 'realizada' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}
                                            `}>
                                                {a.status === 'realizada' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                                {a.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-xs font-semibold leading-relaxed line-clamp-2 uppercase italic tracking-tight mb-4">{a.descricao}</p>

                                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                            <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                                <MapPin size={10} className="text-indigo-400" /> {a.bairro?.nome}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                                <Building size={10} className="text-emerald-400" /> {a.clube?.nome || 'REDE GERAL'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="hidden md:flex items-center text-slate-100 group-hover:text-indigo-100 group-hover:translate-x-1 transition-all">
                                        <ChevronRight size={32} />
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                            <CalendarIcon size={48} className="mx-auto text-slate-100 mb-4" />
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">Nenhuma atividade neste filtro</p>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
            `}} />
        </div>
    );
};

export default CalendarPage;
