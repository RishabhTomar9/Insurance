import React, { useState, useEffect } from 'react';
import { auth } from '../../services/firebase';
import EditEmployeeForm from './EditEmployeeForm';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingEmployee, setEditingEmployee] = useState(null);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const token = await auth.currentUser.getIdToken();
            const response = await fetch('http://localhost:3000/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setEmployees(data);
        } catch (error) {
            setError('Error fetching employees');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleDeactivate = async (uid) => {
        setError('');
        try {
            const token = await auth.currentUser.getIdToken();
            const response = await fetch('http://localhost:3000/api/manager/employee/disable', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ uid })
            });

            if (response.ok) {
                fetchEmployees();
            } else {
                const data = await response.json();
                setError(data.message || 'Error deactivating employee');
            }
        } catch (error) {
            setError('Error deactivating employee');
        }
    };

    const handleUpdate = () => {
        setEditingEmployee(null);
        fetchEmployees();
    };

    if (loading) {
        return <p>Loading employees...</p>;
    }

    return (
        <div style={{
            backgroundColor: '#0f0f1a',
            padding: '2rem',
            borderRadius: '10px',
        }}>
            <h2 style={{ marginBottom: '1rem' }}>Employee List</h2>
            {error && <p style={{ color: '#e74c3c' }}>{error}</p>}
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #6c5ce7' }}>
                        <th style={{ padding: '12px 15px', textAlign: 'left' }}>Name</th>
                        <th style={{ padding: '12px 15px', textAlign: 'left' }}>Email</th>
                        <th style={{ padding: '12px 15px', textAlign: 'left' }}>Employee ID</th>
                        <th style={{ padding: '12px 15px', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '12px 15px', textAlign: 'left' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map(employee => (
                        <tr key={employee.uid} style={{ borderBottom: '1px solid #1a1a2e' }}>
                            <td style={{ padding: '12px 15px' }}>{employee.name}</td>
                            <td style={{ padding: '12px 15px' }}>{employee.email}</td>
                            <td style={{ padding: '12px 15px' }}>{employee.employeeId}</td>
                            <td style={{ padding: '12px 15px' }}>
                                <span style={{
                                    backgroundColor: employee.disabled ? '#e74c3c' : '#2ecc71',
                                    padding: '5px 10px',
                                    borderRadius: '5px',
                                    color: 'white'
                                }}>
                                    {employee.disabled ? 'Disabled' : 'Active'}
                                </span>
                            </td>
                            <td style={{ padding: '12px 15px' }}>
                                <button onClick={() => setEditingEmployee(employee)} style={{
                                    backgroundColor: '#3498db',
                                    color: '#fff',
                                    padding: '8px 12px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    marginRight: '5px',
                                    fontWeight: 500,
                                }}>Edit</button>
                                {!employee.disabled && (
                                    <button onClick={() => handleDeactivate(employee.uid)} style={{
                                        backgroundColor: '#e74c3c',
                                        color: '#fff',
                                        padding: '8px 12px',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                    }}>Deactivate</button>
                                )}
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

