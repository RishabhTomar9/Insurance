import React, { createContext, useContext, useState, useRef } from 'react';

const DialogContext = createContext();

export const useConfirmed = () => useContext(DialogContext);

export const DialogProvider = ({ children }) => {
    const [dialog, setDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'danger', // danger, info, warning
        onConfirm: null
    });

    const resolveRef = useRef(null);

    const showConfirm = (title, message, type = 'danger') => {
        setDialog({
            isOpen: true,
            title,
            message,
            type,
            onConfirm: null
        });
        return new Promise((resolve) => {
            resolveRef.current = resolve;
        });
    };

    const handleClose = () => {
        setDialog(prev => ({ ...prev, isOpen: false }));
        if (resolveRef.current) {
            resolveRef.current(false);
            resolveRef.current = null;
        }
    };

    const handleConfirm = () => {
        setDialog(prev => ({ ...prev, isOpen: false }));
        if (resolveRef.current) {
            resolveRef.current(true);
            resolveRef.current = null;
        }
    };

    return (
        <DialogContext.Provider value={{ showConfirm }}>
            {children}
            {dialog.isOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-scale-in">
                        <div className="p-6">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className={`p-3 rounded-full ${dialog.type === 'danger' ? 'bg-red-100 text-red-600' :
                                        dialog.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                                            'bg-blue-100 text-blue-600'
                                    }`}>
                                    {dialog.type === 'danger' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">{dialog.title}</h3>
                            </div>
                            <p className="text-slate-600 mb-8">{dialog.message}</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={handleClose}
                                    className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={`px-5 py-2.5 rounded-lg text-white font-medium shadow-lg transition-transform transform hover:scale-105 ${dialog.type === 'danger' ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-200' :
                                            'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-200'
                                        }`}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DialogContext.Provider>
    );
};
