import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import AddCarForm from '../components/employee/AddCarForm';
import AddOwnerForm from '../components/employee/AddOwnerForm';
import AddPolicyForm from '../components/employee/AddPolicyForm';
import EditCarForm from '../components/employee/EditCarForm';
import EditOwnerForm from '../components/employee/EditOwnerForm';
import EditPolicyForm from '../components/employee/EditPolicyForm';

const EmployeeDashboard = () => {
    const { currentUser } = useAuth();
    const [cars, setCars] = useState([]);
    const [owners, setOwners] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [editingCar, setEditingCar] = useState(null);
    const [editingOwner, setEditingOwner] = useState(null);
    const [editingPolicy, setEditingPolicy] = useState(null);

    const fetchData = async () => {
        if (currentUser) {
            const token = await auth.currentUser.getIdToken();
            const headers = { 'Authorization': `Bearer ${token}` };

            const [carsRes, ownersRes, policiesRes] = await Promise.all([
                fetch('http://localhost:3000/api/cars', { headers }),
                fetch('http://localhost:3000/api/owners', { headers }),
                fetch('http://localhost:3000/api/policies', { headers }),
            ]);

            const carsData = await carsRes.json();
            const ownersData = await ownersRes.json();
            const policiesData = await policiesRes.json();

            setCars(carsData);
            setOwners(ownersData);
            setPolicies(policiesData);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentUser]);

    const handleDelete = async (collectionName, id) => {
        try {
            const token = await auth.currentUser.getIdToken();
            await fetch(`http://localhost:3000/api/${collectionName}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            fetchData();
        } catch (error) {
            console.error(`Error deleting ${collectionName}: `, error);
        }
    };

    const handleUpdate = () => {
        setEditingCar(null);
        setEditingOwner(null);
        setEditingPolicy(null);
        fetchData();
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
                <h1>Employee Dashboard</h1>
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
            <div style={{
                backgroundColor: '#0f0f1a',
                padding: '2rem',
                borderRadius: '10px',
                marginBottom: '1rem'
            }}>
                <h2>My Performance</h2>
                <p>Total Policies Created: {policies.length}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                <AddCarForm onAdd={fetchData} />
                <AddOwnerForm onAdd={fetchData} />
                <AddPolicyForm onAdd={fetchData} cars={cars} owners={owners} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
                <div style={{ backgroundColor: '#0f0f1a', padding: '2rem', borderRadius: '10px' }}>
                    <h2>My Cars</h2>
                    <ul>
                        {cars.map(car => (
                            <li key={car._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                {car.vehicleNumber}
                                <div>
                                    <button onClick={() => setEditingCar(car)} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', marginRight: '5px' }}>Edit</button>
                                    <button onClick={() => handleDelete('cars', car._id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div style={{ backgroundColor: '#0f0f1a', padding: '2rem', borderRadius: '10px' }}>
                    <h2>Owners</h2>
                    <ul>
                        {owners.map(owner => (
                            <li key={owner._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                {owner.name}
                                <div>
                                    <button onClick={() => setEditingOwner(owner)} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', marginRight: '5px' }}>Edit</button>
                                    <button onClick={() => handleDelete('owners', owner._id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div style={{ backgroundColor: '#0f0f1a', padding: '2rem', borderRadius: '10px' }}>
                    <h2>My Policies</h2>
                    <ul>
                        {policies.map(policy => (
                            <li key={policy._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                {policy.policyType}
                                <div>
                                    <button onClick={() => setEditingPolicy(policy)} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', marginRight: '5px' }}>Edit</button>
                                    <button onClick={() => handleDelete('policies', policy._id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {editingCar && (
                <EditCarForm
                    car={editingCar}
                    onUpdate={handleUpdate}
                    onCancel={() => setEditingCar(null)}
                />
            )}
            {editingOwner && (
                <EditOwnerForm
                    owner={editingOwner}
                    onUpdate={handleUpdate}
                    onCancel={() => setEditingOwner(null)}
                />
            )}
            {editingPolicy && (
                <EditPolicyForm
                    policy={editingPolicy}
                    onUpdate={handleUpdate}
                    onCancel={() => setEditingPolicy(null)}
                    cars={cars}
                    owners={owners}
                />
            )}
        </div>
    );
};

export default EmployeeDashboard;