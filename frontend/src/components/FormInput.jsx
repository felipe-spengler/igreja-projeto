import React from 'react';

const FormInput = ({ label, placeholder, type = "text", value, onChange, required = false }) => (
    <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">{label}</label>
        <input
            type={type}
            required={required}
            value={value}
            onChange={onChange}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all font-bold text-slate-700"
            placeholder={placeholder}
        />
    </div>
);

export default FormInput;
