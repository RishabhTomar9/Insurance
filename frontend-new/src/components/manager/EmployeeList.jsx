import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import EditEmployeeForm from './EditEmployeeForm';
import { useToast } from '../../contexts/ToastContext';
import { useConfirmed } from '../../contexts/DialogContext';
import { Eye, Copy, Check } from 'lucide-react';

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
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Updated
            </span>
        );
    }

    if (!tempPassword) {
        return <span className="text-slate-400 text-xs">N/A</span>;
    }

    return (
        <div className="flex items-center space-x-2">
            <span className="font-mono text-xs">
                {show ? tempPassword : '••••••••'}
            </span>
            <button
                onClick={() => setShow(!show)}
                className="text-slate-400 hover:text-indigo-600 transition-colors"
                title={show ? "Hide" : "Show"}
            >
                <Eye size={14} />
            </button>
            <button
                onClick={handleCopy}
                className={`transition-colors ${copied ? 'text-green-600' : 'text-slate-400 hover:text-indigo-600'}`}
                title="Copy"
            >
                {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
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

        // Real-time listener for users in same company
        const q = query(collection(db, 'users'), where('companyId', '==', currentUser.companyId));
        const unsub = onSnapshot(q, (snap) => {
            setEmployees(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching employees:", error);
            addToast('Permission denied or error loading employees', 'error');
            setLoading(false);
        });

        return () => unsub();
    }, [currentUser]);

    const handleDelete = async (uid) => {
        const confirmed = await showConfirm(
            'Delete Employee Account',
            'Are you sure you want to permanently delete this employee? (This only deletes the Firestore profile, not the Auth account)',
            'danger'
        );
        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, 'users', uid));
            addToast('Employee profile deleted', 'success');
        } catch (error) {
            console.error(error);
            addToast('Error deleting employee', 'error');
        }
    };

    const handleUpdate = () => {
        setEditingEmployee(null);
    };


    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading employees...</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Password</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {employees.map(employee => (
                        <tr key={employee.uid} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{employee.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{employee.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{employee.employeeId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                <PasswordCell
                                    tempPassword={employee.tempPassword}
                                    passwordChanged={employee.passwordChanged}
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.disabled
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                    {employee.status || (employee.disabled ? 'Disabled' : 'Active')}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                    onClick={() => setEditingEmployee(employee)}
                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                >
                                    Edit
                                </button>

                            </td>
                        </tr>
                    ))}
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
