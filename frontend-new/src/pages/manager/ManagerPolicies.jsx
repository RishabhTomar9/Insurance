import React, { useState, useEffect } from 'react';
import { auth } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useConfirmed } from '../../contexts/DialogContext';

const ManagerPolicies = () => {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const { showConfirm } = useConfirmed();
    const [policies, setPolicies] = useState([]);
    const [cars, setCars] = useState([]);
    const [owners, setOwners] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    const initialFormState = {
        carId: '',
        ownerId: '',
        policyType: 'Comprehensive', // Default First Party (Comprehensive)
        premiumAmount: '',
        policyDuration: '1 Year',
        startDate: new Date().toISOString().split('T')[0], // Today
        coverageDetails: '',
        employeeId: ''
    };

    // Updated Form State for Insurance Specifics
    const [formData, setFormData] = useState(initialFormState);

    const fetchData = async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            const headers = { 'Authorization': `Bearer ${token}` };

            const [policiesRes, carsRes, ownersRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/policies`, { headers }),
                fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/cars`, { headers }),
                fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/owners`, { headers })
            ]);

            setPolicies(await policiesRes.json());
            setCars(await carsRes.json());
            setOwners(await ownersRes.json());
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data", error);
            addToast('Failed to load system data', 'error');
            setLoading(false);
        }
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
        fetchData();
        fetchEmployees();
    }, [currentUser]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (policy) => {
        setEditId(policy._id);
        const formattedDate = policy.policyStartDate ? new Date(policy.policyStartDate).toISOString().split('T')[0] : '';
        setFormData({
            ...policy,
            carId: policy.carId?._id || policy.carId, // Handle populated object or ID string
            ownerId: policy.ownerId?._id || policy.ownerId,
            startDate: formattedDate,
            employeeId: policy.employeeId || '',
            // Assuming backend response maps to frontend fields correctly, usually keys match
            // But if specific mapping is needed, check schema.
            // Policy schema: policyType, premiumAmount, policyDuration, etc.
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
                ? `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/policies/${editId}`
                : `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/policies`;

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
                fetchData();
                addToast(editId ? 'Policy updated successfully' : 'Policy issued successfully', 'success');
            } else {
                addToast('Failed to save policy', 'error');
            }
        } catch (error) {
            addToast('Error saving policy details', 'error');
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm(
            'Void Policy',
            'Are you sure you want to void this insurance policy? This action is irreversible.',
            'warning'
        );
        if (!confirmed) return;

        try {
            const token = await auth.currentUser.getIdToken();
            await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/policies/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData();
            addToast('Policy voided successfully', 'info');
        } catch (error) {
            console.error(error);
            addToast('Failed to void policy', 'error');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading system data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Policy Management</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center space-x-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-lg shadow-emerald-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    <span>Issue New Policy</span>
                </button>
            </div>

            <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Policy Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vehicle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Coverage</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Premium</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {policies.map(policy => (
                            <tr key={policy._id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-slate-900">{policy.policyType}</div>
                                    <div className="text-xs text-slate-500">{policy.policyDuration} starting {new Date(policy.startDate || policy.policyStartDate || Date.now()).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{policy.ownerId?.name || 'Unknown'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded">{policy.carId?.vehicleNumber || 'Unknown'}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 max-w-xs truncate">{policy.coverageDetails || 'Standard Coverage'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">₹{policy.premiumAmount}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-3">
                                        <button onClick={() => handleEdit(policy)} className="text-indigo-600 hover:text-indigo-900 font-semibold transition-colors">Edit</button>
                                        <button onClick={() => handleDelete(policy._id)} className="text-red-500 hover:text-red-700">Void</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{editId ? 'Edit Policy' : 'Issue New Insurance Policy'}</h3>
                                <p className="text-sm text-slate-500">{editId ? 'Update policy terms and premiums' : 'Create Comprehensive or Third Party Liability Policies'}</p>
                            </div>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">

                            {/* Client & Asset Selection */}
                            {currentUser?.role === 'manager' && (
                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 mb-6">
                                    <label className="block text-sm font-bold text-emerald-700 mb-2">Assign Policy Agent</label>
                                    <select
                                        name="employeeId"
                                        value={formData.employeeId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                    >
                                        <option value="">-- Assign to Me --</option>
                                        {employees.map(emp => (
                                            <option key={emp.uid} value={emp.uid}>{emp.email}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-emerald-500 mt-1">If unassigned, you will be the primary agent.</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Policy Holder (Owner)</label>
                                    <select name="ownerId" value={formData.ownerId} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required>
                                        <option value="">Select Owner...</option>
                                        {owners.map(o => <option key={o._id} value={o._id}>{o.name} ({o.phone})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Insured Asset (Vehicle)</label>
                                    <select name="carId" value={formData.carId} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" required>
                                        <option value="">Select Vehicle...</option>
                                        {cars.map(c => <option key={c._id} value={c._id}>{c.vehicleNumber} - {c.make} {c.model}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Policy Specifics */}
                            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                                <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Coverage Configuration</h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Insurance Type</label>
                                        <select name="policyType" value={formData.policyType} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                                            <option value="Comprehensive">Comprehensive (First Party + Third Party)</option>
                                            <option value="Third Party Liability">Third Party Liability Only</option>
                                            <option value="Own Damage">Own Damage Only</option>
                                            <option value="Zero Depreciation">Zero Depreciation (Add-on)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Policy Duration</label>
                                        <select name="policyDuration" value={formData.policyDuration} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                                            <option>1 Year</option>
                                            <option>3 Years (Long Term)</option>
                                            <option>5 Years (Long Term)</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Additional Coverage Notes</label>
                                        <input type="text" name="coverageDetails" value={formData.coverageDetails} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white" placeholder="e.g. Includes Roadside Assistance, Engine Protection" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Policy Start Date</label>
                                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Total Premium (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-slate-400">₹</span>
                                        <input type="number" name="premiumAmount" value={formData.premiumAmount} onChange={handleChange} className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-900" placeholder="0.00" required />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-transform transform hover:scale-[1.01] shadow-lg">
                                    {editId ? 'Update Policy Document' : 'Generate Official Policy Document'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerPolicies;
