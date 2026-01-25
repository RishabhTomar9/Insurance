import React, { useState, useEffect } from 'react';
import { auth } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useConfirmed } from '../../contexts/DialogContext';

const OwnerList = () => {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const { showConfirm } = useConfirmed();
    const [owners, setOwners] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    const initialFormState = {
        ownerName: '',
        mobileNo: '',
        address: '',
        email: '',
        aadharCard: '',
        drivingLicense: '',
        insuranceNumber: '',
        employeeId: ''
    };

    // Form State (matching the user's provided VehicleDataEntryForm)
    const [formData, setFormData] = useState(initialFormState);
    const [focusedField, setFocusedField] = useState('');

    const fetchOwners = async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/owners`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setOwners(data);
        } catch (error) {
            addToast('Failed to load owners', 'error');
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
        fetchOwners();
        fetchEmployees();
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (owner) => {
        setEditId(owner._id);
        setFormData({
            ownerName: owner.name,
            mobileNo: owner.phone,
            address: owner.address,
            email: owner.email,
            aadharCard: owner.aadharCard,
            drivingLicense: owner.drivingLicense,
            insuranceNumber: '',
            employeeId: owner.employeeId || ''
        });
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditId(null);
        setFormData(initialFormState);
    };

    const inputClass = (fieldName) => `
        w-full px-4 py-3 border-2 border-slate-200 rounded-lg 
        focus:border-indigo-500 focus:outline-none 
        transition-all duration-300 
        ${focusedField === fieldName ? 'shadow-lg shadow-indigo-500/20 scale-[1.01]' : ''}
    `;

    const handleSubmit = async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            // Map form data to backend schema
            const backendData = {
                name: formData.ownerName,
                phone: formData.mobileNo,
                address: formData.address,
                email: formData.email,
                aadharCard: formData.aadharCard,
                drivingLicense: formData.drivingLicense,
                employeeId: formData.employeeId
            };

            const url = editId
                ? `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/owners/${editId}`
                : `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/owners`;

            const method = editId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(backendData)
            });

            if (response.ok) {
                handleCloseModal();
                fetchOwners();
                addToast(editId ? 'Owner updated successfully' : 'Owner added successfully', 'success');
            } else {
                addToast(`Failed to ${editId ? 'update' : 'add'} owner`, 'error');
            }
        } catch (error) {
            console.error(error);
            addToast(`Error ${editId ? 'updating' : 'adding'} owner`, 'error');
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm(
            'Delete Owner Record',
            'Are you sure you want to permanently delete this owner? This action cannot be undone.',
            'danger'
        );
        if (!confirmed) return;

        try {
            const token = await auth.currentUser.getIdToken();
            await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/owners/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchOwners();
            addToast('Owner record deleted', 'info');
        } catch (error) {
            console.error(error);
            addToast('Failed to delete owner', 'error');
        }
    };

    // Render the fancy form as a modal or inline? Let's do modal for cleaner UI in the list view.
    if (loading) return <div className="p-8 text-center text-slate-500">Loading owners...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Owner Management</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg shadow-indigo-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    <span>Add New Owner</span>
                </button>
            </div>

            {/* List View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {owners.map(owner => (
                    <div key={owner._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                                {owner.name && owner.name[0]}
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => handleEdit(owner)} className="p-1 text-slate-400 hover:text-indigo-600" title="Edit"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                                <button onClick={() => handleDelete(owner._id)} className="p-1 text-slate-400 hover:text-red-600" title="Delete"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{owner.name}</h3>
                        <div className="space-y-2 text-sm text-slate-500">
                            <div className="flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>{owner.phone}</div>
                            <div className="flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>{owner.email}</div>
                            <div className="flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>{owner.address}</div>
                            {owner.aadharCard && <div className="flex items-center text-xs bg-slate-100 p-1 rounded">ID: {owner.aadharCard}</div>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal - Using User's Design Language */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            {/* Header */}
                            <div className="text-center mb-10 relative">
                                <button onClick={handleCloseModal} className="absolute right-0 top-0 text-slate-400 hover:text-slate-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-lg bg-gradient-to-r from-indigo-500 to-indigo-600">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <h1 className="text-3xl font-bold text-slate-800 mb-2">{editId ? "Update Owner Details" : "Owner's Details"}</h1>
                                <p className="text-slate-500">Please fill in all the required information</p>
                            </div>

                            {/* Form Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Manager Assignment Selection */}
                                {currentUser?.role === 'manager' && (
                                    <div className="md:col-span-2 bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
                                        <label className="block text-sm font-bold text-indigo-700 mb-2">Assign to Employee (Optional)</label>
                                        <select
                                            name="employeeId"
                                            value={formData.employeeId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            <option value="">-- Assign to Me --</option>
                                            {employees.map(emp => (
                                                <option key={emp.uid} value={emp.uid}>{emp.email}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-indigo-400 mt-1">If left blank, this client will be managed by you.</p>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Name of Owner <span className="text-red-500">*</span></label>
                                    <input name="ownerName" value={formData.ownerName} onChange={handleChange} onFocus={() => setFocusedField('ownerName')} onBlur={() => setFocusedField('')} placeholder="Full Name" className={inputClass('ownerName')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile No. <span className="text-red-500">*</span></label>
                                    <input name="mobileNo" value={formData.mobileNo} onChange={handleChange} onFocus={() => setFocusedField('mobileNo')} onBlur={() => setFocusedField('')} placeholder="10-digit number" className={inputClass('mobileNo')} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Address <span className="text-red-500">*</span></label>
                                    <input name="address" value={formData.address} onChange={handleChange} onFocus={() => setFocusedField('address')} onBlur={() => setFocusedField('')} placeholder="Complete Address" className={inputClass('address')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email ID <span className="text-red-500">*</span></label>
                                    <input name="email" type="email" value={formData.email} onChange={handleChange} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')} placeholder="Email" className={inputClass('email')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Aadhar Card <span className="text-red-500">*</span></label>
                                    <input name="aadharCard" value={formData.aadharCard} onChange={handleChange} onFocus={() => setFocusedField('aadharCard')} onBlur={() => setFocusedField('')} placeholder="12-digit number" className={inputClass('aadharCard')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Driving License <span className="text-red-500">*</span></label>
                                    <input name="drivingLicense" value={formData.drivingLicense} onChange={handleChange} onFocus={() => setFocusedField('drivingLicense')} onBlur={() => setFocusedField('')} placeholder="License Number" className={inputClass('drivingLicense')} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 border-t border-slate-100 pt-6">
                                <button onClick={handleCloseModal} className="px-6 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                                <button onClick={handleSubmit} className="px-8 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                                    {editId ? 'Update Details' : 'Submit Details'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerList;
