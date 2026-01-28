import React, { useState } from 'react';
import { auth } from '../../services/firebase';
import { X, Car, User, FileText, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';

const AddCarForm = ({ onAdd, onClose, employees = [], isManager = false }) => {
    // Stage 1: Vehicle Data
    const [vehicleData, setVehicleData] = useState({
        vehicleNumber: '',
        chassisNumber: '',
        engineNumber: '',
        make: '',
        model: '',
        manufacturingYear: new Date().getFullYear(),
        fuelType: 'Petrol',
        registrationDate: '',
        cc: '',
        category: 'Private',
        agentName: '',
        agentMobile: '',
        agentEmail: '',
        employeeId: ''
    });

    // Stage 2: Owner Data (Optional)
    const [addOwner, setAddOwner] = useState(false);
    const [ownerData, setOwnerData] = useState({
        name: '',
        mobile: '',
        email: '',
        address: '',
        aadharCard: '',
        drivingLicense: ''
    });

    // Stage 3: Policy Data (Optional)
    const [addPolicy, setAddPolicy] = useState(false);
    const [policyData, setPolicyData] = useState({
        policyType: 'Comprehensive',
        premiumAmount: '',
        policyDuration: '1 Year',
        policyStartDate: new Date().toISOString().split('T')[0],
        coverageDetails: ''
    });

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Handlers
    const handleVehicleChange = (e) => setVehicleData({ ...vehicleData, [e.target.name]: e.target.value });
    const handleOwnerChange = (e) => setOwnerData({ ...ownerData, [e.target.name]: e.target.value });
    const handlePolicyChange = (e) => setPolicyData({ ...policyData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });
        setLoading(true);

        try {
            const token = await auth.currentUser.getIdToken();
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };
            const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

            // 1. Create Car
            const carPayload = {
                ...vehicleData,
                agentDetails: {
                    name: vehicleData.agentName,
                    mobile: vehicleData.agentMobile,
                    email: vehicleData.agentEmail
                }
            };
            // Clean up flat agent fields from payload if backend doesn't want them (schema uses agentDetails)
            delete carPayload.agentName;
            delete carPayload.agentMobile;
            delete carPayload.agentEmail;

            const carRes = await fetch(`${baseUrl}/api/cars`, {
                method: 'POST',
                headers,
                body: JSON.stringify(carPayload)
            });

            if (!carRes.ok) throw new Error('Failed to create vehicle record');
            const carResult = await carRes.json();
            const newCarId = carResult._id || carResult.id; // Adjust based on backend response

            let newOwnerId = null;

            // 2. Create Owner (if requested)
            if (addOwner) {
                const ownerPayload = {
                    ...ownerData,
                    phone: ownerData.mobile, // Map mobile to phone
                    employeeId: vehicleData.employeeId || (auth.currentUser ? auth.currentUser.uid : '')
                };

                const ownerRes = await fetch(`${baseUrl}/api/owners`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(ownerPayload)
                });

                if (!ownerRes.ok) throw new Error('Vehicle created, but failed to create Owner record');
                const ownerResult = await ownerRes.json();
                newOwnerId = ownerResult._id || ownerResult.id;
            }

            // 3. Create Policy (if requested)
            if (addPolicy) {
                if (!newOwnerId) throw new Error('Cannot create Policy without an Owner. Please add Owner details.');

                const policyPayload = {
                    ...policyData,
                    carId: newCarId,
                    ownerId: newOwnerId,
                    employeeId: vehicleData.employeeId || (auth.currentUser ? auth.currentUser.uid : '')
                };

                const policyRes = await fetch(`${baseUrl}/api/policies`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(policyPayload)
                });

                if (!policyRes.ok) throw new Error('Vehicle & Owner created, but failed to create Policy');
            }

            setStatus({ type: 'success', message: 'All records created successfully!' });

            // Reset form
            setTimeout(() => {
                onAdd(); // Refresh parent list
                if (onClose) onClose();
            }, 1000);

        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: error.message || 'An unexpected error occurred' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white w-full h-full min-h-screen">
            <div className="max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center">
                            <span className="bg-indigo-100 text-indigo-600 p-3 rounded-xl mr-4 shadow-sm">
                                <Car size={28} />
                            </span>
                            Add New Vehicle
                        </h2>
                        <p className="text-slate-500 mt-2 ml-[84px] text-lg">Register vehicle and optionally link Owner & Policy.</p>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-3 rounded-full transition-all border border-slate-100 hover:shadow-md">
                            <X size={28} />
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn pb-20">

                    {/* Status Message */}
                    {status.message && (
                        <div className={`p-4 rounded-xl flex items-center ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {status.type === 'success' ? <CheckCircle className="mr-3" /> : <AlertCircle className="mr-3" />}
                            <span className="font-medium">{status.message}</span>
                        </div>
                    )}

                    {/* SECTION 1: VEHICLE DETAILS */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                            <span className="w-1.5 h-8 bg-indigo-600 rounded-full mr-3"></span>
                            Vehicle Information <span className="text-red-500 ml-1">*</span>
                        </h3>

                        {/* Manager Assignment */}
                        {isManager && (
                            <div className="mb-6 bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                                <label className="block text-sm font-bold text-indigo-900 mb-2">Assign to Employee</label>
                                <select
                                    name="employeeId"
                                    value={vehicleData.employeeId}
                                    onChange={handleVehicleChange}
                                    className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">-- Assign to Me --</option>
                                    {employees.map(e => <option key={e.uid || e._id} value={e.uid || e._id}>{e.email}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Vehicle No. *</label>
                                <input name="vehicleNumber" required value={vehicleData.vehicleNumber} onChange={handleVehicleChange} placeholder="MH-12-AB-1234" className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Make *</label>
                                <input name="make" required value={vehicleData.make} onChange={handleVehicleChange} placeholder="e.g. Toyota" className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Model *</label>
                                <input name="model" required value={vehicleData.model} onChange={handleVehicleChange} placeholder="e.g. Fortuner" className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fuel Type *</label>
                                <select name="fuelType" value={vehicleData.fuelType} onChange={handleVehicleChange} className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option><option>CNG</option>
                                </select>
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mfg Year *</label>
                                <input type="number" name="manufacturingYear" required value={vehicleData.manufacturingYear} onChange={handleVehicleChange} className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Reg Date *</label>
                                <input type="date" name="registrationDate" required value={vehicleData.registrationDate} onChange={handleVehicleChange} className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Chassis No. *</label>
                                <input name="chassisNumber" required value={vehicleData.chassisNumber} onChange={handleVehicleChange} className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Engine No. *</label>
                                <input name="engineNumber" required value={vehicleData.engineNumber} onChange={handleVehicleChange} className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">CC *</label>
                                <input name="cc" type="number" required value={vehicleData.cc} onChange={handleVehicleChange} className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category *</label>
                                <select name="category" value={vehicleData.category} onChange={handleVehicleChange} className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option>Private</option><option>Commercial</option>
                                </select>
                            </div>
                        </div>

                        {/* Agent Info Helper */}
                        <div className="mt-6 pt-6 border-t border-slate-200">
                            <h4 className="text-sm font-bold text-slate-600 mb-4">Agent Details (Optional)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input name="agentName" value={vehicleData.agentName} onChange={handleVehicleChange} placeholder="Agent Name" className="p-3 border border-slate-200 rounded-lg text-sm" />
                                <input name="agentMobile" value={vehicleData.agentMobile} onChange={handleVehicleChange} placeholder="Agent Mobile" className="p-3 border border-slate-200 rounded-lg text-sm" />
                                <input name="agentEmail" value={vehicleData.agentEmail} onChange={handleVehicleChange} placeholder="Agent Email" className="p-3 border border-slate-200 rounded-lg text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: OWNER DETAILS */}
                    <div className={`rounded-2xl border transition-all duration-300 ${addOwner ? 'bg-indigo-50/30 border-indigo-200 shadow-md' : 'bg-white border-slate-200'}`}>
                        <button
                            type="button"
                            onClick={() => setAddOwner(!addOwner)}
                            className="w-full flex items-center justify-between p-6 text-left"
                        >
                            <div className="flex items-center">
                                <div className={`p-2 rounded-lg mr-4 ${addOwner ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className={`text-lg font-bold ${addOwner ? 'text-indigo-900' : 'text-slate-700'}`}>Owner Details</h3>
                                    <p className="text-sm text-slate-500">Add personal information for the vehicle owner</p>
                                </div>
                            </div>
                            {addOwner ? <ChevronUp className="text-indigo-600" /> : <ChevronDown className="text-slate-400" />}
                        </button>

                        {addOwner && (
                            <div className="px-6 pb-6 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input name="name" required value={ownerData.name} onChange={handleOwnerChange} placeholder="Owner Name *" className="p-3 border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    <input name="mobile" required value={ownerData.mobile} onChange={handleOwnerChange} placeholder="Mobile Number *" className="p-3 border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    <input name="email" required value={ownerData.email} onChange={handleOwnerChange} placeholder="Email Address *" className="p-3 border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    <input name="address" required value={ownerData.address} onChange={handleOwnerChange} placeholder="Address *" className="p-3 border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    <input name="aadharCard" required value={ownerData.aadharCard} onChange={handleOwnerChange} placeholder="Aadhar Card No. *" className="p-3 border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    <input name="drivingLicense" required value={ownerData.drivingLicense} onChange={handleOwnerChange} placeholder="Driving License *" className="p-3 border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SECTION 3: POLICY DETAILS */}
                    <div className={`rounded-2xl border transition-all duration-300 ${addPolicy ? 'bg-indigo-50/30 border-indigo-200 shadow-md' : 'bg-white border-slate-200'}`}>
                        <button
                            type="button"
                            onClick={() => {
                                if (!addOwner && !addPolicy) {
                                    alert("You must also add Owner details to create a Policy.");
                                    setAddOwner(true);
                                }
                                setAddPolicy(!addPolicy);
                            }}
                            className="w-full flex items-center justify-between p-6 text-left"
                        >
                            <div className="flex items-center">
                                <div className={`p-2 rounded-lg mr-4 ${addPolicy ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className={`text-lg font-bold ${addPolicy ? 'text-indigo-900' : 'text-slate-700'}`}>Policy Details</h3>
                                    <p className="text-sm text-slate-500">Link an insurance policy to this vehicle</p>
                                </div>
                            </div>
                            {addPolicy ? <ChevronUp className="text-indigo-600" /> : <ChevronDown className="text-slate-400" />}
                        </button>

                        {addPolicy && (
                            <div className="px-6 pb-6 animate-fadeIn">
                                {!addOwner && <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 text-sm rounded-lg">Note: Owner details are required to create a policy.</div>}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Policy Type</label>
                                        <select name="policyType" value={policyData.policyType} onChange={handlePolicyChange} className="w-full p-3 border border-indigo-100 rounded-lg">
                                            <option>Comprehensive</option><option>Third Party Liability</option><option>Zero Depreciation</option><option>Own Damage</option>
                                        </select>
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Premium Amount</label>
                                        <input type="number" name="premiumAmount" required value={policyData.premiumAmount} onChange={handlePolicyChange} className="w-full p-3 border border-indigo-100 rounded-lg" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Duration</label>
                                        <input name="policyDuration" required value={policyData.policyDuration} onChange={handlePolicyChange} className="w-full p-3 border border-indigo-100 rounded-lg" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Start Date</label>
                                        <input type="date" name="policyStartDate" required value={policyData.policyStartDate} onChange={handlePolicyChange} className="w-full p-3 border border-indigo-100 rounded-lg" />
                                    </div>
                                    <div className="group md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Coverage Details</label>
                                        <input name="coverageDetails" value={policyData.coverageDetails} onChange={handlePolicyChange} placeholder="Optional notes" className="w-full p-3 border border-indigo-100 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Section */}
                    <div className="pt-8 border-t border-slate-100 flex justify-end space-x-4">
                        {onClose && (
                            <button type="button" onClick={onClose} className="px-6 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-bold transition-colors">Cancel</button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 font-bold transition-all transform active:scale-95 flex items-center"
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    <span>Save Records</span>
                                    {(addOwner || addPolicy) && <span className="ml-2 bg-indigo-500 px-2 py-0.5 rounded text-xs">Multipass</span>}
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddCarForm;
