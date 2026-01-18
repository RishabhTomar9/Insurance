import React, { useState } from 'react';
import EmployeeList from '../components/manager/EmployeeList';
import { auth } from '../services/firebase';

const ManagerDashboard = () => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = await auth.currentUser.getIdToken();
            const response = await fetch('http://localhost:3000/api/manager/employee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(`Employee created successfully! Employee ID: ${data.employeeId}, Default Password: ${data.defaultPassword}`);
                setName('');
                setEmail('');
                setShowCreateForm(false);
            } else {
                setError(data.message || 'Error creating employee');
            }
        } catch (error) {
            setError('Error creating employee');
        }
    };

    return (
        <div style={{
            backgroundColor: '#1a1a2e',
            color: 'white',
            minHeight: '100vh',
            padding: '2rem',
            fontFamily: "'Poppins', sans-serif",
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Manager Dashboard</h1>
                <button onClick={() => auth.signOut()} style={{
                    backgroundColor: '#e74c3c',
                    color: '#fff',
                    padding: '10px 15px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 500,
                }}>Logout</button>
            </div>
            <button onClick={() => setShowCreateForm(!showCreateForm)} style={{
                backgroundColor: '#6c5ce7',
                color: '#fff',
                padding: '10px 15px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginBottom: '1rem',
                fontWeight: 500,
            }}>
                {showCreateForm ? 'Cancel' : '+ Create Employee'}
            </button>
            {showCreateForm && (
                <div style={{
                    backgroundColor: '#0f0f1a',
                    padding: '2rem',
                    borderRadius: '10px',
                    marginBottom: '1rem'
                }}>
                    <form onSubmit={handleCreateEmployee} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '300px',
                    }}>
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ padding: '10px', margin: '5px 0', borderRadius: '5px', border: '1px solid #6c5ce7', backgroundColor: '#1a1a2e', color: 'white' }}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ padding: '10px', margin: '5px 0', borderRadius: '5px', border: '1px solid #6c5ce7', backgroundColor: '#1a1a2e', color: 'white' }}
                        />
                        <button type="submit" style={{
                            backgroundColor: '#6c5ce7',
                            color: '#fff',
                            padding: '10px 15px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            marginTop: '1rem'
                        }}>Create</button>
                    </form>
                </div>
            )}
            {error && <p style={{ color: '#e74c3c' }}>{error}</p>}
            {success && <p style={{ color: '#2ecc71' }}>{success}</p>}
            <EmployeeList />
        </div>
    );
};

export default ManagerDashboard;