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

    const handleDelete = async (uid) => {
        const confirmed = await showConfirm(
            'Delete Employee Account',
            'Are you sure you want to permanently delete this employee? This action cannot be undone.',
            'danger'
        );
        if (!confirmed) return;

        try {
            const token = await auth.currentUser.getIdToken();
            const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/manager/employee/${uid}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                addToast('Employee deleted successfully', 'success');
                fetchEmployees();
            } else {
                const data = await response.json();
                addToast(data.message || 'Error deleting employee', 'error');
            }
        } catch (error) {
            addToast('Error deleting employee', 'error');
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
