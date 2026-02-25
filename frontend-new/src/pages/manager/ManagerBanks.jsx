import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useToast } from '../../contexts/ToastContext';
import { useConfirmed } from '../../contexts/DialogContext';

const ManagerBanks = () => {
    const { addToast } = useToast();
    const { showConfirm } = useConfirmed();
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    const initialFormState = {
        bankName: '',
        branch: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        nickName: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        const banksQuery = query(collection(db, 'banks'), orderBy('bankName', 'asc'));
        const unsub = onSnapshot(banksQuery, (snap) => {
            setBanks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (error) => {
            console.error(error);
            addToast('Permission denied or error loading banks', 'error');
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                updatedAt: serverTimestamp()
            };

            if (editId) {
                await updateDoc(doc(db, 'banks', editId), payload);
                addToast('Bank updated successfully', 'success');
            } else {
                await addDoc(collection(db, 'banks'), {
                    ...payload,
                    createdAt: serverTimestamp()
                });
                addToast('Bank added successfully', 'success');
            }
            handleCloseModal();
        } catch (error) {
            console.error(error);
            addToast('Error saving bank', 'error');
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm('Delete Bank', 'Are you sure you want to delete this bank?');
        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, 'banks', id));
            addToast('Bank deleted successfully', 'info');
        } catch (error) {
            console.error(error);
            addToast('Failed to delete bank', 'error');
        }
    };

    const handleEdit = (bank) => {
        setEditId(bank.id);
        setFormData({
            bankName: bank.bankName,
            branch: bank.branch,
            accountNumber: bank.accountNumber,
            ifscCode: bank.ifscCode,
            accountHolderName: bank.accountHolderName,
            nickName: bank.nickName || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditId(null);
        setFormData(initialFormState);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Bank Management</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg shadow-indigo-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    <span>Add Bank Account</span>
                </button>
            </div>

            <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bank Name (Branch)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Account Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Holder Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nick Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {banks.map(bank => (
                            <tr key={bank.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-slate-900">{bank.bankName}</div>
                                    <div className="text-xs text-slate-500">{bank.branch}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-slate-700 font-mono">{bank.accountNumber}</div>
                                    <div className="text-xs text-slate-500">{bank.ifscCode}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-700">{bank.accountHolderName}</td>
                                <td className="px-6 py-4">
                                    {bank.nickName ? (
                                        <span className="px-2 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full">{bank.nickName}</span>
                                    ) : (
                                        <span className="text-slate-400 text-sm">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-3">
                                        <button onClick={() => handleEdit(bank)} className="text-indigo-600 hover:text-indigo-900 font-semibold transition-colors">Edit</button>
                                        <button onClick={() => handleDelete(bank.id)} className="text-red-500 hover:text-red-700">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {banks.length === 0 && !loading && (
                            <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No bank accounts found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800">{editId ? 'Edit Bank Account' : 'Add New Bank Account'}</h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
                                    <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required placeholder="e.g. HDFC Bank" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
                                    <input type="text" name="branch" value={formData.branch} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required placeholder="e.g. Main Branch" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
                                <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">IFSC Code</label>
                                    <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nick Name (Optional)</label>
                                    <input type="text" name="nickName" value={formData.nickName} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Primary Axis" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Account Holder Name</label>
                                <input type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                            </div>

                            <div className="pt-4">
                                <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-indigo-200">
                                    {editId ? 'Update Bank' : 'Save Bank Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerBanks;
