import React, { useState } from 'react';
import { auth } from '../../services/firebase';

const EditEmployeeForm = ({ employee, onUpdate, onCancel }) => {
    const [name, setName] = useState(employee.name);
    const [email, setEmail] = useState(employee.email);
    const [error, setError] = useState('');

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const token = await auth.currentUser.getIdToken();
            const response = await fetch('http://localhost:3000/api/manager/employee/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ uid: employee.uid, name, email })
            });

            if (response.ok) {
                onUpdate();
            } else {
                const data = await response.json();
                setError(data.message || 'Error updating employee');
            }
        } catch (error) {
            setError('Error updating employee');
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            fontFamily: "'Poppins', sans-serif",
        }}>
            <div style={{
                backgroundColor: '#0f0f1a',
                padding: '2rem',
                borderRadius: '10px',
            }}>
                <h2 style={{ marginBottom: '1rem', color: 'white' }}>Edit Employee</h2>
                <form onSubmit={handleUpdate} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '300px'
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
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button type="button" onClick={onCancel} style={{
                            backgroundColor: 'transparent',
                            color: '#fff',
                            padding: '10px 15px',
                            border: '1px solid #6c5ce7',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginRight: '1rem'
                        }}>Cancel</button>
                        <button type="submit" style={{
                            backgroundColor: '#6c5ce7',
                            color: '#fff',
                            padding: '10px 15px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}>Update</button>
                    </div>
                </form>
                {error && <p style={{ color: '#e74c3c', marginTop: '1rem' }}>{error}</p>}
            </div>
        </div>
    );
};

export default EditEmployeeForm;
