import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Edit2, Trash2, Search, Mail, Phone, X, Loader2, ArrowUpRight } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useConfirmed } from '../../contexts/DialogContext';

const ManagerAgents = () => {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const { showConfirm } = useConfirmed();

    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState(null);

    const [formData, setFormData] = useState({ name: '', mobile: '', email: '', status: 'Active' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!currentUser?.companyId) return;

        const agentsQuery = query(
            collection(db, 'agents'),
            where('companyId', '==', currentUser.companyId),
            orderBy('name', 'asc')
        );

        const unsub = onSnapshot(agentsQuery, (snap) => {
            setAgents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (error) => {
            console.error(error);
            addToast('Error loading agents', 'error');
            setLoading(false);
        });

        return () => unsub();
    }, [currentUser]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                companyId: currentUser.companyId,
                updatedAt: serverTimestamp()
            };

            if (editingAgent) {
                await updateDoc(doc(db, 'agents', editingAgent.id), payload);
                addToast('Agent details updated', 'success');
            } else {
                await addDoc(collection(db, 'agents'), {
                    ...payload,
                    createdAt: serverTimestamp()
                });
                addToast('New agent added successfully', 'success');
            }
            closeModal();
        } catch (error) {
            console.error(error);
            addToast('Failed to save agent', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm('Delete Agent', 'Are you sure you want to delete this agent from the system?');
        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, 'agents', id));
            addToast('Agent deleted successfully', 'info');
        } catch (error) {
            console.error(error);
            addToast('Failed to delete agent', 'error');
        }
    };

    const openEdit = (agent) => {
        setEditingAgent(agent);
        setFormData({ name: agent.name, mobile: agent.mobile, email: agent.email, status: agent.status });
        setIsAddModalOpen(true);
    };

    const closeModal = () => {
        setIsAddModalOpen(false);
        setEditingAgent(null);
        setFormData({ name: '', mobile: '', email: '', status: 'Active' });
    };

    const filteredAgents = agents.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.mobile.includes(searchTerm)
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-[#6b7db3] font-bold uppercase tracking-widest text-sm text-center px-4">Loading Agents...</p>
        </div>
    );

    const AgentCard = ({ agent }) => (
        <div className="bg-[#111629] border border-[#1e2745] p-6 rounded-3xl hover:border-blue-500/50 transition-all group relative overflow-hidden flex flex-col h-full shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-all duration-500" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-[#0b0e1a] border border-[#1e2745] rounded-2xl flex items-center justify-center text-blue-500 font-bold text-xl group-hover:border-blue-500/40 transition-all font-bold">
                        <UserCheck className="w-7 h-7" />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => openEdit(agent)}
                            className="p-2 bg-[#0b0e1a] text-[#6b7db3] border border-[#1e2745] rounded-lg hover:border-blue-500 hover:text-white transition-all shadow-lg"
                        >
                            <Edit2 size={12} />
                        </button>
                        <button
                            onClick={() => handleDelete(agent.id)}
                            className="p-2 bg-[#0b0e1a] text-rose-500/70 border border-[#1e2745] rounded-lg hover:border-rose-500 hover:text-white transition-all shadow-lg"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white font-bold tracking-wider group-hover:text-blue-400 transition-colors uppercase truncate">
                    {agent.name}
                </h3>

                <div className="mt-8 space-y-4 pt-6 border-t border-[#1e2745] flex-1">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#0b0e1a] rounded-lg text-[#2a3660] group-hover:text-blue-500 transition-colors">
                            <Phone size={14} />
                        </div>
                        <span className="text-[10px] text-white font-bold tracking-wider">{agent.mobile || 'NO DATA'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#0b0e1a] rounded-lg text-[#2a3660] group-hover:text-blue-500 transition-colors">
                            <Mail size={14} />
                        </div>
                        <span className="text-[10px] text-[#6b7db3] font-bold uppercase tracking-wider truncate">{agent.email || 'agent@company.com'}</span>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <div className={`inline-flex items-center px-3 py-1 rounded-lg text-[8px]  uppercase tracking-[2px] border ${agent.status === 'Active'
                        ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20'
                        : 'bg-rose-500/5 text-rose-500 border-rose-500/20'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${agent.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        {agent.status}
                    </div>
                    <button
                        onClick={() => openEdit(agent)}
                        className="text-[9px] font-bold text-[#2a3660] hover:text-blue-500 uppercase tracking-widest transition-colors flex items-center gap-1"
                    >
                        EDIT <ArrowUpRight size={12} />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Page Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white font-bold tracking-widest uppercase flex items-center gap-3">
                        <UserCheck className="text-blue-500 w-8 h-8" />
                        Agent Management
                    </h1>
                    <p className="text-[#6b7db3] text-xs mt-1 uppercase tracking-[2px]">Manage external agents and partners</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                    <div className="relative group flex-1 sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7db3] group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH AGENT..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#111629] border border-[#1e2745] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-[#2a3660]"
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                        <Plus size={16} /> Add Agent
                    </button>
                </div>
            </div>

            {/* Partner Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAgents.map(agent => (
                    <AgentCard key={agent.id} agent={agent} />
                ))}
            </div>

            {filteredAgents.length === 0 && (
                <div className="col-span-full py-20 text-center bg-[#111629] border border-dashed border-[#1e2745] rounded-3xl">
                    <UserCheck size={48} className="mx-auto mb-4 text-[#2a3660]" />
                    <p className="text-[#6b7db3] font-bold uppercase tracking-[3px] text-xs">No agents found</p>
                </div>
            )}

            {/* Registration Portal (Modal) */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0b0e1a]/95 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-[#111629] border border-[#1e2745] w-full max-w-md rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.15)] animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-[#1e2745] flex justify-between items-center bg-[#0b0e1a]">
                            <div>
                                <h3 className="text-xl font-bold text-white font-bold uppercase tracking-widest">
                                    {editingAgent ? 'Edit Agent' : 'Add New Agent'}
                                </h3>
                                <p className="text-[10px] text-[#6b7db3] font-bold uppercase tracking-[2px] mt-1">Manage Agent Details</p>
                            </div>
                            <button onClick={closeModal} className="p-2 bg-[#1c243f] text-[#6b7db3] hover:text-white rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px]  text-[#2a3660] uppercase tracking-[2px] ml-1">Full Name</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#0b0e1a] border border-[#1e2745] text-white text-[12px] font-bold rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-[#2a3660]"
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px]  text-[#2a3660] uppercase tracking-[2px] ml-1">Mobile Number</label>
                                    <input
                                        required
                                        value={formData.mobile}
                                        onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                        className="w-full bg-[#0b0e1a] border border-[#1e2745] text-white text-[12px] font-bold rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-[#2a3660] font-bold"
                                        placeholder="Mobile"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px]  text-[#2a3660] uppercase tracking-[2px] ml-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full bg-[#0b0e1a] border border-[#1e2745] text-white text-[12px] font-bold rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px]  text-[#2a3660] uppercase tracking-[2px] ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-[#0b0e1a] border border-[#1e2745] text-white text-[12px] font-bold rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-[#2a3660]"
                                    placeholder="email@company.com"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-[10px]  uppercase tracking-[4px] rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : (editingAgent ? 'Update Agent' : 'Save Agent')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerAgents;
