import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { X, FileText, Calendar, IndianRupee, Shield, Clock, Plus, Trash2, ChevronDown, ChevronUp, Briefcase, CreditCard, User, Landmark } from 'lucide-react';

const AddPolicyForm = ({ onAdd, onClose, cars = [], owners = [], employees = [], isManager = false }) => {
    // ... basic data init (no change needed in state init)
    const [basicData, setBasicData] = useState({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        carId: '',
        ownerId: '',
        agentName: '',
        contactPerson: ''
    });

    // Quotation Details
    const [quotationData, setQuotationData] = useState({
        isGiven: false,
        isSent: false,
        insuredAmount: '',
        thirdPartyPremium: '',
        odPremium: '',
        netPremium: '',
        actualPaymentAmount: '',
        paymentGateway: 'Collection Gateway',
        fromAccount: '',
        toAccount: ''
    });

    // Policy Issues & Payment Analysis
    const [policyData, setPolicyData] = useState({
        policyIssueDate: '',
        insuranceCompany: '',
        policyNumber: '',
        policyStartDate: new Date().toISOString().split('T')[0],
        policyEndDate: '', // calculate +1 year
        policyType: 'Comprehensive',
        finalInsuredAmount: '', // sync with quotation initially
        finalThirdPartyPremium: '',
        finalOdPremium: '',
        finalPremium: '', // The core 'premiumAmount'
        policyPaymentMode: 'GI', // Direct Link / GI
        // differenceAmount is calculated
    });

    // Entries (Payments DOING)
    const [paymentsOut, setPaymentsOut] = useState([
        { category: 'Payment to Insurance Company', companyName: 'Policy Bazaar', amount: '', date: new Date().toISOString().split('T')[0], paymentLinkType: 'GI', paymentMode: 'Bank', accountNumber: '' }
    ]);

    // Receipts (Payments RECEIVING)
    const [receiptsIn, setReceiptsIn] = useState([
        { fromType: 'Owner', amount: '', date: new Date().toISOString().split('T')[0], paymentMode: 'Cash', bankAccountType: '', bankAccountNumber: '', creditDetails: 'Nil' }
    ]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showQuotation, setShowQuotation] = useState(true);

    // Effects
    useEffect(() => {
        if (basicData.carId) {
            // Note: In Firebase migration, we should check both id and _id for compatibility
            const car = cars.find(c => (c.id || c._id) === basicData.carId);
            if (car) {
                if (car.agentDetails) {
                    setBasicData(prev => ({
                        ...prev,
                        agentName: car.agentDetails.name || prev.agentName
                    }));
                }
            }
        }
    }, [basicData.carId, cars]);

    // Sync Quotation values to Policy values if policy values are empty
    useEffect(() => {
        if (quotationData.netPremium && !policyData.finalPremium) {
            setPolicyData(prev => ({ ...prev, finalPremium: quotationData.netPremium }));
        }
        if (quotationData.insuredAmount && !policyData.finalInsuredAmount) {
            setPolicyData(prev => ({ ...prev, finalInsuredAmount: quotationData.insuredAmount }));
        }
    }, [quotationData.netPremium, quotationData.insuredAmount]);

    // Calculate End Date
    useEffect(() => {
        if (policyData.policyStartDate) {
            const date = new Date(policyData.policyStartDate);
            date.setFullYear(date.getFullYear() + 1);
            date.setDate(date.getDate() - 1);
            setPolicyData(prev => ({ ...prev, policyEndDate: date.toISOString().split('T')[0] }));
        }
    }, [policyData.policyStartDate]);

    // Handlers
    const handleBasicChange = (e) => setBasicData({ ...basicData, [e.target.name]: e.target.value });
    const handleQuotationChange = (e) => setQuotationData({ ...quotationData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    const handlePolicyChange = (e) => setPolicyData({ ...policyData, [e.target.name]: e.target.value });

    // Dynamic List Handlers
    const addPaymentOut = () => {
        setPaymentsOut([...paymentsOut, { category: 'Payment to Insurance Company', companyName: '', amount: '', date: new Date().toISOString().split('T')[0], paymentLinkType: 'GI', paymentMode: 'Bank', accountNumber: '' }]);
    };
    const updatePaymentOut = (index, field, value) => {
        const newPayments = [...paymentsOut];
        newPayments[index][field] = value;
        setPaymentsOut(newPayments);
    };
    const removePaymentOut = (index) => {
        setPaymentsOut(paymentsOut.filter((_, i) => i !== index));
    };

    const addReceiptIn = () => {
        setReceiptsIn([...receiptsIn, { fromType: 'Owner', amount: '', date: new Date().toISOString().split('T')[0], paymentMode: 'Cash', bankAccountType: '', bankAccountNumber: '', creditDetails: '' }]);
    };
    const updateReceiptIn = (index, field, value) => {
        const newReceipts = [...receiptsIn];
        newReceipts[index][field] = value;
        setReceiptsIn(newReceipts);
    };
    const removeReceiptIn = (index) => {
        setReceiptsIn(receiptsIn.filter((_, i) => i !== index));
    };

    // Calculate Difference
    const calculateDifference = () => {
        const premium = parseFloat(policyData.finalPremium || quotationData.netPremium || 0);
        const actual = parseFloat(quotationData.actualPaymentAmount || 0);
        return (premium - actual).toFixed(2);
    };

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Not authenticated');

            const payload = {
                // Basic
                employeeId: basicData.employeeId || user.uid,
                carId: basicData.carId,
                ownerId: basicData.ownerId,
                agentName: basicData.agentName,
                contactPerson: basicData.contactPerson,

                // Quotation
                quotation: {
                    ...quotationData,
                    insuredAmount: parseFloat(quotationData.insuredAmount) || 0,
                    thirdPartyPremium: parseFloat(quotationData.thirdPartyPremium) || 0,
                    odPremium: parseFloat(quotationData.odPremium) || 0,
                    netPremium: parseFloat(quotationData.netPremium) || 0,
                    actualPaymentAmount: parseFloat(quotationData.actualPaymentAmount) || 0
                },

                // Policy
                policyIssueDate: policyData.policyIssueDate,
                insuranceCompany: policyData.insuranceCompany,
                policyNumber: policyData.policyNumber,
                policyStartDate: policyData.policyStartDate,
                policyEndDate: policyData.policyEndDate,
                policyType: policyData.policyType,
                premiumAmount: parseFloat(policyData.finalPremium) || 0,
                finalInsuredAmount: parseFloat(policyData.finalInsuredAmount) || 0,
                finalThirdPartyPremium: parseFloat(policyData.finalThirdPartyPremium) || 0,
                finalOdPremium: parseFloat(policyData.finalOdPremium) || 0,
                finalPremium: parseFloat(policyData.finalPremium) || 0,

                policyPaymentMode: policyData.policyPaymentMode,
                paymentDifference: parseFloat(calculateDifference()),

                // Lists
                paymentsOut: paymentsOut.map(p => ({ ...p, amount: parseFloat(p.amount) || 0 })),
                receiptsIn: receiptsIn.map(r => ({ ...r, amount: parseFloat(r.amount) || 0 })),

                // Firestore Metadata
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            // Add to Firestore collection
            await addDoc(collection(db, 'policies'), payload);

            onAdd();
            if (onClose) onClose();
        } catch (error) {
            console.error(error);
            setError(error.message || 'Error creating policy record.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="bg-white w-full h-full min-h-screen overflow-y-auto">
            <div className="max-w-5xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center">
                            <span className="bg-indigo-100 text-indigo-600 p-3 rounded-xl mr-4 shadow-sm">
                                <FileText size={28} />
                            </span>
                            New Policy Entry
                        </h2>
                        <p className="text-slate-500 mt-2 ml-[84px] text-lg">Record quotation, policy issuance, and ledger.</p>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-3 rounded-full transition-all border border-slate-100 hover:shadow-md">
                            <X size={28} />
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 pb-20">

                    {/* 1. Basic Information */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center">
                                <span className="w-1.5 h-8 bg-indigo-600 rounded-full mr-3"></span>
                                Basic Details
                            </h3>
                            <span className="text-sm text-slate-500">Entry Date: {new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Manager Selection */}
                            {isManager && (
                                <div className="group">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Employee</label>
                                    <select
                                        name="employeeId"
                                        value={basicData.employeeId}
                                        onChange={handleBasicChange}
                                        className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="">-- Assign to Me --</option>
                                        {employees.map(e => <option key={e.uid || e._id} value={e.uid || e._id}>{e.email}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Vehicle *</label>
                                <select
                                    name="carId" required value={basicData.carId} onChange={handleBasicChange}
                                    className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">-- Select Vehicle --</option>
                                    {cars.map(c => <option key={c._id} value={c._id}>{c.vehicleNumber} ({c.make})</option>)}
                                </select>
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Owner *</label>
                                <select
                                    name="ownerId" required value={basicData.ownerId} onChange={handleBasicChange}
                                    className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="">-- Select Owner --</option>
                                    {owners.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
                                </select>
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Agent Name</label>
                                <input
                                    name="agentName" value={basicData.agentName} onChange={handleBasicChange} placeholder="Agent / Owner"
                                    className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Contact Person</label>
                                <input
                                    name="contactPerson" value={basicData.contactPerson} onChange={handleBasicChange} placeholder="Contact Person Name"
                                    className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Quotation Details */}
                    <div className={`rounded-2xl border transition-all duration-300 ${showQuotation ? 'bg-slate-50 border-slate-300 shadow-sm' : 'bg-white border-slate-200'}`}>
                        <div className="p-6 cursor-pointer flex justify-between items-center" onClick={() => setShowQuotation(!showQuotation)}>
                            <h3 className="text-xl font-bold text-slate-800 flex items-center">
                                <span className={`w-1.5 h-8 rounded-full mr-3 ${showQuotation ? 'bg-blue-600' : 'bg-slate-200'}`}></span>
                                Quotation Details
                            </h3>
                            {showQuotation ? <ChevronUp className="text-blue-600" /> : <ChevronDown className="text-slate-400" />}
                        </div>

                        {showQuotation && (
                            <div className="px-6 pb-6 animate-fadeIn">
                                <div className="flex items-center space-x-6 mb-6 bg-white p-4 rounded-xl border border-slate-200">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" name="isGiven" checked={quotationData.isGiven} onChange={handleQuotationChange} className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                                        <span className="text-sm font-semibold text-slate-700">Quotation Created</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" name="isSent" checked={quotationData.isSent} onChange={handleQuotationChange} className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                                        <span className="text-sm font-semibold text-slate-700">Sent to Customer</span>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    <div className="group">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Insured Amount (IDV)</label>
                                        <input type="number" name="insuredAmount" value={quotationData.insuredAmount} onChange={handleQuotationChange} className="w-full p-2 bg-white border border-slate-300 rounded text-sm font-mono" placeholder="0.00" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Third Party Premium</label>
                                        <input type="number" name="thirdPartyPremium" value={quotationData.thirdPartyPremium} onChange={handleQuotationChange} className="w-full p-2 bg-white border border-slate-300 rounded text-sm font-mono" placeholder="0.00" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Own Damage (OD)</label>
                                        <input type="number" name="odPremium" value={quotationData.odPremium} onChange={handleQuotationChange} className="w-full p-2 bg-white border border-slate-300 rounded text-sm font-mono" placeholder="0.00" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Net Premium</label>
                                        <input type="number" name="netPremium" value={quotationData.netPremium} onChange={handleQuotationChange} className="w-full p-2 border border-slate-300 rounded text-sm font-mono font-bold text-indigo-700 bg-indigo-50" placeholder="0.00" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200">
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Actual Payment Amount</label>
                                        <div className="relative">
                                            <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="number" name="actualPaymentAmount" value={quotationData.actualPaymentAmount} onChange={handleQuotationChange} className="w-full p-2 pl-9 bg-white border border-slate-300 rounded-md shadow-sm outline-none focus:border-indigo-500" placeholder="0.00" />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Gateway / Mode</label>
                                        <select name="paymentGateway" value={quotationData.paymentGateway} onChange={handleQuotationChange} className="w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm">
                                            <option>Collection Gateway</option>
                                            <option>Payment Gateway</option>
                                            <option>Cash</option>
                                            <option>Direct Transfer</option>
                                        </select>
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Transaction Route</label>
                                        <div className="flex space-x-2">
                                            <input name="fromAccount" value={quotationData.fromAccount} onChange={handleQuotationChange} className="w-1/2 p-2 bg-white border text-xs border-slate-300 rounded" placeholder="From Acc No." />
                                            <input name="toAccount" value={quotationData.toAccount} onChange={handleQuotationChange} className="w-1/2 p-2 bg-white border text-xs border-slate-300 rounded" placeholder="To Acc No." />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. Policy Issue & Payment Analysis */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Policy Info */}
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 h-full">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                                <span className="w-1.5 h-8 bg-emerald-600 rounded-full mr-3"></span>
                                Final Policy Issue
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Policy Number</label>
                                        <input name="policyNumber" value={policyData.policyNumber} onChange={handlePolicyChange} className="w-full p-2 bg-white border border-slate-300 rounded text-sm uppercase" placeholder="POLICY-NO-XXX" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Insurance Company</label>
                                        <select name="insuranceCompany" value={policyData.insuranceCompany} onChange={handlePolicyChange} className="w-full p-2 bg-white border border-slate-300 rounded text-sm">
                                            <option value="">-- Select --</option>
                                            <option>Policy Bazaar</option>
                                            <option>Digit</option>
                                            <option>Acko</option>
                                            <option>HDFC Ergo</option>
                                            <option>ICICI Lombard</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">IDV</label>
                                        <input type="number" name="finalInsuredAmount" value={policyData.finalInsuredAmount} onChange={handlePolicyChange} className="w-full p-2 bg-white border border-slate-300 rounded text-sm" placeholder="IDV" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Final Premium *</label>
                                        <input type="number" name="finalPremium" required value={policyData.finalPremium} onChange={handlePolicyChange} className="w-full p-2 border border-slate-300 rounded text-sm font-bold bg-emerald-50 text-emerald-700" placeholder="Amt" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
                                        <input type="date" name="policyStartDate" value={policyData.policyStartDate} onChange={handlePolicyChange} className="w-full p-2 bg-white border border-slate-300 rounded text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Analysis */}
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-center h-full">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                                <span className="w-1.5 h-8 bg-purple-600 rounded-full mr-3"></span>
                                Payment Analysis
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2">Policy Source</label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 p-3 rounded-xl border cursor-pointer transition-all text-center text-sm font-bold ${policyData.policyPaymentMode === 'Direct Link' ? 'bg-purple-100 border-purple-300 text-purple-800' : 'bg-white border-slate-300 text-slate-500'}`}>
                                            <input type="radio" name="policyPaymentMode" value="Direct Link" checked={policyData.policyPaymentMode === 'Direct Link'} onChange={handlePolicyChange} className="hidden" />
                                            Direct Link
                                        </label>
                                        <label className={`flex-1 p-3 rounded-xl border cursor-pointer transition-all text-center text-sm font-bold ${policyData.policyPaymentMode === 'GI' ? 'bg-purple-100 border-purple-300 text-purple-800' : 'bg-white border-slate-300 text-slate-500'}`}>
                                            <input type="radio" name="policyPaymentMode" value="GI" checked={policyData.policyPaymentMode === 'GI'} onChange={handlePolicyChange} className="hidden" />
                                            GI (General Insurance)
                                        </label>
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-500">Insurance Premium</span>
                                        <span className="font-bold text-slate-800">₹ {policyData.finalPremium || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-500">Actual Payment</span>
                                        <span className="font-bold text-slate-800">₹ {quotationData.actualPaymentAmount || 0}</span>
                                    </div>
                                    <div className="h-px bg-slate-100 my-2"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-700">Difference</span>
                                        <span className={`text-xl font-bold ${calculateDifference() > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            ₹ {calculateDifference()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Ledger: Payments Out & Receipts In */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Payments Out */}
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                                    <CreditCard size={20} className="mr-2 text-red-500" /> Outgoing Payments
                                </h3>
                                <button type="button" onClick={addPaymentOut} className="text-xs flex items-center bg-white border border-slate-300 px-3 py-1 rounded-full shadow-sm hover:bg-slate-100">
                                    <Plus size={14} className="mr-1" /> Add Entry
                                </button>
                            </div>
                            <div className="p-4 space-y-3">
                                {paymentsOut.map((payment, index) => (
                                    <div key={index} className="p-4 rounded-xl border border-slate-200 bg-white relative group hover:border-slate-300 transition-colors shadow-sm">
                                        <button type="button" onClick={() => removePaymentOut(index)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="grid grid-cols-2 gap-3 mb-2">
                                            <select
                                                value={payment.category}
                                                onChange={(e) => updatePaymentOut(index, 'category', e.target.value)}
                                                className="col-span-2 p-2 text-xs font-bold text-indigo-900 bg-indigo-50/50 rounded border-none outline-none"
                                            >
                                                <option>Payment to Insurance Company</option>
                                                <option>Payment to Direct Link</option>
                                                <option>Commission Payout</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input placeholder="Company / Agent Name" value={payment.companyName} onChange={e => updatePaymentOut(index, 'companyName', e.target.value)} className="p-2 text-xs border border-slate-200 rounded bg-slate-50" />
                                            <input type="number" placeholder="Amount" value={payment.amount} onChange={e => updatePaymentOut(index, 'amount', e.target.value)} className="p-2 text-xs border border-slate-200 rounded bg-slate-50 font-mono" />

                                            <select value={payment.paymentLinkType} onChange={e => updatePaymentOut(index, 'paymentLinkType', e.target.value)} className="p-2 text-xs border border-slate-200 rounded bg-slate-50">
                                                <option>GI</option>
                                                <option>Link</option>
                                            </select>
                                            <select value={payment.paymentMode} onChange={e => updatePaymentOut(index, 'paymentMode', e.target.value)} className="p-2 text-xs border border-slate-200 rounded bg-slate-50">
                                                <option>Bank</option>
                                                <option>CC</option>
                                                <option>Other</option>
                                            </select>

                                            <input type="date" value={payment.date} onChange={e => updatePaymentOut(index, 'date', e.target.value)} className="p-2 text-xs border border-slate-200 rounded bg-slate-50" />
                                            <input placeholder="Acc No / Ref" value={payment.accountNumber} onChange={e => updatePaymentOut(index, 'accountNumber', e.target.value)} className="p-2 text-xs border border-slate-200 rounded bg-slate-50" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Receipts In */}
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                                    <Landmark size={20} className="mr-2 text-green-600" /> Incoming Receipts
                                </h3>
                                <button type="button" onClick={addReceiptIn} className="text-xs flex items-center bg-white border border-slate-300 px-3 py-1 rounded-full shadow-sm hover:bg-slate-100">
                                    <Plus size={14} className="mr-1" /> Add Receipt
                                </button>
                            </div>
                            <div className="p-4 space-y-3">
                                {receiptsIn.map((receipt, index) => (
                                    <div key={index} className="p-4 rounded-xl border border-slate-200 bg-white relative group hover:border-slate-300 transition-colors shadow-sm">
                                        <button type="button" onClick={() => removeReceiptIn(index)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="grid grid-cols-2 gap-3 mb-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs font-bold text-slate-500 uppercase">From:</span>
                                                <select
                                                    value={receipt.fromType}
                                                    onChange={(e) => updateReceiptIn(index, 'fromType', e.target.value)}
                                                    className="p-1 px-2 text-xs font-bold text-slate-800 bg-slate-100 rounded border border-slate-200"
                                                >
                                                    <option>Owner</option>
                                                    <option>Agent</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs font-bold text-slate-500 uppercase">Mode:</span>
                                                <select
                                                    value={receipt.paymentMode}
                                                    onChange={(e) => updateReceiptIn(index, 'paymentMode', e.target.value)}
                                                    className="p-1 px-2 text-xs font-bold text-slate-800 bg-slate-100 rounded border border-slate-200"
                                                >
                                                    <option>Cash</option>
                                                    <option>Credit</option>
                                                    <option>Bank</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="col-span-2 relative">
                                                <input type="number" placeholder="Amount Recvd" value={receipt.amount} onChange={e => updateReceiptIn(index, 'amount', e.target.value)} className="w-full p-2 pl-8 text-sm font-bold border rounded bg-slate-50 border-green-200 text-green-800 placeholder-green-300" />
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">₹</span>
                                            </div>

                                            <input type="date" value={receipt.date} onChange={e => updateReceiptIn(index, 'date', e.target.value)} className="p-2 text-xs border border-slate-200 rounded bg-slate-50" />
                                            <input placeholder={receipt.paymentMode === 'Credit' ? 'Credit Note / Nil' : 'Bank / Acc No'} value={receipt.paymentMode === 'Credit' ? receipt.creditDetails : receipt.bankAccountNumber} onChange={e => updateReceiptIn(index, receipt.paymentMode === 'Credit' ? 'creditDetails' : 'bankAccountNumber', e.target.value)} className="p-2 text-xs border border-slate-200 rounded bg-slate-50" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-6 flex items-center justify-between border-t border-slate-100">
                        <div className="text-red-500 text-sm font-medium">{error}</div>
                        <div className="flex space-x-4">
                            {onClose && <button type="button" onClick={onClose} className="px-6 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-slate-50 transition-colors">Cancel</button>}
                            <button type="submit" disabled={loading} className="px-8 py-3 bg-indigo-900 text-white rounded-xl shadow-xl font-bold hover:bg-indigo-800 transform active:scale-95 transition-all flex items-center">
                                {loading ? 'Saving Entry...' : 'Save Complete Policy Entry'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPolicyForm;
