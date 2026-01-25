import React, { useState, useEffect } from 'react';
import { auth } from '../../services/firebase';
import EditEmployeeForm from './EditEmployeeForm';
import { useToast } from '../../contexts/ToastContext';
import { useConfirmed } from '../../contexts/DialogContext';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();
    const { showConfirm } = useConfirmed();
    const [editingEmployee, setEditingEmployee] = useState(null);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const token = await auth.currentUser.getIdToken();
            const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setEmployees(data);
            setEmployees(data);
        } catch (error) {
            addToast('Error fetching employees', 'error');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleStatusChange = async (uid, newStatus) => {
        if (newStatus === 'Deleted') {
            const confirmed = await showConfirm(
                'Delete Employee Account',
                'Are you sure you want to delete this employee? This will revoke their access immediately.',
                'danger'
            );
            if (!confirmed) {
                fetchEmployees();
                return;
            }
        }

        try {
            const token = await auth.currentUser.getIdToken();
            const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/manager/employee/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ uid, status: newStatus })
            });

            if (response.ok) {
                addToast(`Status updated to ${newStatus}`, 'success');
                fetchEmployees();
            } else {
                const data = await response.json();
                addToast(data.message || 'Error updating status', 'error');
            }
        } catch (error) {
            addToast('Error updating status', 'error');
        }
    };

    const handleUpdate = () => {
        setEditingEmployee(null);
        fetchEmployees();
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
                            <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                    value={employee.status || (employee.disabled ? 'Deleted' : 'Active')}
                                    onChange={(e) => handleStatusChange(employee.uid, e.target.value)}
                                    className={`px-3 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer ${(employee.status === 'Active' || (!employee.status && !employee.disabled)) ? 'bg-emerald-100 text-emerald-800' :
                                        (employee.status === 'On Leave') ? 'bg-amber-100 text-amber-800' :
                                            'bg-red-100 text-red-800'
                                        }`}
                                >
                                    <option value="Active" className="bg-white text-slate-800">Active</option>
                                    <option value="On Leave" className="bg-white text-slate-800">On Leave</option>
                                    <option value="Deleted" className="bg-white text-slate-800">Deleted</option>
                                </select>
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
                />
            )}
        </div>
    );
};

export default EmployeeList;
