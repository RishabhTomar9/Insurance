import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

const CustomDropdown = ({
    options,
    value,
    onChange,
    placeholder = "Select Option",
    searchable = false,
    className = "",
    label = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.id === value || opt.value === value);

    const filteredOptions = searchable
        ? options.filter(opt =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : options;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onChange(option.id || option.value);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <div className={`relative w-full ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-[1px] ml-1">
                    {label}
                </label>
            )}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full p-3 bg-white border ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200'} rounded-xl cursor-pointer transition-all hover:bg-slate-50`}
            >
                <span className={`text-sm font-bold truncate ${selectedOption ? 'text-slate-900' : 'text-slate-400'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {searchable && (
                        <div className="p-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                            <Search size={14} className="text-slate-400" />
                            <input
                                type="text"
                                className="w-full bg-transparent border-none outline-none text-xs font-bold text-slate-700 placeholder:text-slate-300"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.id || opt.value}
                                    onClick={() => handleSelect(opt)}
                                    className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${value === (opt.id || opt.value) ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'
                                        }`}
                                >
                                    <span className="text-xs font-bold uppercase tracking-wider">{opt.label}</span>
                                    {value === (opt.id || opt.value) && <Check size={14} className="text-indigo-600" />}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                No results found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
