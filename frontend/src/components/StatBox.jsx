import React from 'react';

const StatBox = ({ count, label, color }) => (
    <div className="bg-white px-8 py-6 rounded-3xl shadow-xl border border-slate-100 min-w-[140px] text-center">
        <h4 className={`text-3xl font-black mb-1 ${color.replace('bg-', 'text-')}`}>{count}</h4>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
    </div>
);

export default StatBox;
