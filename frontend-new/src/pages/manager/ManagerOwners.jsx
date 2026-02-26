import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useConfirmed } from '../../contexts/DialogContext';
import { Plus, Edit2, Trash2, Users, Search, Mail, Phone, MapPin, CreditCard, ArrowUpRight } from 'lucide-react';
import AddOwnerForm from '../../components/employee/AddOwnerForm';
import EditOwnerForm from '../../components/employee/EditOwnerForm';

const ManagerOwners = () => {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const { showConfirm } = useConfirmed();
    const [owners, setOwners] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingOwner, setEditingOwner] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!currentUser) return;

        const isManager = currentUser.role === 'manager' || currentUser.role === 'super-admin' || currentUser.role === 'admin';
        const companyId = currentUser.companyId;

        if (!companyId) return;

        // Owners Listener
        const ownersQuery = isManager
            ? query(collection(db, 'owners'), where('companyId', '==', companyId), orderBy('createdAt', 'desc'))
            : query(collection(db, 'owners'), where('companyId', '==', companyId), where('employeeId', '==', currentUser.uid), orderBy('createdAt', 'desc'));

        const unsubOwners = onSnapshot(ownersQuery, (snap) => {
            setOwners(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (error) => {
            console.error(error);
            addToast('Permission denied or error loading owners', 'error');
            setLoading(false);
        });

        // Employees Listener - only for managers/admins
        let unsubEmployees = () => { };
        if (isManager) {
            const employeesQuery = query(collection(db, 'users'), where('companyId', '==', companyId));
            unsubEmployees = onSnapshot(employeesQuery, (snap) => {
                setEmployees(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            });
        }

        return () => {
            unsubOwners();
            unsubEmployees();
        };
    }, [currentUser]);

    const handleEdit = (owner) => {
        setEditingOwner(owner);
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm(
            'Delete Owner',
            'Are you sure you want to permanently delete this owner? This action cannot be undone.',
            'danger'
        );
        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, 'owners', id));
            addToast('Owner deleted successfully', 'info');
        } catch (error) {
            console.error(error);
            addToast('Failed to delete owner', 'error');
        }
    };

    const filteredOwners = owners.filter(owner =>
        owner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.phone?.includes(searchTerm)
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-[#6b7db3] font-bold uppercase tracking-widest text-sm text-center px-4">Loading Owner List...</p>
        </div>
    );

    const showForm = isAddModalOpen || editingOwner;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Page Header */}
            {!showForm && (
                <>
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white font-bold tracking-widest uppercase flex items-center gap-3">
                                <Users className="text-emerald-500 w-8 h-8" />
                                Owner List
                            </h1>
                            <p className="text-[#6b7db3] text-xs mt-1 uppercase tracking-[2px]">Manage all vehicle owners</p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                            <div className="relative group flex-1 sm:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7db3] group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="SEARCH OWNERS..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#111629] border border-[#1e2745] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-[#2a3660]"
                                />
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                            >
                                <Plus size={16} /> Add Owner
                            </button>
                        </div>
                    </div>

                    {/* Registry Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOwners.map(owner => (
                            <div key={owner.id} className="bg-[#111629] border border-[#1e2745] rounded-3xl p-6 group hover:border-emerald-500/50 transition-all relative overflow-hidden flex flex-col h-full">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-600/10 transition-all" />

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-14 h-14 bg-[#0b0e1a] border border-[#1e2745] rounded-2xl flex items-center justify-center text-emerald-500 font-bold text-xl group-hover:border-emerald-500/40 transition-all font-bold">
                                            {owner.name ? owner.name[0].toUpperCase() : 'U'}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(owner)}
                                                className="p-2 bg-[#0b0e1a] text-[#6b7db3] border border-[#1e2745] rounded-lg hover:border-blue-500 hover:text-white transition-all shadow-lg"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(owner.id)}
                                                className="p-2 bg-[#0b0e1a] text-rose-500/70 border border-[#1e2745] rounded-lg hover:border-rose-500 hover:text-white transition-all shadow-lg"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-white font-bold tracking-wider group-hover:text-emerald-400 transition-colors uppercase truncate">
                                        {owner.name}
                                    </h3>

                                    <div className="mt-8 space-y-4 pt-6 border-t border-[#1e2745] flex-1">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-[#0b0e1a] rounded-lg text-[#2a3660] group-hover:text-emerald-500 transition-colors">
                                                <Phone size={14} />
                                            </div>
                                            <span className="text-[10px] text-white font-bold tracking-wider">{owner.phone || 'NO DATA'}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-[#0b0e1a] rounded-lg text-[#2a3660] group-hover:text-emerald-500 transition-colors">
                                                <Mail size={14} />
                                            </div>
                                            <span className="text-[10px] text-white font-bold tracking-wider truncate">{owner.email || 'NO EMAIL'}</span>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-[#0b0e1a] rounded-lg text-[#2a3660] group-hover:text-emerald-500 transition-colors shrink-0">
                                                <MapPin size={14} />
                                            </div>
                                            <span className="text-[10px] text-[#6b7db3] font-bold uppercase tracking-wider line-clamp-2 mt-2 leading-relaxed">{owner.address || 'NO ADDRESS'}</span>
                                        </div>
                                    </div>

                                    {owner.aadharCard && (
                                        <div className="mt-6 p-4 bg-[#0b0e1a] border border-[#1e2745] rounded-2xl flex items-center gap-3">
                                            <CreditCard size={14} className="text-[#2a3660]" />
                                            <div className="flex flex-col">
                                                <span className="text-[8px] text-[#2a3660]  uppercase tracking-[2px]">Aadhar Card</span>
                                                <span className="text-[10px] text-emerald-400 font-bold tracking-widest">{owner.aadharCard}</span>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleEdit(owner)}
                                        className="mt-6 w-full py-3 bg-[#0b0e1a] border border-[#1e2745] rounded-xl text-[9px] font-bold text-[#6b7db3] uppercase tracking-[3px] group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        VIEW PROFILE <ArrowUpRight size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {filteredOwners.length === 0 && (
                            <div className="col-span-full py-20 text-center bg-[#111629] border border-dashed border-[#1e2745] rounded-3xl">
                                <Users size={48} className="mx-auto mb-4 text-[#2a3660]" />
                                <p className="text-[#6b7db3] font-bold uppercase tracking-[3px] text-xs">No owners found</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Principal Forge (Forms) */}
            {showForm && (
                <div className="fixed inset-0 z-50 bg-[#0b0e1a] animate-in slide-in-from-bottom duration-500 overflow-y-auto custom-scrollbar">
                    <div className="min-h-screen p-4 md:p-10">
                        <div className="max-w-[1400px] mx-auto">
                            {isAddModalOpen && (
                                <AddOwnerForm
                                    onAdd={() => {
                                        setIsAddModalOpen(false);
                                        addToast('Owner added successfully', 'success');
                                    }}
                                    onCancel={() => setIsAddModalOpen(false)}
                                    employees={employees}
                                    isManager={currentUser?.role === 'manager' || currentUser?.role === 'super-admin'}
                                />
                            )}

                            {editingOwner && (
                                <EditOwnerForm
                                    owner={editingOwner}
                                    onUpdate={() => {
                                        setEditingOwner(null);
                                        addToast('Owner details updated', 'success');
                                    }}
                                    onCancel={() => setEditingOwner(null)}
                                    employees={employees}
                                    isManager={currentUser?.role === 'manager' || currentUser?.role === 'super-admin'}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerOwners;

