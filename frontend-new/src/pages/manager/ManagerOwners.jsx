import React, { useState, useEffect } from 'react';
import { auth } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useConfirmed } from '../../contexts/DialogContext';
import { Plus, Edit2, Trash2, Users, Search, Mail, Phone, MapPin, CreditCard, FileText } from 'lucide-react';
import AddOwnerForm from '../../components/employee/AddOwnerForm';
import EditOwnerForm from '../../components/employee/EditOwnerForm';

const OwnerList = () => {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const { showConfirm } = useConfirmed();
    const [owners, setOwners] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingOwner, setEditingOwner] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOwners = async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/owners`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setOwners(data);
        } catch (error) {
            console.error('Error fetching owners:', error);
            addToast('Failed to load owners', 'error');
        }
        setLoading(false);
    };

    const fetchEmployees = async () => {
        if (currentUser?.role === 'manager') {
            try {
                const token = await auth.currentUser.getIdToken();
                const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                setEmployees(data);
            } catch (error) {
                console.error('Error fetching employees');
            }
        }
    };

    useEffect(() => {
        fetchOwners();
        fetchEmployees();
    }, [currentUser]);

    const handleEdit = (owner) => {
        setEditingOwner(owner);
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm(
            'Delete Owner Record',
            'Are you sure you want to permanently delete this owner? This action cannot be undone.',
            'danger'
        );
        if (!confirmed) return;

        try {
            const token = await auth.currentUser.getIdToken();
            await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/owners/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchOwners();
            addToast('Owner record deleted', 'info');
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
        <div className="flex items-center justify-center h-64 text-slate-500 animate-pulse">
            <Users size={32} className="mr-3" />
            <span className="text-lg font-medium">Loading client database...</span>
        </div>
    );

    const showForm = isAddModalOpen || editingOwner;

    return (
        <div className="relative min-h-screen bg-slate-50">
            {/* List View */}
            {!showForm && (
                <div className="space-y-8 animate-fadeIn p-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">Owner Management</h1>
                            <p className="text-slate-500">Manage client details and documentation.</p>
                        </div>
                        <div className="flex items-center space-x-4 mt-4 md:mt-0 w-full md:w-auto">
                            <div className="relative group w-full md:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search owners..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                                />
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-95 whitespace-nowrap font-medium"
                            >
                                <Plus size={20} />
                                <span>Add New Owner</span>
                            </button>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOwners.map(owner => (
                            <div key={owner._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all duration-300 group relative overflow-hidden flex flex-col">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                    <Users size={100} className="text-indigo-900 transform rotate-12 translate-x-4 -translate-y-4" />
                                </div>

                                <div className="relative z-10 flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl shadow-inner">
                                            {owner.name ? owner.name[0].toUpperCase() : 'U'}
                                        </div>
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => handleEdit(owner)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Edit Details"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(owner._id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Record"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-800 mb-1 truncate">{owner.name}</h3>

                                    <div className="space-y-3 pt-4 border-t border-slate-100 text-sm">
                                        <div className="flex items-center text-slate-600">
                                            <Phone size={16} className="text-slate-400 mr-3 flex-shrink-0" />
                                            <span className="truncate">{owner.phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center text-slate-600">
                                            <Mail size={16} className="text-slate-400 mr-3 flex-shrink-0" />
                                            <span className="truncate">{owner.email || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-start text-slate-600">
                                            <MapPin size={16} className="text-slate-400 mr-3 mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{owner.address || 'N/A'}</span>
                                        </div>
                                        {owner.aadharCard && (
                                            <div className="flex items-center text-slate-500 bg-slate-50 px-3 py-2 rounded-lg mt-3">
                                                <CreditCard size={14} className="mr-2 text-slate-400" />
                                                <span className="font-mono text-xs tracking-wide">ID: {owner.aadharCard}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredOwners.length === 0 && (
                            <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
                                <Users size={48} className="mx-auto mb-4 text-slate-300" />
                                <p className="text-lg">No owners found matching your search.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Form Flip View */}
            {showForm && (
                <div className="absolute inset-0 z-50 bg-white animate-flipUp min-h-screen overflow-y-auto">
                    {isAddModalOpen && (
                        <AddOwnerForm
                            onAdd={() => {
                                setIsAddModalOpen(false);
                                fetchOwners();
                            }}
                            onCancel={() => setIsAddModalOpen(false)}
                            employees={employees}
                            isManager={currentUser?.role === 'manager'}
                        />
                    )}

                    {editingOwner && (
                        <EditOwnerForm
                            owner={editingOwner}
                            onUpdate={() => {
                                setEditingOwner(null);
                                fetchOwners();
                            }}
                            onCancel={() => setEditingOwner(null)}
                            employees={employees}
                            isManager={currentUser?.role === 'manager'}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default OwnerList;
