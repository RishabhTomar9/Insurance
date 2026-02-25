import React, { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import {
    X, FileText, Calendar, IndianRupee, Shield, Clock, Plus,
    Trash2, ChevronDown, ChevronUp, Briefcase, CreditCard,
    User, Landmark, Check, Loader2
} from 'lucide-react';

const EditPolicyForm = ({ policy, onUpdate, onCancel, cars = [], owners = [], employees = [], isManager = false }) => {
    const [basicData, setBasicData] = useState({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        carId: '',
        ownerId: '',
        agentName: '',
        contactPerson: ''
    });

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

    const [policyData, setPolicyData] = useState({
        policyIssueDate: '',
        insuranceCompany: '',
        policyNumber: '',
        policyStartDate: '',
        policyEndDate: '',
        policyType: 'Comprehensive',
        finalInsuredAmount: '',
        finalThirdPartyPremium: '',
        finalOdPremium: '',
        finalPremium: '',
        policyPaymentMode: 'GI',
    });

    const [paymentsOut, setPaymentsOut] = useState([]);
    const [receiptsIn, setReceiptsIn] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showQuotation, setShowQuotation] = useState(true);
    const [showLedger, setShowLedger] = useState(true);

    useEffect(() => {
        if (policy) {
            setBasicData({
                employeeId: policy.employeeId || '',
                date: (policy.createdAt?.toDate ? policy.createdAt.toDate() : new Date()).toISOString().split('T')[0],
                carId: policy.carId?.id || policy.carId?._id || policy.carId || '',
                ownerId: policy.ownerId?.id || policy.ownerId?._id || policy.ownerId || '',
                agentName: policy.agentName || '',
                contactPerson: policy.contactPerson || ''
            });

            if (policy.quotation) {
                setQuotationData({
                    isGiven: policy.quotation.isGiven || false,
                    isSent: policy.quotation.isSent || false,
                    insuredAmount: policy.quotation.insuredAmount || '',
                    thirdPartyPremium: policy.quotation.thirdPartyPremium || '',
                    odPremium: policy.quotation.odPremium || '',
                    netPremium: policy.quotation.netPremium || '',
                    actualPaymentAmount: policy.quotation.actualPaymentAmount || '',
                    paymentGateway: policy.quotation.paymentGateway || 'Collection Gateway',
                    fromAccount: policy.quotation.fromAccount || '',
                    toAccount: policy.quotation.toAccount || ''
                });
            }

            setPolicyData({
                policyIssueDate: policy.policyIssueDate || '',
                insuranceCompany: policy.insuranceCompany || '',
                policyNumber: policy.policyNumber || '',
                policyStartDate: policy.policyStartDate || '',
                policyEndDate: policy.policyEndDate || '',
                policyType: policy.policyType || 'Comprehensive',
                finalInsuredAmount: policy.finalInsuredAmount || '',
                finalThirdPartyPremium: policy.finalThirdPartyPremium || '',
                finalOdPremium: policy.finalOdPremium || '',
                finalPremium: policy.finalPremium || policy.premiumAmount || '',
                policyPaymentMode: policy.policyPaymentMode || 'GI'
            });

            if (policy.paymentsOut && policy.paymentsOut.length > 0) {
                setPaymentsOut(policy.paymentsOut);
            } else {
                setPaymentsOut([{ category: 'Payment to Insurance Company', companyName: '', amount: '', date: new Date().toISOString().split('T')[0], paymentLinkType: 'GI', paymentMode: 'Bank', accountNumber: '' }]);
            }

            if (policy.receiptsIn && policy.receiptsIn.length > 0) {
                setReceiptsIn(policy.receiptsIn);
            } else {
                setReceiptsIn([{ fromType: 'Owner', amount: '', date: new Date().toISOString().split('T')[0], paymentMode: 'Cash', bankAccountType: '', bankAccountNumber: '', creditDetails: 'Nil' }]);
            }
        }
    }, [policy]);

    // ... handlers ...
    const handleBasicChange = (e) => setBasicData({ ...basicData, [e.target.name]: e.target.value });
    const handleQuotationChange = (e) => setQuotationData({ ...quotationData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    const handlePolicyChange = (e) => setPolicyData({ ...policyData, [e.target.name]: e.target.value });

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

    const calculateDifference = () => {
        const premium = parseFloat(policyData.finalPremium || quotationData.netPremium || 0);
        const actual = parseFloat(quotationData.actualPaymentAmount || 0);
        return (premium - actual).toFixed(2);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Not authenticated');

            const payload = {
                ...basicData,
                quotation: {
                    ...quotationData,
                    insuredAmount: parseFloat(quotationData.insuredAmount) || 0,
                    thirdPartyPremium: parseFloat(quotationData.thirdPartyPremium) || 0,
                    odPremium: parseFloat(quotationData.odPremium) || 0,
                    netPremium: parseFloat(quotationData.netPremium) || 0,
                    actualPaymentAmount: parseFloat(quotationData.actualPaymentAmount) || 0
                },
                ...policyData,
                premiumAmount: parseFloat(policyData.finalPremium) || 0,
                finalInsuredAmount: parseFloat(policyData.finalInsuredAmount) || 0,
                finalThirdPartyPremium: parseFloat(policyData.finalThirdPartyPremium) || 0,
                finalOdPremium: parseFloat(policyData.finalOdPremium) || 0,
                finalPremium: parseFloat(policyData.finalPremium) || 0,
                paymentDifference: parseFloat(calculateDifference()) || 0,
                paymentsOut: paymentsOut.map(p => ({ ...p, amount: parseFloat(p.amount) || 0 })),
                receiptsIn: receiptsIn.map(r => ({ ...r, amount: parseFloat(r.amount) || 0 })),
                updatedAt: serverTimestamp()
            };

            await updateDoc(doc(db, 'policies', policy.id || policy._id), payload);
            onUpdate();
        } catch (error) {
            console.error(error);
            setError(error.message || 'Error updating policy record.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="bg-white w-full h-full min-h-screen overflow-y-auto animate-fadeIn">
            <div className="max-w-6xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="flex justify-between items-center mb-10 pb-8 border-b border-slate-100">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
                            <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl mr-5 shadow-sm border border-indigo-100">
                                <FileText size={32} />
                            </div>
                            Edit Policy Entry
                        </h2>
                        <p className="text-slate-500 mt-2 ml-[92px] text-lg font-medium">Update quotation, issuance, and ledger details.</p>
                    </div>
                    {onCancel && (
                        <button onClick={onCancel} className="bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-3.5 rounded-full transition-all border border-slate-100 hover:shadow-md group">
                            <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    )}
                </div>

                <form onSubmit={handleUpdate} className="space-y-10 pb-20">

                    {/* 1. Basic Information */}
                    <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-200/60 shadow-sm transition-all hover:border-indigo-200">
                        <div className="mb-8 flex items-center justify-between border-b border-slate-200/50 pb-5">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center">
                                <span className="w-1.5 h-8 bg-indigo-600 rounded-full mr-4"></span>
                                Basic Details
                            </h3>
                            <div className="px-4 py-1.5 bg-white rounded-full border border-slate-200 text-xs font-bold text-slate-500 shadow-sm">
                                REF: {policy?._id?.slice(-8).toUpperCase()}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Manager Selection */}
                            {isManager && (
                                <div className="group">
                                    <label className="block text-sm font-bold text-slate-500 uppercase mb-2 ml-1 group-focus-within:text-indigo-600 transition-colors">Employee Assignment</label>
                                    <div className="relative">
                                        <select
                                            name="employeeId"
                                            value={basicData.employeeId}
                                            onChange={handleBasicChange}
                                            className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold appearance-none"
                                        >
                                            <option value="">-- Assign to Me --</option>
                                            {employees.map(e => <option key={e.id || e.uid} value={e.id || e.uid}>{e.email}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronDown size={20} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-500 uppercase mb-2 ml-1 group-focus-within:text-indigo-600 transition-colors">Vehicle *</label>
                                <div className="relative">
                                    <select
                                        name="carId" required value={basicData.carId} onChange={handleBasicChange}
                                        className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold appearance-none"
                                    >
                                        <option value="">-- Select Vehicle --</option>
                                        {cars.map(c => <option key={c.id} value={c.id}>{c.vehicleNumber} ({c.make})</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ChevronDown size={20} />
                                    </div>
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-500 uppercase mb-2 ml-1 group-focus-within:text-indigo-600 transition-colors">Owner *</label>
                                <div className="relative">
                                    <select
                                        name="ownerId" required value={basicData.ownerId} onChange={handleBasicChange}
                                        className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold appearance-none"
                                    >
                                        <option value="">-- Select Owner --</option>
                                        {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ChevronDown size={20} />
                                    </div>
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-500 uppercase mb-2 ml-1 group-focus-within:text-indigo-600 transition-colors">Agent / Referrer</label>
                                <div className="relative">
                                    <input
                                        name="agentName" value={basicData.agentName} onChange={handleBasicChange} placeholder="Agent Name"
                                        className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold placeholder:font-normal"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                        <Briefcase size={20} />
                                    </div>
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-500 uppercase mb-2 ml-1 group-focus-within:text-indigo-600 transition-colors">Contact Person</label>
                                <div className="relative">
                                    <input
                                        name="contactPerson" value={basicData.contactPerson} onChange={handleBasicChange} placeholder="Contact Person"
                                        className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold placeholder:font-normal"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                        <User size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Quotation Details */}
                    <div className={`rounded-3xl border transition-all duration-300 ${showQuotation ? 'bg-slate-50 border-slate-300 shadow-sm' : 'bg-white border-slate-200 shadow-none'}`}>
                        <div className="p-8 cursor-pointer flex justify-between items-center group/tab" onClick={() => setShowQuotation(!showQuotation)}>
                            <h3 className="text-xl font-bold text-slate-900 flex items-center">
                                <span className={`w-1.5 h-8 rounded-full mr-4 transition-colors ${showQuotation ? 'bg-blue-600' : 'bg-slate-200'}`}></span>
                                Quotation Details
                            </h3>
                            <div className={`p-2 rounded-xl border transition-all ${showQuotation ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-400 group-hover/tab:text-slate-600'}`}>
                                {showQuotation ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                            </div>
                        </div>

                        {showQuotation && (
                            <div className="px-8 pb-8 animate-fadeIn">
                                <div className="flex flex-wrap items-center gap-6 mb-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-inner-sm">
                                    <label className="flex items-center space-x-3 cursor-pointer group/check">
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${quotationData.isGiven ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 group-hover/check:border-indigo-400'}`}>
                                            <input type="checkbox" name="isGiven" checked={quotationData.isGiven} onChange={handleQuotationChange} className="hidden" />
                                            {quotationData.isGiven && <Check size={16} strokeWidth={4} />}
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">Quotation Created</span>
                                    </label>
                                    <label className="flex items-center space-x-3 cursor-pointer group/check">
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${quotationData.isSent ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-300 group-hover/check:border-emerald-400'}`}>
                                            <input type="checkbox" name="isSent" checked={quotationData.isSent} onChange={handleQuotationChange} className="hidden" />
                                            {quotationData.isSent && <Check size={16} strokeWidth={4} />}
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">Sent to Customer</span>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Insured Amount (IDV)</label>
                                        <div className="relative">
                                            <input type="number" name="insuredAmount" value={quotationData.insuredAmount} onChange={handleQuotationChange} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" placeholder="0.00" />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">INR</div>
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Third Party Premium</label>
                                        <input type="number" name="thirdPartyPremium" value={quotationData.thirdPartyPremium} onChange={handleQuotationChange} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-700" placeholder="0.00" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Own Damage (OD)</label>
                                        <input type="number" name="odPremium" value={quotationData.odPremium} onChange={handleQuotationChange} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-700" placeholder="0.00" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Net Premium</label>
                                        <input type="number" name="netPremium" value={quotationData.netPremium} onChange={handleQuotationChange} className="w-full p-3.5 border border-slate-200 rounded-xl font-extrabold text-indigo-700 bg-indigo-50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" placeholder="0.00" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-200/60">
                                    <div className="group">
                                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Actual Payment Recvd.</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 font-bold">₹</div>
                                            <input type="number" name="actualPaymentAmount" value={quotationData.actualPaymentAmount} onChange={handleQuotationChange} className="w-full p-4 pl-10 bg-white border border-slate-200 rounded-2xl font-extrabold text-slate-800 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" placeholder="0.00" />
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Gateway / Mode</label>
                                        <div className="relative">
                                            <select name="paymentGateway" value={quotationData.paymentGateway} onChange={handleQuotationChange} className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-800 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all appearance-none">
                                                <option>Collection Gateway</option>
                                                <option>Payment Gateway</option>
                                                <option>Cash</option>
                                                <option>Direct Transfer</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <ChevronDown size={20} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Transaction Route</label>
                                        <div className="flex gap-3">
                                            <input name="fromAccount" value={quotationData.fromAccount} onChange={handleQuotationChange} className="w-1/2 p-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" placeholder="From Acc" />
                                            <input name="toAccount" value={quotationData.toAccount} onChange={handleQuotationChange} className="w-1/2 p-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" placeholder="To Acc" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. Policy Issue & Payment Analysis */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Policy Info */}
                        <div className="bg-slate-50/50 rounded-3xl border border-slate-200/60 p-8 h-full transition-all hover:border-emerald-200">
                            <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center">
                                <span className="w-1.5 h-8 bg-emerald-600 rounded-full mr-4"></span>
                                Final Policy Details
                            </h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Policy Number</label>
                                        <input name="policyNumber" value={policyData.policyNumber} onChange={handlePolicyChange} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold uppercase focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" placeholder="POL-XXX-XXX" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Insurance Company</label>
                                        <div className="relative">
                                            <select name="insuranceCompany" value={policyData.insuranceCompany} onChange={handlePolicyChange} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all appearance-none text-slate-700">
                                                <option value="">-- Select --</option>
                                                <option>Policy Bazaar</option>
                                                <option>Digit</option>
                                                <option>Acko</option>
                                                <option>HDFC Ergo</option>
                                                <option>ICICI Lombard</option>
                                                <option>Reliance General</option>
                                                <option>Star Health</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <Landmark size={18} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Final IDV</label>
                                        <input type="number" name="finalInsuredAmount" value={policyData.finalInsuredAmount} onChange={handlePolicyChange} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" placeholder="0.00" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Final Premium *</label>
                                        <input type="number" name="finalPremium" required value={policyData.finalPremium} onChange={handlePolicyChange} className="w-full p-4 border border-slate-300 rounded-xl font-extrabold bg-emerald-50 text-emerald-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" placeholder="0.00" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Start Date</label>
                                        <div className="relative">
                                            <input type="date" name="policyStartDate" value={policyData.policyStartDate} onChange={handlePolicyChange} className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-emerald-500 transition-colors">
                                                <Calendar size={18} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Analysis */}
                        <div className="bg-slate-50/50 rounded-3xl border border-slate-200/60 p-8 flex flex-col justify-center h-full transition-all hover:border-purple-200">
                            <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center">
                                <span className="w-1.5 h-8 bg-purple-600 rounded-full mr-4"></span>
                                Payment Reconciliation
                            </h3>
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-4 ml-1">Source Logic Selection</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['Direct Link', 'GI'].map(mode => (
                                            <label key={mode} className={`relative flex items-center justify-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${policyData.policyPaymentMode === mode ? 'bg-purple-50 border-purple-600 text-purple-900 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                                                <input type="radio" name="policyPaymentMode" value={mode} checked={policyData.policyPaymentMode === mode} onChange={handlePolicyChange} className="hidden" />
                                                <span className={`text-base font-extrabold ${policyData.policyPaymentMode === mode ? 'opacity-100' : 'opacity-60'}`}>{mode}</span>
                                                {policyData.policyPaymentMode === mode && (
                                                    <div className="absolute -top-2 -right-2 bg-purple-600 text-white p-1 rounded-full border-2 border-white">
                                                        <Check size={12} strokeWidth={4} />
                                                    </div>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-6 bg-white rounded-2xl border border-slate-200 flex justify-between items-center shadow-inner-sm">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Difference Analysis</span>
                                        <span className="text-sm text-slate-600 font-bold">(Premium - Paid)</span>
                                    </div>
                                    <div className={`px-6 py-3 rounded-2xl font-black text-2xl flex items-center gap-2 ${calculateDifference() > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        <span className="text-lg">₹</span>
                                        {calculateDifference().toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Ledger: Payments Out & Receipts In */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Payments Out */}
                        <div className="bg-slate-50/50 rounded-3xl border border-slate-200/60 overflow-hidden flex flex-col transition-all hover:border-rose-200">
                            <div className="px-8 py-6 border-b border-slate-200/60 flex justify-between items-center bg-white/40">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg mr-3 shadow-sm border border-rose-100">
                                        <CreditCard size={18} />
                                    </div>
                                    Outgoing Payments
                                </h3>
                                <button type="button" onClick={addPaymentOut} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 hover:shadow-lg transition-all flex items-center gap-2">
                                    <Plus size={16} /> Add Entry
                                </button>
                            </div>
                            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                                {paymentsOut.length === 0 && (
                                    <div className="text-center py-12 text-slate-400 font-medium">No outgoing payments recorded.</div>
                                )}
                                {paymentsOut.map((payment, index) => (
                                    <div key={index} className="p-5 rounded-2xl border border-slate-200 bg-white relative group hover:border-rose-300 transition-all shadow-sm animate-fadeIn">
                                        <button type="button" onClick={() => removePaymentOut(index)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-600 transition-colors p-2 hover:bg-rose-50 rounded-lg">
                                            <Trash2 size={18} />
                                        </button>
                                        <div className="mb-4">
                                            <select
                                                value={payment.category}
                                                onChange={(e) => updatePaymentOut(index, 'category', e.target.value)}
                                                className="w-full p-2.5 text-xs font-bold text-slate-800 bg-slate-50 rounded-xl border border-slate-100 outline-none"
                                            >
                                                <option>Payment to Insurance Company</option>
                                                <option>Payment to Direct Link</option>
                                                <option>Commission Payout</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Entity Name</label>
                                                <input placeholder="Name" value={payment.companyName} onChange={e => updatePaymentOut(index, 'companyName', e.target.value)} className="w-full p-3 text-xs font-bold border border-slate-100 rounded-xl bg-slate-50 focus:bg-white focus:border-rose-200 outline-none transition-all" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Amount</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                    <input type="number" placeholder="0" value={payment.amount} onChange={e => updatePaymentOut(index, 'amount', e.target.value)} className="w-full p-3 pl-7 text-xs font-bold border border-slate-100 rounded-xl bg-slate-50 focus:bg-white focus:border-rose-200 outline-none transition-all text-rose-700" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Mode / Type</label>
                                                <div className="flex gap-2">
                                                    <select value={payment.paymentLinkType} onChange={e => updatePaymentOut(index, 'paymentLinkType', e.target.value)} className="w-1/2 p-3 text-xs font-bold border border-slate-100 rounded-xl bg-slate-50 outline-none">
                                                        <option>GI</option>
                                                        <option>Link</option>
                                                    </select>
                                                    <select value={payment.paymentMode} onChange={e => updatePaymentOut(index, 'paymentMode', e.target.value)} className="w-1/2 p-3 text-xs font-bold border border-slate-100 rounded-xl bg-slate-50 outline-none">
                                                        <option>Bank</option>
                                                        <option>CC</option>
                                                        <option>Cash</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Date & Ref</label>
                                                <div className="flex gap-2">
                                                    <input type="date" value={payment.date} onChange={e => updatePaymentOut(index, 'date', e.target.value)} className="w-1/2 p-3 text-[10px] font-bold border border-slate-100 rounded-xl bg-slate-50 outline-none" />
                                                    <input placeholder="Ref #" value={payment.accountNumber} onChange={e => updatePaymentOut(index, 'accountNumber', e.target.value)} className="w-1/2 p-3 text-xs font-bold border border-slate-100 rounded-xl bg-slate-50 outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Receipts In */}
                        <div className="bg-slate-50/50 rounded-3xl border border-slate-200/60 overflow-hidden flex flex-col transition-all hover:border-emerald-200">
                            <div className="px-8 py-6 border-b border-slate-200/60 flex justify-between items-center bg-white/40">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg mr-3 shadow-sm border border-emerald-100">
                                        <Landmark size={18} />
                                    </div>
                                    Incoming Receipts
                                </h3>
                                <button type="button" onClick={addReceiptIn} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 hover:shadow-lg transition-all flex items-center gap-2">
                                    <Plus size={16} /> Add Entry
                                </button>
                            </div>
                            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                                {receiptsIn.length === 0 && (
                                    <div className="text-center py-12 text-slate-400 font-medium">No receipts recorded yet.</div>
                                )}
                                {receiptsIn.map((receipt, index) => (
                                    <div key={index} className="p-5 rounded-2xl border border-slate-200 bg-white relative group hover:border-emerald-300 transition-all shadow-sm animate-fadeIn">
                                        <button type="button" onClick={() => removeReceiptIn(index)} className="absolute top-4 right-4 text-slate-300 hover:text-emerald-600 transition-colors p-2 hover:bg-emerald-50 rounded-lg">
                                            <Trash2 size={18} />
                                        </button>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Source</label>
                                                <select
                                                    value={receipt.fromType}
                                                    onChange={(e) => updateReceiptIn(index, 'fromType', e.target.value)}
                                                    className="p-2.5 text-xs font-bold text-slate-800 bg-slate-50 rounded-xl border border-slate-100 outline-none"
                                                >
                                                    <option>Owner</option>
                                                    <option>Agent</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Mode</label>
                                                <select
                                                    value={receipt.paymentMode}
                                                    onChange={(e) => updateReceiptIn(index, 'paymentMode', e.target.value)}
                                                    className="p-2.5 text-xs font-bold text-slate-800 bg-slate-50 rounded-xl border border-slate-100 outline-none"
                                                >
                                                    <option>Cash</option>
                                                    <option>Upi / Online</option>
                                                    <option>Bank Transfer</option>
                                                    <option>Credit Note</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="md:col-span-2 space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Amount Received</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-black">₹</span>
                                                    <input type="number" placeholder="0" value={receipt.amount} onChange={e => updateReceiptIn(index, 'amount', e.target.value)} className="w-full p-4 pl-8 text-base font-black border border-slate-100 rounded-2xl bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all text-emerald-800" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Date</label>
                                                <input type="date" value={receipt.date} onChange={e => updateReceiptIn(index, 'date', e.target.value)} className="w-full p-4 text-[10px] font-bold border border-slate-100 rounded-2xl bg-slate-50 outline-none" />
                                            </div>
                                            <div className="md:col-span-3 space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Reference / Credit Note Details</label>
                                                <input placeholder="Account No, Transaction ID, or Reason for Credit" value={receipt.paymentMode === 'Credit Note' ? (receipt.creditDetails || '') : (receipt.bankAccountNumber || '')} onChange={e => updateReceiptIn(index, receipt.paymentMode === 'Credit Note' ? 'creditDetails' : 'bankAccountNumber', e.target.value)} className="w-full p-4 text-xs font-bold text-slate-600 border border-slate-100 rounded-2xl bg-slate-50 focus:bg-white outline-none transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-10 flex flex-col md:flex-row items-center justify-between border-t border-slate-100 gap-6">
                        <div className="flex items-center gap-3 text-rose-500 bg-rose-50 px-5 py-2.5 rounded-2xl border border-rose-100 animate-pulse">
                            {error ? (
                                <>
                                    <Shield size={18} />
                                    <span className="text-sm font-bold">{error}</span>
                                </>
                            ) : (
                                <div className="text-slate-400 text-sm font-medium">Verify all fields before submission.</div>
                            )}
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            {onCancel && (
                                <button type="button" onClick={onCancel} className="flex-1 md:flex-none px-8 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-600 font-extrabold hover:bg-slate-50 hover:text-slate-900 transition-all transform active:scale-95">
                                    Cancel Changes
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 md:flex-none px-12 py-4 bg-indigo-900 text-white rounded-2xl shadow-xl shadow-indigo-200 font-black hover:bg-indigo-800 hover:-translate-y-1 transform active:translate-y-0 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" />
                                        <span>Saving Record...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check size={24} strokeWidth={3} />
                                        <span>Update Policy Entry</span>
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

export default EditPolicyForm;
