import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import EditEmployeeForm from './EditEmployeeForm';
import { useToast } from '../../contexts/ToastContext';
import { useConfirmed } from '../../contexts/DialogContext';
import { Eye, Copy, Check, EyeOff, ShieldCheck, User, Mail, Hash, Key, Activity, Edit3 } from 'lucide-react';

const PasswordCell = ({ tempPassword, passwordChanged }) => {
    const [show, setShow] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!tempPassword) return;
        navigator.clipboard.writeText(tempPassword);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (passwordChanged) {
        return (
            <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold">
                <ShieldCheck size={12} className="mr-2" /> Verified
            </span>
        );
    }

    if (!tempPassword) {
        return <span className="text-slate-300 text-[10px] tracking-widest uppercase italic font-bold">No Records</span>;
    }

    return (
        <div className="flex items-center gap-3">
            <span className={`font-bold text-[11px] tracking-[2px] transition-all duration-300 ${show ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                {show ? tempPassword : '••••••••'}
            </span>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => setShow(!show)}
                    className="p-2 bg-white text-slate-400 hover:text-indigo-600 transition-all rounded-lg border border-slate-100 hover:border-indigo-200"
                    title={show ? "Hide" : "Show"}
                >
                    {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                    onClick={handleCopy}
                    className={`p-2 bg-white rounded-lg border border-slate-100 transition-all ${copied ? 'text-emerald-500 border-emerald-500/40' : 'text-slate-400 hover:text-emerald-600'}`}
                    title="Copy"
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
            </div>
        </div>
    );
};

const EmployeeList = () => {
    const { currentUser } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();
    const { showConfirm } = useConfirmed();
    const [editingEmployee, setEditingEmployee] = useState(null);

    useEffect(() => {
        if (!currentUser?.companyId) return;

        const q = query(collection(db, 'users'), where('companyId', '==', currentUser.companyId));
        const unsub = onSnapshot(q, (snap) => {
            setEmployees(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
            setLoading(false);
        }, (error) => {
            console.error(error);
            addToast('Access denied', 'error');
            setLoading(false);
        });

        return () => unsub();
    }, [currentUser]);

    const handleDelete = async (uid) => {
        const confirmed = await showConfirm(
            'Delete Employee',
            'Are you sure you want to remove this employee record?',
            'danger'
        );
        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, 'users', uid));
            addToast('Employee removed', 'success');
        } catch (error) {
            console.error(error);
            addToast('Delete failed', 'error');
        }
    };

    const handleUpdate = () => {
        setEditingEmployee(null);
    };

    if (loading) {
        return (
            <div className="p-20 text-center">
                <div className="w-12 h-12 border-2 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6" />
                <p className="text-slate-400 font-bold uppercase tracking-[4px] text-[10px]">Syncing Matrix...</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
                <thead>
                    <tr className="bg-slate-50/50">
                        <th className="px-10 py-6 text-left text-[10px] text-slate-400 uppercase tracking-[2px] font-bold">
                            <div className="flex items-center gap-3">
                                <User size={14} className="text-slate-300" /> FULL NAME
                            </div>
                        </th>
                        <th className="px-10 py-6 text-left text-[10px] text-slate-400 uppercase tracking-[2px] font-bold">
                            <div className="flex items-center gap-3">
                                <Mail size={14} className="text-slate-300" /> EMAIL ADDRESS
                            </div>
                        </th>
                        <th className="px-10 py-6 text-left text-[10px] text-slate-400 uppercase tracking-[2px] font-bold">
                            <div className="flex items-center gap-3">
                                <Hash size={14} className="text-slate-300" /> EMPLOYEE ID
                            </div>
                        </th>
                        <th className="px-10 py-6 text-left text-[10px] text-slate-400 uppercase tracking-[2px] font-bold">
                            <div className="flex items-center gap-3">
                                <Key size={14} className="text-slate-300" /> TEMP KEY
                            </div>
                        </th>
                        <th className="px-10 py-6 text-left text-[10px] text-slate-400 uppercase tracking-[2px] font-bold">
                            <div className="flex items-center gap-3">
                                <Activity size={14} className="text-slate-300" /> STATUS
                            </div>
                        </th>
                        <th className="px-10 py-6 text-right text-[10px] text-slate-400 uppercase tracking-[2px] font-bold">ACTION</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                    {employees.map(employee => (
                        <tr key={employee.uid} className="hover:bg-indigo-50/30 transition-all group">
                            <td className="px-10 py-6 whitespace-nowrap">
                                <span className="text-sm font-bold text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                                    {employee.name}
                                </span>
                            </td>
                            <td className="px-10 py-6 whitespace-nowrap">
                                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">{employee.email}</span>
                            </td>
                            <td className="px-10 py-6 whitespace-nowrap">
                                <span className="text-[12px] font-bold text-indigo-500 tracking-widest">{employee.employeeId}</span>
                            </td>
                            <td className="px-10 py-6 whitespace-nowrap">
                                <PasswordCell
                                    tempPassword={employee.tempPassword}
                                    passwordChanged={employee.passwordChanged}
                                />
                            </td>
                            <td className="px-10 py-6 whitespace-nowrap">
                                <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border ${employee.status === 'Inactive' || employee.disabled
                                    ? 'bg-rose-50 text-rose-600 border-rose-100'
                                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    }`}>
                                    <span className={`w-2 h-2 rounded-full mr-3 ${employee.status === 'Inactive' || employee.disabled ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
                                    {employee.status || (employee.disabled ? 'Inactive' : 'Active')}
                                </span>
                            </td>
                            <td className="px-10 py-6 whitespace-nowrap text-right">
                                <button
                                    onClick={() => setEditingEmployee(employee)}
                                    className="p-3 bg-white text-slate-400 hover:text-indigo-600 border border-slate-100 hover:border-indigo-200 rounded-2xl transition-all shadow-sm group/btn ml-auto"
                                >
                                    <Edit3 size={16} className="group-hover/btn:rotate-12 transition-transform" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {employees.length === 0 && (
                        <tr>
                            <td colSpan="6" className="px-10 py-24 text-center">
                                <p className="text-slate-300 uppercase tracking-[4px] text-xs font-bold">No Records Found</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {editingEmployee && (
                <EditEmployeeForm
                    employee={editingEmployee}
                    onUpdate={handleUpdate}
                    onCancel={() => setEditingEmployee(null)}
                    onDelete={() => {
                        handleDelete(editingEmployee.uid);
                        setEditingEmployee(null);
                    }}
                />
            )}
        </div>
    );
};

export default EmployeeList;
