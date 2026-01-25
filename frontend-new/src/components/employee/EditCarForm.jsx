import React, { useState } from 'react';
import { auth } from '../../services/firebase';

const EditCarForm = ({ car, onUpdate, onCancel }) => {
    const [vehicleNumber, setVehicleNumber] = useState(car.vehicleNumber);
    const [chassisNumber, setChassisNumber] = useState(car.chassisNumber);
    const [engineNumber, setEngineNumber] = useState(car.engineNumber);
    const [error, setError] = useState('');

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const token = await auth.currentUser.getIdToken();
            await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/cars/${car._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ vehicleNumber, chassisNumber, engineNumber })
            });
            onUpdate();
        } catch (error) {
            setError('Error updating car');
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
                <h2 style={{ marginBottom: '1rem', color: 'white' }}>Edit Car</h2>
                <form onSubmit={handleUpdate} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '300px'
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

export default EditCarForm;
