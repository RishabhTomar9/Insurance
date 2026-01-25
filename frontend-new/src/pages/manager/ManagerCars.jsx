import React, { useState, useEffect } from 'react';
import { auth } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useConfirmed } from '../../contexts/DialogContext';

const ManagerCars = () => {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const { showConfirm } = useConfirmed();
    const [cars, setCars] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editId, setEditId] = useState(null); // Track which car is being edited

    const initialFormState = {
        make: '',
        model: '',
        manufacturingYear: new Date().getFullYear(),
        fuelType: 'Petrol',
        vehicleNumber: '',
        chassisNumber: '',
        engineNumber: '',
        registrationDate: '',
        previousOwners: [],
        employeeId: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [prevOwnerInput, setPrevOwnerInput] = useState({ name: '', period: '' });

    const fetchCars = async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/cars`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setCars(data);
        } catch (error) {
            console.error('Error fetching cars');
            addToast('Failed to load vehicles', 'error');
        }
        setLoading(false);
    };

    const fetchEmployees = async () => {
        if (currentUser?.role === 'manager') {
            try {
                const token = await auth.currentUser.getIdToken();
                const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                setEmployees(data);
            } catch (error) {
                console.error('Error fetching employees');
            }
        }
    };

    useEffect(() => {
        fetchCars();
        fetchEmployees();
    }, [currentUser]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addPreviousOwner = () => {
        if (prevOwnerInput.name) {
            setFormData(prev => ({
                ...prev,
                previousOwners: [...prev.previousOwners, { ...prevOwnerInput }]
            }));
            setPrevOwnerInput({ name: '', period: '' });
        }
    };

    const handleEdit = (car) => {
        setEditId(car._id);
        const formattedDate = car.registrationDate ? new Date(car.registrationDate).toISOString().split('T')[0] : '';
        setFormData({
            ...car,
            registrationDate: formattedDate,
            previousOwners: car.previousOwners || [],
            employeeId: car.employeeId || ''
        });
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditId(null);
        setFormData(initialFormState);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await auth.currentUser.getIdToken();
            const url = editId
                ? `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/cars/${editId}`
                : `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/cars`;

            const method = editId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                handleCloseModal();
                fetchCars();
                addToast(editId ? 'Vehicle updated successfully' : 'Vehicle registered successfully', 'success');
            } else {
                addToast('Failed to save car. Check if fields are valid.', 'warning');
            }
        } catch (error) {
            addToast('Error saving vehicle details', 'error');
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm(
            'Delete Vehicle Record',
            'Are you sure you want to remove this vehicle from the system? Associated policies might be affected.',
            'danger'
        );
        if (!confirmed) return;

        try {
            const token = await auth.currentUser.getIdToken();
            await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/cars/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchCars();
            addToast('Vehicle record deleted', 'info');
        } catch (error) {
            console.error(error);
            addToast('Failed to delete vehicle', 'error');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading cars...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Vehicle Management</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg shadow-blue-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    <span>Register New Vehicle</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map(car => (
                    <div key={car._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-50"><svg className="w-24 h-24 text-slate-100 transform rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M19 19H5V8h14m-3-5v2.206l-1.6 .8L11 6h-5L2.6 10l-1.6-.8V7h3M3 19v2h2v-2h12v2h2v-2M5 12h14" /></svg></div>
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-2">
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded uppercase">{car.fuelType}</span>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleEdit(car)} className="text-slate-300 hover:text-blue-500 transition-colors" title="Edit">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                    </button>
                                    <button onClick={() => handleDelete(car._id)} className="text-slate-300 hover:text-red-500 transition-colors" title="Delete">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">{car.vehicleNumber}</h3>
                            <p className="text-sm text-slate-500 mb-4">{car.make} {car.model} ({car.manufacturingYear})</p>

                            <div className="space-y-2 border-t border-slate-100 pt-4">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Chassis No</span>
                                    <span className="font-mono text-slate-600">{car.chassisNumber}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Engine No</span>
                                    <span className="font-mono text-slate-600">{car.engineNumber}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Owners History</span>
                                    <span className="font-medium text-slate-600">{car.previousOwners?.length || 0} Previous</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{editId ? 'Edit Vehicle' : 'Register Vehicle'}</h3>
                                <p className="text-sm text-slate-500">{editId ? 'Update vehicle details' : 'Enter comprehensive vehicle details'}</p>
                            </div>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">

                            {/* Basic Details */}
                            {currentUser?.role === 'manager' && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                                    <label className="block text-sm font-bold text-blue-700 mb-2">Assign to Employee</label>
                                    <select
                                        name="employeeId"
                                        value={formData.employeeId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">-- Assign to Me --</option>
                                        {employees.map(emp => (
                                            <option key={emp.uid} value={emp.uid}>{emp.email}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-blue-400 mt-1">Leave blank to keep ownership assigned to yourself.</p>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Registration Number</label>
                                    <input name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono" placeholder="MH-01-AB-1234" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Registration Date</label>
                                    <input type="date" name="registrationDate" value={formData.registrationDate} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Make (Brand)</label>
                                    <input name="make" value={formData.make} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Toyota" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Model</label>
                                    <input name="model" value={formData.model} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Fortuner" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Fuel Type</label>
                                    <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option>Petrol</option>
                                        <option>Diesel</option>
                                        <option>CNG</option>
                                        <option>Electric</option>
                                        <option>Hybrid</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Manufacturing Year</label>
                                    <input type="number" name="manufacturingYear" value={formData.manufacturingYear} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" min="1900" max="2100" required />
                                </div>
                            </div>

                            {/* Immutable Technical Details */}
                            <div className={`bg-slate-50 p-4 rounded-lg border border-slate-200 ${editId ? 'opacity-70' : ''}`}>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Critical Identification (Immutable)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Chassis Number {editId && <span className="text-xs text-red-500">(Not Editable)</span>}</label>
                                        <input name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white font-mono" placeholder="Unique Chassis ID" required disabled={!!editId} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Engine Number {editId && <span className="text-xs text-red-500">(Not Editable)</span>}</label>
                                        <input name="engineNumber" value={formData.engineNumber} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white font-mono" placeholder="Unique Engine ID" required disabled={!!editId} />
                                    </div>
                                </div>
                            </div>

                            {/* Past Owners */}
                            <div className="border border-slate-200 rounded-lg p-4">
                                <h4 className="text-sm font-bold text-slate-800 mb-2">Vehicle History (Past Owners)</h4>
                                <div className="flex gap-2 mb-2">
                                    <input placeholder="Owner Name" value={prevOwnerInput.name} onChange={e => setPrevOwnerInput({ ...prevOwnerInput, name: e.target.value })} className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm" />
                                    <input placeholder="Period (e.g. 2018-2022)" value={prevOwnerInput.period} onChange={e => setPrevOwnerInput({ ...prevOwnerInput, period: e.target.value })} className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm" />
                                    <button type="button" onClick={addPreviousOwner} className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-sm">Add</button>
                                </div>
                                <ul className="space-y-1">
                                    {formData.previousOwners.map((owner, idx) => (
                                        <li key={idx} className="text-xs text-slate-600 flex justify-between bg-slate-50 p-2 rounded">
                                            <span>{owner.name}</span>
                                            <span className="text-slate-400">{owner.period}</span>
                                        </li>
                                    ))}
                                    {formData.previousOwners.length === 0 && <li className="text-xs text-slate-400 italic">No previous owners recorded.</li>}
                                </ul>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all transform hover:scale-[1.01] shadow-lg">
                                    {editId ? 'Update Vehicle Details' : 'Register Vehicle in System'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerCars;
