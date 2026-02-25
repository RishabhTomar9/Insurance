import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Edit2, Trash2, Search, Mail, Phone, ExternalLink, X, Loader2 } from 'lucide-react';
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
                addToast('Agent updated', 'success');
            } else {
                await addDoc(collection(db, 'agents'), {
                    ...payload,
                    createdAt: serverTimestamp()
                });
                addToast('Agent added', 'success');
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
        const confirmed = await showConfirm('Delete Agent', 'Remove this agent from master directory?');
        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, 'agents', id));
            addToast('Agent removed', 'info');
        } catch (error) {
            console.error(error);
            addToast('Failed to remove agent', 'error');
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

    if (loading) return <div>Loading Agents...</div>;

    const AgentCard = ({ agent }) => (
        <div className="bg-[#111629] border border-[#1e2745] p-6 rounded-2xl hover:border-[#3d7fff]/50 transition-all group relative">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <UserCheck className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex gap-2">
                    <button onClick={() => openEdit(agent)} className="p-2 text-[#6b7db3] hover:text-white transition-colors">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(agent.id)} className="p-2 text-[#6b7db3] hover:text-rose-500 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <h3 className="text-lg font-bold text-white font-['Rajdhani'] tracking-wide">{agent.name}</h3>
            <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#6b7db3]">
                    <Phone size={14} /> {agent.mobile}
                </div>
                <div className="flex items-center gap-2 text-[#6b7db3]">
                    <Mail size={14} /> {agent.email}
                </div>
            </div>

            <div className={`mt-6 inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${agent.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[#1e2745] text-[#6b7db3]'
                }`}>
                {agent.status}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white font-['Rajdhani'] tracking-wider uppercase">Agent Master</h1>
                    <p className="text-[#6b7db3] text-sm mt-1 uppercase tracking-[2px]">Phase 4 · External Channel Partners</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7db3]" />
                        <input
                            type="text"
                            placeholder="SEARCH AGENTS..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#111629] border border-[#1e2745] pl-10 pr-4 py-2 rounded-lg text-xs text-white uppercase tracking-widest outline-none focus:border-[#3d7fff]"
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all uppercase tracking-widest flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Agent
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAgents.map(agent => (
                    <AgentCard key={agent.id} agent={agent} />
                ))}
            </div>

            {filteredAgents.length === 0 && (
                <div className="text-center py-20 bg-[#111629] border border-[#1e2745] border-dashed rounded-3xl">
                    <UserCheck className="w-12 h-12 text-[#1e2745] mx-auto mb-4" />
                    <p className="text-[#6b7db3] uppercase tracking-widest text-xs">No agents found in master directory</p>
                </div>
            )}

            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111629] border border-[#1e2745] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-6 border-b border-[#1e2745] flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white font-['Rajdhani'] uppercase tracking-wider">
                                {editingAgent ? 'Edit Agent' : 'Add New Agent'}
                            </h3>
                            <button onClick={closeModal} className="text-[#6b7db3] hover:text-white"><X /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[#6b7db3] text-[10px] font-bold uppercase tracking-widest mb-2">Full Name</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#0a0f1e] border border-[#1e2745] p-3 rounded-xl text-white outline-none focus:border-blue-500 transition-all font-bold"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[#6b7db3] text-[10px] font-bold uppercase tracking-widest mb-2">Mobile</label>
                                    <input
                                        required
                                        value={formData.mobile}
                                        onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                        className="w-full bg-[#0a0f1e] border border-[#1e2745] p-3 rounded-xl text-white outline-none focus:border-blue-500 transition-all font-mono font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[#6b7db3] text-[10px] font-bold uppercase tracking-widest mb-2">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full bg-[#0a0f1e] border border-[#1e2745] p-3 rounded-xl text-white outline-none focus:border-blue-500 transition-all font-bold"
                                    >
                                        <option>Active</option>
                                        <option>Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[#6b7db3] text-[10px] font-bold uppercase tracking-widest mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-[#0a0f1e] border border-[#1e2745] p-3 rounded-xl text-white outline-none focus:border-blue-500 transition-all font-bold"
                                />
                            </div>
                            <button
                                disabled={submitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-2 mt-4"
                            >
                                {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : (editingAgent ? 'Update Agent' : 'Create Agent Profile')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerAgents;
