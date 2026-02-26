import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useConfirmed } from '../../contexts/DialogContext';
import AddPolicyForm from '../../components/employee/AddPolicyForm';
import EditPolicyForm from '../../components/employee/EditPolicyForm';
import { Plus, ShieldCheck, Search, Filter, Trash2, Edit } from 'lucide-react';

const ManagerPolicies = () => {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const { showConfirm } = useConfirmed();
    const [policies, setPolicies] = useState([]);
    const [cars, setCars] = useState([]);
    const [owners, setOwners] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    // Maps for fast lookup (population)
    const carsMap = React.useMemo(() => new Map(cars.map(c => [c.id, c])), [cars]);
    const ownersMap = React.useMemo(() => new Map(owners.map(o => [o.id, o])), [owners]);

    // UI State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState(null);

    useEffect(() => {
        if (!currentUser) return;

        const isManager = currentUser.role === 'manager' || currentUser.role === 'super-admin';
        const companyId = currentUser.companyId;

        if (!companyId) return;

        // Policies Listener
        const policiesQuery = isManager
            ? query(collection(db, 'policies'), where('companyId', '==', companyId), orderBy('createdAt', 'desc'))
            : query(collection(db, 'policies'), where('companyId', '==', companyId), where('employeeId', '==', currentUser.uid), orderBy('createdAt', 'desc'));

        const unsubPolicies = onSnapshot(policiesQuery, (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPolicies(data);
            setLoading(false);
        }, (error) => {
            console.error(error);
            addToast('Error loading policies', 'error');
            setLoading(false);
        });

        // Cars Listener
        const unsubCars = onSnapshot(query(collection(db, 'cars'), where('companyId', '==', companyId)), (snap) => {
            setCars(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Owners Listener
        const unsubOwners = onSnapshot(query(collection(db, 'owners'), where('companyId', '==', companyId)), (snap) => {
            setOwners(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Employees (Users) Listener - only for managers/admins
        let unsubEmployees = () => { };
        if (isManager) {
            unsubEmployees = onSnapshot(query(collection(db, 'users'), where('companyId', '==', companyId)), (snap) => {
                setEmployees(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            });
        }

        return () => {
            unsubPolicies();
            unsubCars();
            unsubOwners();
            unsubEmployees();
        };
    }, [currentUser]);

    const handleEdit = (policy) => {
        setEditingPolicy(policy);
        setIsAddModalOpen(false);
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm(
            'Delete Policy',
            'Are you sure you want to delete this insurance policy? This action cannot be undone.',
            'warning'
        );
        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, 'policies', id));
            addToast('Policy deleted successfully', 'info');
        } catch (error) {
            console.error(error);
            addToast('Failed to delete policy', 'error');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-[#6b7db3] font-bold uppercase tracking-widest text-sm text-center px-4">Loading Policies...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white font-bold tracking-widest uppercase flex items-center gap-3">
                        <ShieldCheck className="text-blue-500 w-8 h-8" />
                        Insurance Policies
                    </h1>
                    <p className="text-[#6b7db3] text-xs mt-1 uppercase tracking-[2px]">Manage all company insurance policies</p>
                </div>
                <button
                    onClick={() => {
                        setEditingPolicy(null);
                        setIsAddModalOpen(true);
                    }}
                    className="group relative flex items-center justify-center space-x-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <Plus className="w-5 h-5 relative z-10" />
                    <span className="text-[10px] font-bold uppercase tracking-widest relative z-10">Add Policy</span>
                </button>
            </div>

            {/* Main Registry */}
            <div className="bg-[#111629] border border-[#1e2745] rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-[#0b0e1a] border-b border-[#1e2745]">
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-[#6b7db3] uppercase tracking-[3px]">Policy Number</th>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-[#6b7db3] uppercase tracking-[3px]">Owner & Vehicle</th>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-[#6b7db3] uppercase tracking-[3px]">Insurer</th>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-[#6b7db3] uppercase tracking-[3px]">Amount</th>
                                <th className="px-6 py-5 text-center text-[10px] font-bold text-[#6b7db3] uppercase tracking-[3px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e2745]">
                            {policies.map(policy => (
                                <tr key={policy.id} className="hover:bg-[#1c243f]/30 transition-all group">
                                    <td className="px-6 py-6">
                                        <div className="text-sm font-bold text-white group-hover:text-blue-500 transition-colors uppercase tracking-wider">{policy.policyNumber || 'QUO-INTERNAL'}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-bold py-0.5 px-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded uppercase tracking-widest">{policy.policyType}</span>
                                            <span className="text-[10px] text-[#2a3660] font-bold uppercase">{policy.policyDuration}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="text-xs font-bold text-indigo-100 uppercase tracking-widest">{ownersMap.get(policy.ownerId)?.name || 'N/A'}</div>
                                        <div className="text-[10px] text-[#6b7db3] mt-1 font-bold">{carsMap.get(policy.carId)?.vehicleNumber || 'PENDING ASSIGNMENT'}</div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="text-xs text-white font-bold">{policy.insuranceCompany || 'N/A'}</div>
                                        <div className="text-[9px] text-emerald-500 mt-1 uppercase font-bold tracking-widest">{policy.finalInsuredAmount ? `Value: ₹${policy.finalInsuredAmount}` : 'No Valuation'}</div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="text-sm  text-white group-hover:text-emerald-500 transition-colors">₹{policy.finalPremium || policy.premiumAmount || 0}</div>
                                        <div className="text-[9px] text-[#2a3660] font-bold uppercase tracking-widest">Premium Paid</div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => handleEdit(policy)}
                                                className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-lg hover:shadow-blue-500/20"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(policy.id)}
                                                className="p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-lg hover:shadow-rose-500/20"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {policies.length === 0 && (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-[#0b0e1a] border border-[#1e2745] rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-8 h-8 text-[#2a3660]" />
                            </div>
                            <p className="text-[#6b7db3] font-bold uppercase tracking-[3px] text-xs">No policies found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Responsive Modals */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-6 lg:p-10 bg-[#0b0e1a]/95 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
                    <div className="bg-[#111629] border border-[#1e2745] w-full h-full md:h-auto md:max-h-[95vh] md:max-w-6xl md:rounded-[40px] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(61,127,255,0.1)]">
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                            <AddPolicyForm
                                cars={cars}
                                owners={owners}
                                employees={employees}
                                isManager={true}
                                onAdd={() => {
                                    setIsAddModalOpen(false);
                                    addToast('New policy added successfully', 'success');
                                }}
                                onClose={() => setIsAddModalOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {editingPolicy && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-6 lg:p-10 bg-[#0b0e1a]/95 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
                    <div className="bg-[#111629] border border-[#1e2745] w-full h-full md:h-auto md:max-h-[95vh] md:max-w-6xl md:rounded-[40px] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(61,127,255,0.1)]">
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                            <EditPolicyForm
                                policy={editingPolicy}
                                cars={cars}
                                owners={owners}
                                employees={employees}
                                isManager={true}
                                onUpdate={() => {
                                    setEditingPolicy(null);
                                    addToast('Policy details updated', 'success');
                                }}
                                onCancel={() => setEditingPolicy(null)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerPolicies;
