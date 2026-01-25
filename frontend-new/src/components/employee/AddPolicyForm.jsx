import React, { useState } from 'react';
import { auth } from '../../services/firebase';

const AddPolicyForm = ({ onAdd, cars, owners }) => {
    const [selectedCar, setSelectedCar] = useState('');
    const [selectedOwner, setSelectedOwner] = useState('');
    const [policyType, setPolicyType] = useState('');
    const [premiumAmount, setPremiumAmount] = useState('');
    const [policyDuration, setPolicyDuration] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleAddPolicy = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = await auth.currentUser.getIdToken();
            await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/policies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ carId: selectedCar, ownerId: selectedOwner, policyType, premiumAmount, policyDuration })
            });
            setSuccess('Policy added successfully!');
            setSelectedCar('');
            setSelectedOwner('');
            setPolicyType('');
            setPremiumAmount('');
            setPolicyDuration('');
            onAdd();
        } catch (error) {
            setError('Error adding policy');
        }
    };

    return (
        <div style={{ backgroundColor: '#0f0f1a', padding: '2rem', borderRadius: '10px' }}>
            <h2 style={{ marginBottom: '1rem' }}>Add Policy</h2>
            <form onSubmit={handleAddPolicy} style={{
                display: 'flex',
                flexDirection: 'column',
                width: '300px',
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
                <button type="submit" style={{
                    backgroundColor: '#6c5ce7',
                    color: '#fff',
                    padding: '10px 15px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    marginTop: '1rem'
                }}>Add Policy</button>
            </form>
            {error && <p style={{ color: '#e74c3c', marginTop: '1rem' }}>{error}</p>}
            {success && <p style={{ color: '#2ecc71', marginTop: '1rem' }}>{success}</p>}
        </div>
    );
};

export default AddPolicyForm;
