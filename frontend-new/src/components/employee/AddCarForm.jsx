import React, { useState } from 'react';
import { auth } from '../../services/firebase';

const AddCarForm = ({ onAdd }) => {
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [chassisNumber, setChassisNumber] = useState('');
    const [engineNumber, setEngineNumber] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleAddCar = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = await auth.currentUser.getIdToken();
            await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/cars`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ vehicleNumber, chassisNumber, engineNumber })
            });
            setSuccess('Car added successfully!');
            setVehicleNumber('');
            setChassisNumber('');
            setEngineNumber('');
            onAdd();
        } catch (error) {
            setError('Error adding car');
        }
    };

    return (
        <div style={{ backgroundColor: '#0f0f1a', padding: '2rem', borderRadius: '10px' }}>
            <h2 style={{ marginBottom: '1rem' }}>Add Car</h2>
            <form onSubmit={handleAddCar} style={{
                display: 'flex',
                flexDirection: 'column',
                width: '300px',
            }}>
                <input
                    type="text"
                    placeholder="Vehicle Number"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    style={{ padding: '10px', margin: '5px 0', borderRadius: '5px', border: '1px solid #6c5ce7', backgroundColor: '#1a1a2e', color: 'white' }}
                />
                <input
                    type="text"
                    placeholder="Chassis Number"
                    value={chassisNumber}
                    onChange={(e) => setChassisNumber(e.target.value)}
                    style={{ padding: '10px', margin: '5px 0', borderRadius: '5px', border: '1px solid #6c5ce7', backgroundColor: '#1a1a2e', color: 'white' }}
                />
                <input
                    type="text"
                    placeholder="Engine Number"
                    value={engineNumber}
                    onChange={(e) => setEngineNumber(e.target.value)}
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
                }}>Add Car</button>
            </form>
            {error && <p style={{ color: '#e74c3c', marginTop: '1rem' }}>{error}</p>}
            {success && <p style={{ color: '#2ecc71', marginTop: '1rem' }}>{success}</p>}
        </div>
    );
};

export default AddCarForm;
