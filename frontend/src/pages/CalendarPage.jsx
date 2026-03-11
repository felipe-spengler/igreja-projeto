import React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Building } from 'lucide-react';

const CalendarPage = ({ filteredAcoes }) => {
    return (
        <div className="p-8 h-screen overflow-y-auto bg-slate-50">
            <h2 className="text-5xl font-black text-slate-800 tracking-tighter mb-10">Agenda de Impacto</h2>
            <div className="space-y-6 max-w-4xl">
                {filteredAcoes.sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio)).map(a => (
                    <div key={a.id} className="bg-white p-8 rounded-[2rem] shadow-xl flex gap-8 items-center border border-slate-100 hover:shadow-2xl transition-all group">
                        <div className="w-24 h-24 bg-slate-50 rounded-3xl flex flex-col items-center justify-center border-2 border-slate-100 shrink-0 group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all">
                            <span className="text-xs uppercase font-black opacity-60 tracking-widest">{format(parseISO(a.data_inicio), 'MMM', { locale: ptBR })}</span>
                            <span className="text-4xl font-black leading-none">{format(parseISO(a.data_inicio), 'dd')}</span>
                        </div>
                        <div className="grow">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{a.titulo}</h3>
                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${a.status === 'realizada' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {a.status}
                                </span>
                            </div>
                            <p className="text-slate-500 font-medium line-clamp-2">{a.descricao}</p>
                            <div className="flex gap-6 mt-4 opacity-50 text-[10px] font-black uppercase">
                                <span className="flex items-center gap-1"><MapPin size={12} /> {a.bairro?.nome}</span>
                                <span className="flex items-center gap-1"><Building size={12} /> {a.clube?.igreja?.nome || 'Rede Geral'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CalendarPage;
