import React, { useState, useEffect } from 'react';
import { auth } from '../../services/firebase';

const EditPolicyForm = ({ policy, onUpdate, onCancel, cars, owners }) => {
    const [selectedCar, setSelectedCar] = useState(policy.carId);
    const [selectedOwner, setSelectedOwner] = useState(policy.ownerId);
    const [policyType, setPolicyType] = useState(policy.policyType);
    const [premiumAmount, setPremiumAmount] = useState(policy.premiumAmount);
    const [policyDuration, setPolicyDuration] = useState(policy.policyDuration);
    const [error, setError] = useState('');

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const token = await auth.currentUser.getIdToken();
            await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/policies/${policy._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ carId: selectedCar, ownerId: selectedOwner, policyType, premiumAmount, policyDuration })
            });
            onUpdate();
        } catch (error) {
            setError('Error updating policy');
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
                <h2 style={{ marginBottom: '1rem', color: 'white' }}>Edit Policy</h2>
                <form onSubmit={handleUpdate} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '300px'
                }}>
                    <select value={selectedCar} onChange={(e) => setSelectedCar(e.target.value)} style={{ padding: '10px', margin: '5px 0', borderRadius: '5px', border: '1px solid #6c5ce7', backgroundColor: '#1a1a2e', color: 'white' }}>
                        <option value="">Select Car</option>
                        {cars.map(car => (
                            <option key={car._id} value={car._id}>{car.vehicleNumber}</option>
                        ))}
                    </select>
                    <select value={selectedOwner} onChange={(e) => setSelectedOwner(e.target.value)} style={{ padding: '10px', margin: '5px 0', borderRadius: '5px', border: '1px solid #6c5ce7', backgroundColor: '#1a1a2e', color: 'white' }}>
                        <option value="">Select Owner</option>
                        {owners.map(owner => (
                            <option key={owner._id} value={owner._id}>{owner.name}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Policy Type"
                        value={policyType}
                        onChange={(e) => setPolicyType(e.target.value)}
                        style={{ padding: '10px', margin: '5px 0', borderRadius: '5px', border: '1px solid #6c5ce7', backgroundColor: '#1a1a2e', color: 'white' }}
                    />
                    <input
                        type="number"
                        placeholder="Premium Amount"
                        value={premiumAmount}
                        onChange={(e) => setPremiumAmount(e.target.value)}
                        style={{ padding: '10px', margin: '5px 0', borderRadius: '5px', border: '1px solid #6c5ce7', backgroundColor: '#1a1a2e', color: 'white' }}
                    />
                    <input
                        type="text"
                        placeholder="Policy Duration"
                        value={policyDuration}
                        onChange={(e) => setPolicyDuration(e.target.value)}
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

export default EditPolicyForm;
