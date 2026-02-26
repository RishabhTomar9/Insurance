import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { X, Car, User, FileText, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';

const AddCarForm = ({ onAdd, onClose, employees = [], isManager = false }) => {
    // ... state init remains same
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

    const [addOwner, setAddOwner] = useState(false);
    const [ownerData, setOwnerData] = useState({
        name: '',
        mobile: '',
        email: '',
        address: '',
        aadharCard: '',
        drivingLicense: ''
    });

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
            const user = auth.currentUser;
            if (!user) throw new Error('Not authenticated');

            // Find current user's profile for companyId
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const companyId = userDoc.exists() ? userDoc.data().companyId : null;

            if (!companyId) throw new Error('Company ID not found. Please re-login.');

            const currentEmployeeId = vehicleData.employeeId || user.uid;

            // 1. Create Car
            const carPayload = {
                ...vehicleData,
                employeeId: currentEmployeeId,
                companyId: companyId,
                agentDetails: {
                    name: vehicleData.agentName,
                    mobile: vehicleData.agentMobile,
                    email: vehicleData.agentEmail
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            delete carPayload.agentName;
            delete carPayload.agentMobile;
            delete carPayload.agentEmail;

            const carDocRef = await addDoc(collection(db, 'cars'), carPayload);
            const newCarId = carDocRef.id;

            let newOwnerId = null;

            // 2. Create Owner (if requested)
            if (addOwner) {
                const ownerPayload = {
                    ...ownerData,
                    phone: ownerData.mobile,
                    employeeId: currentEmployeeId,
                    companyId: companyId,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };

                const ownerDocRef = await addDoc(collection(db, 'owners'), ownerPayload);
                newOwnerId = ownerDocRef.id;
            }

            // 3. Create Policy (if requested)
            if (addPolicy) {
                if (!newOwnerId) throw new Error('Cannot create Policy without an Owner. Please add Owner details.');

                const policyPayload = {
                    ...policyData,
                    carId: newCarId,
                    ownerId: newOwnerId,
                    employeeId: currentEmployeeId,
                    companyId: companyId,
                    premiumAmount: parseFloat(policyData.premiumAmount) || 0,
                    finalPremium: parseFloat(policyData.premiumAmount) || 0,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };

                await addDoc(collection(db, 'policies'), policyPayload);
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
        <div className="bg-[#0b0e1a] w-full h-full min-h-screen">
            <div className="max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-[#1e2745]">
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center">
                            <span className="bg-indigo-600/10 text-indigo-500 p-3 rounded-xl mr-4 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                                <Car size={28} />
                            </span>
                            Add New Vehicle
                        </h2>
                        <p className="text-[#6b7db3] mt-2 ml-[84px] text-lg uppercase tracking-[2px]">Register vehicle and link Owner & Policy.</p>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="bg-[#111629] text-[#6b7db3] hover:text-white hover:bg-[#1c243f] p-3 rounded-xl transition-all border border-[#1e2745] hover:border-indigo-500/50 hover:shadow-lg group shadow-xl">
                            <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn pb-20">

                    {/* Status Message */}
                    {status.message && (
                        <div className={`p-4 rounded-xl flex items-center ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                            {status.type === 'success' ? <CheckCircle className="mr-3" /> : <AlertCircle className="mr-3" />}
                            <span className="font-bold uppercase tracking-widest text-xs">{status.message}</span>
                        </div>
                    )}

                    {/* SECTION 1: VEHICLE DETAILS */}
                    <div className="bg-[#111629] p-6 rounded-2xl border border-[#1e2745]">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <span className="w-1.5 h-8 bg-indigo-600 rounded-full mr-3 shadow-[0_0_15px_rgba(79,70,229,0.4)]"></span>
                            Vehicle Information <span className="text-rose-500 ml-1">*</span>
                        </h3>

                        {/* Manager Assignment */}
                        {isManager && (
                            <div className="mb-6 bg-[#0b0e1a] p-4 rounded-xl border border-indigo-500/20">
                                <label className="block text-[10px] font-bold text-indigo-400 mb-2 uppercase tracking-[2px]">Assign to Employee</label>
                                <select
                                    name="employeeId"
                                    value={vehicleData.employeeId}
                                    onChange={handleVehicleChange}
                                    className="w-full bg-[#111629] p-3 border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none font-bold"
                                >
                                    <option value="">-- Assign to Me --</option>
                                    {employees.map(e => <option key={e.id || e.uid} value={e.id || e.uid}>{e.email}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="group">
                                <label className="block text-[10px] font-bold text-[#2a3660] uppercase mb-2 group-focus-within:text-indigo-500 transition-colors tracking-[1px]">Vehicle No. *</label>
                                <input name="vehicleNumber" required value={vehicleData.vehicleNumber} onChange={handleVehicleChange} placeholder="MH-12-AB-1234" className="w-full p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none uppercase font-bold" />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-bold text-[#2a3660] uppercase mb-2 group-focus-within:text-indigo-500 transition-colors tracking-[1px]">Make (Brand) *</label>
                                <input name="make" required value={vehicleData.make} onChange={handleVehicleChange} placeholder="e.g. Maruti Suzuki" className="w-full p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none font-bold" />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-bold text-[#2a3660] uppercase mb-2 group-focus-within:text-indigo-500 transition-colors tracking-[1px]">Model (Product) *</label>
                                <input name="model" required value={vehicleData.model} onChange={handleVehicleChange} placeholder="e.g. Alto 800" className="w-full p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none font-bold" />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-bold text-[#2a3660] uppercase mb-2 group-focus-within:text-indigo-500 transition-colors tracking-[1px]">Variant</label>
                                <input name="variant" value={vehicleData.variant || ''} onChange={handleVehicleChange} placeholder="e.g. LXI" className="w-full p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none font-bold" />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-bold text-[#2a3660] uppercase mb-2 group-focus-within:text-indigo-500 transition-colors tracking-[1px]">Fuel Type *</label>
                                <select name="fuelType" value={vehicleData.fuelType} onChange={handleVehicleChange} className="w-full p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none font-bold">
                                    <option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option><option>CNG</option>
                                </select>
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-bold text-[#2a3660] uppercase mb-2 group-focus-within:text-indigo-500 transition-colors tracking-[1px]">Mfg Year *</label>
                                <input type="number" name="manufacturingYear" required value={vehicleData.manufacturingYear} onChange={handleVehicleChange} className="w-full p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none font-bold" />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-bold text-[#2a3660] uppercase mb-2 group-focus-within:text-indigo-500 transition-colors tracking-[1px]">Reg Year *</label>
                                <input type="number" name="registrationYear" required value={vehicleData.registrationYear || new Date().getFullYear()} onChange={handleVehicleChange} className="w-full p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none font-bold" />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-bold text-[#2a3660] uppercase mb-2 group-focus-within:text-indigo-500 transition-colors tracking-[1px]">Reg Date</label>
                                <input type="date" name="registrationDate" value={vehicleData.registrationDate} onChange={handleVehicleChange} className="w-full p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none font-bold" />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-bold text-[#2a3660] uppercase mb-2 group-focus-within:text-indigo-500 transition-colors tracking-[1px]">Chassis No. *</label>
                                <input name="chassisNumber" required value={vehicleData.chassisNumber} onChange={handleVehicleChange} className="w-full p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none uppercase font-bold" />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-bold text-[#2a3660] uppercase mb-2 group-focus-within:text-indigo-500 transition-colors tracking-[1px]">Engine No. *</label>
                                <input name="engineNumber" required value={vehicleData.engineNumber} onChange={handleVehicleChange} className="w-full p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none uppercase font-bold" />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-bold text-[#2a3660] uppercase mb-2 group-focus-within:text-indigo-500 transition-colors tracking-[1px]">CC *</label>
                                <input name="cc" type="number" required value={vehicleData.cc} onChange={handleVehicleChange} className="w-full p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none font-bold" />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-bold text-[#2a3660] uppercase mb-2 group-focus-within:text-indigo-500 transition-colors tracking-[1px]">Category *</label>
                                <select name="category" value={vehicleData.category} onChange={handleVehicleChange} className="w-full p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none font-bold">
                                    <option>Personal</option><option>Commercial</option>
                                </select>
                            </div>
                        </div>

                        {/* Agent Info Helper */}
                        <div className="mt-6 pt-6 border-t border-[#1e2745]">
                            <h4 className="text-sm font-bold text-[#6b7db3] mb-4 uppercase tracking-widest">Agent Details (Optional)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input name="agentName" value={vehicleData.agentName} onChange={handleVehicleChange} placeholder="Agent Name" className="p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg text-sm font-bold placeholder:text-[#2a3660] focus:border-indigo-500 outline-none transition-all" />
                                <input name="agentMobile" value={vehicleData.agentMobile} onChange={handleVehicleChange} placeholder="Agent Mobile" className="p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg text-sm font-bold placeholder:text-[#2a3660] focus:border-indigo-500 outline-none transition-all" />
                                <input name="agentEmail" value={vehicleData.agentEmail} onChange={handleVehicleChange} placeholder="Agent Email" className="p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg text-sm font-bold placeholder:text-[#2a3660] focus:border-indigo-500 outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: OWNER DETAILS */}
                    <div className={`rounded-2xl border transition-all duration-300 ${addOwner ? 'bg-indigo-500/5 border-indigo-500/20 shadow-md' : 'bg-[#111629] border-[#1e2745]'}`}>
                        <button
                            type="button"
                            onClick={() => setAddOwner(!addOwner)}
                            className="w-full flex items-center justify-between p-6 text-left"
                        >
                            <div className="flex items-center">
                                <div className={`p-2 rounded-lg mr-4 ${addOwner ? 'bg-indigo-600 text-white' : 'bg-[#0b0e1a] text-[#2a3660]'}`}>
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className={`text-lg font-bold ${addOwner ? 'text-white' : 'text-[#6b7db3]'}`}>Owner Details</h3>
                                    <p className="text-sm text-[#2a3660] uppercase tracking-widest">Add personal information for the vehicle owner</p>
                                </div>
                            </div>
                            {addOwner ? <ChevronUp className="text-indigo-500" /> : <ChevronDown className="text-[#2a3660]" />}
                        </button>

                        {addOwner && (
                            <div className="px-6 pb-6 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input name="name" required value={ownerData.name} onChange={handleOwnerChange} placeholder="Owner Name *" className="p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none font-bold placeholder:text-[#2a3660]" />
                                    <input name="mobile" required value={ownerData.mobile} onChange={handleOwnerChange} placeholder="Mobile Number *" className="p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none font-bold placeholder:text-[#2a3660]" />
                                    <input name="email" required value={ownerData.email} onChange={handleOwnerChange} placeholder="Email Address *" className="p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none font-bold placeholder:text-[#2a3660]" />
                                    <input name="address" required value={ownerData.address} onChange={handleOwnerChange} placeholder="Address *" className="p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none font-bold placeholder:text-[#2a3660]" />
                                    <input name="aadharCard" required value={ownerData.aadharCard} onChange={handleOwnerChange} placeholder="Aadhar Card No. *" className="p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none font-bold placeholder:text-[#2a3660]" />
                                    <input name="drivingLicense" required value={ownerData.drivingLicense} onChange={handleOwnerChange} placeholder="Driving License *" className="p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none font-bold placeholder:text-[#2a3660]" />
                                </div>
                            </div>
                        )}
                    </div>
                    {/* SECTION 3: POLICY DETAILS */}
                    <div className={`rounded-2xl border transition-all duration-300 ${addPolicy ? 'bg-indigo-500/5 border-indigo-500/20 shadow-md' : 'bg-[#111629] border-[#1e2745]'}`}>
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
                                <div className={`p-2 rounded-lg mr-4 ${addPolicy ? 'bg-indigo-600 text-white' : 'bg-[#0b0e1a] text-[#2a3660]'}`}>
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className={`text-lg font-bold ${addPolicy ? 'text-white' : 'text-[#6b7db3]'}`}>Policy Details</h3>
                                    <p className="text-sm text-[#2a3660] uppercase tracking-widest">Link an insurance policy to this vehicle</p>
                                </div>
                            </div>
                            {addPolicy ? <ChevronUp className="text-indigo-500" /> : <ChevronDown className="text-[#2a3660]" />}
                        </button>

                        {addPolicy && (
                            <div className="px-6 pb-6 animate-fadeIn">
                                {!addOwner && <div className="mb-4 p-3 bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-widest rounded-lg border border-rose-500/20">Note: Owner details are required to create a policy.</div>}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="group">
                                        <label className="block text-[10px] font-bold text-[#2a3660] mb-2 uppercase tracking-[2px]">Policy Type</label>
                                        <select name="policyType" value={policyData.policyType} onChange={handlePolicyChange} className="w-full p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none font-bold">
                                            <option>Comprehensive</option><option>Third Party Liability</option><option>Zero Depreciation</option><option>Own Damage</option>
                                        </select>
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-bold text-[#2a3660] mb-2 uppercase tracking-[2px]">Premium Amount</label>
                                        <input type="number" name="premiumAmount" required value={policyData.premiumAmount} onChange={handlePolicyChange} className="w-full p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none font-bold placeholder:text-[#2a3660]" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-bold text-[#2a3660] mb-2 uppercase tracking-[2px]">Duration</label>
                                        <input name="policyDuration" required value={policyData.policyDuration} onChange={handlePolicyChange} className="w-full p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none font-bold placeholder:text-[#2a3660]" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-bold text-[#2a3660] mb-2 uppercase tracking-[2px]">Start Date</label>
                                        <input type="date" name="policyStartDate" required value={policyData.policyStartDate} onChange={handlePolicyChange} className="w-full p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none font-bold" />
                                    </div>
                                    <div className="group md:col-span-2">
                                        <label className="block text-[10px] font-bold text-[#2a3660] mb-2 uppercase tracking-[2px]">Coverage Details</label>
                                        <input name="coverageDetails" value={policyData.coverageDetails} onChange={handlePolicyChange} placeholder="Optional notes" className="w-full p-3 bg-[#0b0e1a] border border-[#1e2745] text-white rounded-lg focus:border-indigo-500 outline-none font-bold placeholder:text-[#2a3660]" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Submit Section */}
                    <div className="pt-8 border-t border-[#1e2745] flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex-1 w-full sm:w-auto">
                            {/* Empty space for alignment or additional info */}
                        </div>
                        <div className="flex justify-end gap-4 w-full sm:w-auto">
                            {onClose && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 sm:flex-none px-8 py-4 rounded-xl bg-[#0b0e1a] text-[#6b7db3] hover:text-white border border-[#1e2745] hover:border-[#3d7fff] hover:bg-[#1c243f] transition-all font-bold uppercase tracking-widest text-xs"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 sm:flex-none px-10 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-900/20 active:scale-95 transition-all font-bold disabled:opacity-50 text-xs uppercase tracking-[2px] flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Save Records</span>
                                        {(addOwner || addPolicy) && <span className="ml-2 bg-indigo-500 px-2 py-0.5 rounded text-[8px] tracking-[1px]">Combo</span>}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCarForm;
