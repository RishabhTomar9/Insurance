import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import {
    X, FileText, Calendar, IndianRupee, Shield, Clock, Plus,
    Trash2, ChevronDown, ChevronUp, Briefcase, CreditCard,
    User, Landmark, Check, Loader2
} from 'lucide-react';
import CustomDropdown from '../common/CustomDropdown';

const AddPolicyForm = ({ onComplete, onCancel, cars = [], owners = [], employees = [], isManager = false }) => {
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

    const [paymentsOut, setPaymentsOut] = useState([{ category: 'Payment to Insurance Company', companyName: '', amount: '', date: new Date().toISOString().split('T')[0], paymentLinkType: 'GI', paymentMode: 'Bank', accountNumber: '' }]);
    const [receiptsIn, setReceiptsIn] = useState([{ fromType: 'Owner', amount: '', date: new Date().toISOString().split('T')[0], paymentMode: 'Cash', bankAccountType: '', bankAccountNumber: '', creditDetails: 'Nil' }]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showQuotation, setShowQuotation] = useState(true);

    const handleBasicChange = (e) => setBasicData({ ...basicData, [e.target.name]: e.target.value });
    const handleQuotationChange = (e) => setQuotationData({ ...quotationData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    const handlePolicyChange = (e) => setPolicyData({ ...policyData, [e.target.name]: e.target.value });

    const updatePaymentOut = (index, field, value) => {
        const newPayments = [...paymentsOut];
        newPayments[index][field] = value;
        setPaymentsOut(newPayments);
    };

    const addReceiptIn = () => {
        setReceiptsIn([...receiptsIn, { fromType: 'Owner', amount: '', date: new Date().toISOString().split('T')[0], paymentMode: 'Cash', bankAccountType: '', bankAccountNumber: '', creditDetails: '' }]);
    };
    const updateReceiptIn = (index, field, value) => {
        const newReceipts = [...receiptsIn];
        newReceipts[index][field] = value;
        setReceiptsIn(newReceipts);
    };

    const calculateDifference = () => {
        const premium = parseFloat(policyData.finalPremium || quotationData.netPremium || 0);
        const actual = parseFloat(quotationData.actualPaymentAmount || 0);
        return (premium - actual).toFixed(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Not authenticated');

            // Find current user's companyId
            const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
            const companyId = !userDoc.empty ? userDoc.docs[0].data().companyId : null;

            if (!companyId) throw new Error('Company ID not found');

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
                companyId,
                createdBy: user.uid,
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, 'policies'), payload);
            onComplete();
        } catch (error) {
            console.error(error);
            setError(error.message || 'Error saving policy record.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 w-full h-full min-h-screen overflow-y-auto font-['DM Sans']">
            <div className="max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-200">
                    <div className="flex items-center">
                        <div className="bg-indigo-600/10 text-indigo-600 p-4 rounded-2xl mr-6 border border-indigo-600/20 shadow-lg shadow-indigo-600/5">
                            <Plus size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">New Policy Entry</h2>
                            <p className="text-slate-500 mt-1 text-lg uppercase tracking-[2px]">Log quotation, issuance, and ledger entries.</p>
                        </div>
                    </div>
                    {onCancel && (
                        <button onClick={onCancel} className="bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-3 rounded-xl transition-all border border-slate-200 hover:border-indigo-600/50 hover:shadow-lg group shadow-xl">
                            <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 pb-20">
                    {/* 1. Main Details */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
                        <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-5">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center">
                                <span className="w-1.5 h-8 bg-indigo-600 rounded-full mr-3 shadow-lg shadow-indigo-600/20"></span>
                                Main Details
                            </h3>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Entry Date: {new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {isManager && (
                                <CustomDropdown
                                    label="Employee"
                                    options={[{ id: '', label: '-- Myself --' }, ...employees.map(e => ({ id: e.id || e.uid, label: e.email }))]}
                                    value={basicData.employeeId}
                                    onChange={(val) => setBasicData({ ...basicData, employeeId: val })}
                                    searchable={true}
                                />
                            )}
                            <CustomDropdown
                                label="Vehicle *"
                                options={cars.map(c => ({ id: c.id, label: `${c.vehicleNumber} (${c.make})` }))}
                                value={basicData.carId}
                                onChange={(val) => setBasicData({ ...basicData, carId: val })}
                                searchable={true}
                                placeholder="-- Choose Vehicle --"
                            />
                            <CustomDropdown
                                label="Owner *"
                                options={owners.map(o => ({ id: o.id, label: o.name }))}
                                value={basicData.ownerId}
                                onChange={(val) => setBasicData({ ...basicData, ownerId: val })}
                                searchable={true}
                                placeholder="-- Choose Owner --"
                            />
                            <div className="group">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 group-focus-within:text-indigo-600 transition-colors tracking-[1px] ml-1">Ref (Agent)</label>
                                <input
                                    name="agentName" value={basicData.agentName} onChange={handleBasicChange} placeholder="e.g. Self"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none font-bold placeholder:text-slate-300"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 group-focus-within:text-indigo-600 transition-colors tracking-[1px] ml-1">Contact Person</label>
                                <input
                                    name="contactPerson" value={basicData.contactPerson} onChange={handleBasicChange} placeholder="Name"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none font-bold placeholder:text-slate-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Price & Details */}
                    <div className={`rounded-[32px] border transition-all duration-500 shadow-2xl ${showQuotation ? 'bg-indigo-600/5 border-indigo-600/20' : 'bg-white border-slate-200'}`}>
                        <div className="p-8 cursor-pointer flex justify-between items-center" onClick={() => setShowQuotation(!showQuotation)}>
                            <h3 className="text-xl font-bold text-slate-900 flex items-center">
                                <span className={`w-1.5 h-8 rounded-full mr-3 transition-colors ${showQuotation ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-slate-200'}`}></span>
                                Price & Details
                            </h3>
                            {showQuotation ? <ChevronUp className="text-indigo-600" /> : <ChevronDown className="text-slate-400" />}
                        </div>

                        {showQuotation && (
                            <div className="px-8 pb-8 animate-fadeIn">
                                <div className="flex items-center gap-6 mb-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                    <label className="flex items-center space-x-3 cursor-pointer group">
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${quotationData.isGiven ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-transparent border-slate-200 group-hover:border-indigo-500'}`}>
                                            <input type="checkbox" name="isGiven" checked={quotationData.isGiven} onChange={handleQuotationChange} className="hidden" />
                                            {quotationData.isGiven && <Check size={16} strokeWidth={4} />}
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Price Sent</span>
                                    </label>
                                    <label className="flex items-center space-x-3 cursor-pointer group">
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${quotationData.isSent ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-transparent border-slate-200 group-hover:border-emerald-500'}`}>
                                            <input type="checkbox" name="isSent" checked={quotationData.isSent} onChange={handleQuotationChange} className="hidden" />
                                            {quotationData.isSent && <Check size={16} strokeWidth={4} />}
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">Confirmed</span>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                    <div className="group">
                                        <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-[1px] ml-1">IDV Amount</label>
                                        <input type="number" name="insuredAmount" value={quotationData.insuredAmount} onChange={handleQuotationChange} className="w-full p-3 bg-white border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none font-bold placeholder:text-slate-300" placeholder="0.00" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-[1px] ml-1">TP Premium</label>
                                        <input type="number" name="thirdPartyPremium" value={quotationData.thirdPartyPremium} onChange={handleQuotationChange} className="w-full p-3 bg-white border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none font-bold placeholder:text-slate-300" placeholder="0.00" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-[1px] ml-1">OD Premium</label>
                                        <input type="number" name="odPremium" value={quotationData.odPremium} onChange={handleQuotationChange} className="w-full p-3 bg-white border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none font-bold placeholder:text-slate-300" placeholder="0.00" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-bold text-indigo-600 mb-2 uppercase tracking-[1px] ml-1">Total Price</label>
                                        <input type="number" name="netPremium" value={quotationData.netPremium} onChange={handleQuotationChange} className="w-full p-3 bg-indigo-600/10 border border-indigo-600/30 text-indigo-600 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none font-bold placeholder:text-indigo-400" placeholder="0.00" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-slate-100 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                    <div className="group">
                                        <label className="block text-[10px] font-bold text-slate-900 mb-2 uppercase tracking-[1px] ml-1">Collected Amt</label>
                                        <div className="relative">
                                            <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="number" name="actualPaymentAmount" value={quotationData.actualPaymentAmount} onChange={handleQuotationChange} className="w-full p-3 pl-12 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none font-bold placeholder:text-slate-300" placeholder="0.00" />
                                        </div>
                                    </div>
                                    <CustomDropdown
                                        label="Mode"
                                        options={['Collection Gateway', 'Payment Gateway', 'Cash', 'Direct Transfer'].map(m => ({ value: m, label: m }))}
                                        value={quotationData.paymentGateway}
                                        onChange={(val) => setQuotationData({ ...quotationData, paymentGateway: val })}
                                    />
                                    <div className="group">
                                        <label className="block text-[10px] font-bold text-slate-900 mb-2 uppercase tracking-[1px] ml-1">Account Tracking</label>
                                        <div className="flex gap-3">
                                            <input name="fromAccount" value={quotationData.fromAccount} onChange={handleQuotationChange} className="w-1/2 p-3 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl font-bold placeholder:text-slate-300" placeholder="From" />
                                            <input name="toAccount" value={quotationData.toAccount} onChange={handleQuotationChange} className="w-1/2 p-3 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl font-bold placeholder:text-slate-300" placeholder="To" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. Policy Details */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[32px] border border-slate-200 p-8 h-full shadow-2xl">
                            <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center">
                                <span className="w-1.5 h-8 bg-emerald-500 rounded-full mr-3 shadow-lg shadow-emerald-500/20"></span>
                                Last Details
                            </h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-[1px] ml-1">Policy No.</label>
                                        <input name="policyNumber" value={policyData.policyNumber} onChange={handlePolicyChange} className="w-full p-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none font-bold uppercase placeholder:text-slate-300" placeholder="XXX-XXX" />
                                    </div>
                                    <CustomDropdown
                                        label="Company"
                                        options={['Policy Bazaar', 'Digit', 'Acko', 'HDFC Ergo', 'ICICI Lombard'].map(c => ({ value: c, label: c }))}
                                        value={policyData.insuranceCompany}
                                        onChange={(val) => setPolicyData({ ...policyData, insuranceCompany: val })}
                                        searchable={true}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="group">
                                        <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-[1px] ml-1">IDV</label>
                                        <input type="number" name="finalInsuredAmount" value={policyData.finalInsuredAmount} onChange={handlePolicyChange} className="w-full p-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none font-bold" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-bold text-emerald-600 mb-2 uppercase tracking-[1px] ml-1">Final Bill *</label>
                                        <input type="number" name="finalPremium" required value={policyData.finalPremium} onChange={handlePolicyChange} className="w-full p-3 bg-emerald-50 border border-emerald-500/20 text-emerald-600 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-500 outline-none font-bold" />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-[1px] ml-1">Start Date</label>
                                        <input type="date" name="policyStartDate" value={policyData.policyStartDate} onChange={handlePolicyChange} className="w-full p-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] border border-slate-200 p-8 flex flex-col justify-center h-full shadow-2xl">
                            <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center">
                                <span className="w-1.5 h-8 bg-purple-500 rounded-full mr-3 shadow-lg shadow-purple-500/20"></span>
                                Payment Summary
                            </h3>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <label className={`p-5 rounded-2xl border-2 cursor-pointer transition-all text-center text-[10px] font-bold uppercase tracking-widest ${policyData.policyPaymentMode === 'Direct Link' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-indigo-200'}`}>
                                        <input type="radio" name="policyPaymentMode" value="Direct Link" checked={policyData.policyPaymentMode === 'Direct Link'} onChange={handlePolicyChange} className="hidden" />
                                        Direct Link
                                    </label>
                                    <label className={`p-5 rounded-2xl border-2 cursor-pointer transition-all text-center text-[10px] font-bold uppercase tracking-widest ${policyData.policyPaymentMode === 'GI' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-indigo-200'}`}>
                                        <input type="radio" name="policyPaymentMode" value="GI" checked={policyData.policyPaymentMode === 'GI'} onChange={handlePolicyChange} className="hidden" />
                                        GI Route
                                    </label>
                                </div>
                                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 shadow-inner">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Premium Due</span>
                                        <span className="font-bold text-slate-900">₹ {policyData.finalPremium || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Amt Received</span>
                                        <span className="font-bold text-slate-900">₹ {quotationData.actualPaymentAmount || 0}</span>
                                    </div>
                                    <div className="h-px bg-slate-200 my-6 shadow-sm"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">Balance</span>
                                        <span className={`text-3xl font-bold ${calculateDifference() > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                            ₹ {calculateDifference()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ledger (Simplified implementation for creation) */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-2xl p-8">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center mb-6">
                                <CreditCard size={20} className="mr-3 text-rose-500" /> Outgoing (Payments)
                            </h3>
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-4">Default Entry Created</p>
                            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                                <span className="text-[10px] font-bold text-rose-500 uppercase">Insurance Premium Flow</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-2xl p-8">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center mb-6">
                                <Landmark size={20} className="mr-3 text-emerald-600" /> Incoming (Receipts)
                            </h3>
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-4">Default Entry Created</p>
                            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase">Owner Receipt logged</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-12 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-8">
                        <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
                            {error && <p className="text-rose-500 text-xs bg-rose-50 py-3 px-6 rounded-2xl border border-rose-100 font-bold uppercase tracking-widest inline-block">{error}</p>}
                        </div>
                        <div className="flex justify-end gap-6 w-full sm:w-auto">
                            {onCancel && (
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="px-10 py-5 rounded-2xl bg-white text-slate-400 hover:text-slate-700 border border-slate-200 hover:border-slate-300 transition-all font-bold uppercase tracking-widest text-xs shadow-sm active:scale-95"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-12 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all font-bold disabled:opacity-50 text-xs uppercase tracking-[3px] flex items-center justify-center gap-3 border border-indigo-500"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        <span>Saving Policy...</span>
                                    </>
                                ) : (
                                    <span>Create Policy Record</span>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPolicyForm;
