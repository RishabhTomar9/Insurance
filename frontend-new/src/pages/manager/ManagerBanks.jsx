import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useConfirmed } from '../../contexts/DialogContext';
import { Landmark, Plus, Search, Edit2, Trash2, X, CreditCard } from 'lucide-react';

const ManagerBanks = () => {
    const { currentUser } = useAuth();
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
        if (!currentUser?.companyId) return;

        const banksQuery = query(
            collection(db, 'banks'),
            where('companyId', '==', currentUser.companyId),
            orderBy('bankName', 'asc')
        );
        const unsub = onSnapshot(banksQuery, (snap) => {
            setBanks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (error) => {
            console.error(error);
            addToast('Permission denied or error loading banks', 'error');
            setLoading(false);
        });

        return () => unsub();
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                updatedAt: serverTimestamp()
            };

            if (editId) {
                await updateDoc(doc(db, 'banks', editId), payload);
                addToast('Bank account updated', 'success');
            } else {
                await addDoc(collection(db, 'banks'), {
                    ...payload,
                    companyId: currentUser.companyId,
                    createdAt: serverTimestamp()
                });
                addToast('Bank account added successfully', 'success');
            }
            handleCloseModal();
        } catch (error) {
            console.error(error);
            addToast('Failed to save bank account', 'error');
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm('Delete Bank Account', 'Are you sure you want to delete this bank account?');
        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, 'banks', id));
            addToast('Bank account deleted successfully', 'info');
        } catch (error) {
            console.error(error);
            addToast('Failed to delete bank account', 'error');
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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-[#6b7db3] font-bold uppercase tracking-widest text-sm text-center px-4">Loading Bank Accounts...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white font-bold tracking-widest uppercase flex items-center gap-3">
                        <Landmark className="text-indigo-500 w-8 h-8" />
                        Bank Accounts
                    </h1>
                    <p className="text-[#6b7db3] text-xs mt-1 uppercase tracking-[2px]">Manage company bank details</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="group relative flex items-center justify-center space-x-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <Plus className="w-5 h-5 relative z-10" />
                    <span className="text-[10px] font-bold uppercase tracking-widest relative z-10">Add Bank Account</span>
                </button>
            </div>

            {/* Registry Table */}
            <div className="bg-[#111629] border border-[#1e2745] rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-[#0b0e1a] border-b border-[#1e2745]">
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-[#6b7db3] uppercase tracking-[3px]">Bank & Branch</th>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-[#6b7db3] uppercase tracking-[3px]">Account Details</th>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-[#6b7db3] uppercase tracking-[3px]">Account Holder</th>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-[#6b7db3] uppercase tracking-[3px]">Nickname</th>
                                <th className="px-6 py-5 text-center text-[10px] font-bold text-[#6b7db3] uppercase tracking-[3px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e2745]">
                            {banks.map(bank => (
                                <tr key={bank.id} className="hover:bg-[#1c243f]/30 transition-all group">
                                    <td className="px-6 py-6">
                                        <div className="text-sm font-bold text-white group-hover:text-indigo-500 transition-colors uppercase tracking-wider">{bank.bankName}</div>
                                        <div className="text-[10px] text-[#2a3660] font-bold uppercase mt-1 tracking-widest">{bank.branch}</div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="text-xs font-bold text-indigo-200 tracking-[1px]">{bank.accountNumber}</div>
                                        <div className="text-[10px] text-[#6b7db3] mt-1 font-bold uppercase tracking-widest italic">{bank.ifscCode}</div>
                                    </td>
                                    <td className="px-6 py-6 text-xs font-bold text-white uppercase tracking-wider">{bank.accountHolderName}</td>
                                    <td className="px-6 py-6">
                                        {bank.nickName ? (
                                            <span className="text-[9px]  py-0.5 px-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg uppercase tracking-widest">
                                                {bank.nickName}
                                            </span>
                                        ) : (
                                            <span className="text-[#2a3660] text-xs">--</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(bank)}
                                                className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-500 hover:text-white transition-all shadow-lg"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(bank.id)}
                                                className="p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {banks.length === 0 && (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-[#0b0e1a] border border-[#1e2745] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Landmark className="w-8 h-8 text-[#2a3660]" />
                            </div>
                            <p className="text-[#6b7db3] font-bold uppercase tracking-[3px] text-xs">No bank accounts found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Integration Portal (Modal) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0b0e1a]/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-[#111629] border border-[#1e2745] w-full max-w-xl rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.15)] animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-[#1e2745] flex justify-between items-center bg-[#0b0e1a]">
                            <div>
                                <h3 className="text-xl font-bold text-white font-bold uppercase tracking-widest">
                                    {editId ? 'Edit Bank Details' : 'Add Bank Account'}
                                </h3>
                                <p className="text-[10px] text-[#6b7db3] font-bold uppercase tracking-[2px] mt-1">Manage bank information</p>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 bg-[#1c243f] text-[#6b7db3] hover:text-white rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px]  text-[#2a3660] uppercase tracking-[2px] ml-1">Bank Name</label>
                                    <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="w-full bg-[#0b0e1a] border border-[#1e2745] text-white text-[12px] font-bold rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-[#2a3660]" required placeholder="Bank Name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px]  text-[#2a3660] uppercase tracking-[2px] ml-1">Branch Name</label>
                                    <input type="text" name="branch" value={formData.branch} onChange={handleChange} className="w-full bg-[#0b0e1a] border border-[#1e2745] text-white text-[12px] font-bold rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-[#2a3660]" required placeholder="Branch Name" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px]  text-[#2a3660] uppercase tracking-[2px] ml-1">Account Number</label>
                                <div className="relative group">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2a3660] group-focus-within:text-indigo-500 transition-colors" />
                                    <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="w-full bg-[#0b0e1a] border border-[#1e2745] text-white text-[12px] font-bold rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-[#2a3660] font-bold tracking-widest" required placeholder="Account Number" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px]  text-[#2a3660] uppercase tracking-[2px] ml-1">IFSC Code</label>
                                    <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} className="w-full bg-[#0b0e1a] border border-[#1e2745] text-white text-[12px] font-bold rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-[#2a3660] font-bold tracking-widest" required placeholder="IFSC Code" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px]  text-[#2a3660] uppercase tracking-[2px] ml-1">Nickname</label>
                                    <input type="text" name="nickName" value={formData.nickName} onChange={handleChange} className="w-full bg-[#0b0e1a] border border-[#1e2745] text-white text-[12px] font-bold rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-[#2a3660]" placeholder="E.g. Primary Account" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px]  text-[#2a3660] uppercase tracking-[2px] ml-1">Account Holder Name</label>
                                <input type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} className="w-full bg-[#0b0e1a] border border-[#1e2745] text-white text-[12px] font-bold rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-[#2a3660]" required placeholder="Full Name" />
                            </div>

                            <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px]  uppercase tracking-[4px] rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] mt-4">
                                {editId ? 'Save Changes' : 'Add Account'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerBanks;
