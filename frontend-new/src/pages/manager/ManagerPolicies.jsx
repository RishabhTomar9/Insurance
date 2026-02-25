import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useConfirmed } from '../../contexts/DialogContext';
import AddPolicyForm from '../../components/employee/AddPolicyForm';
import EditPolicyForm from '../../components/employee/EditPolicyForm';

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

        const isManager = currentUser.role === 'manager';

        // Policies Listener
        const policiesQuery = isManager
            ? query(collection(db, 'policies'), orderBy('createdAt', 'desc'))
            : query(collection(db, 'policies'), where('employeeId', '==', currentUser.uid), orderBy('createdAt', 'desc'));

        const unsubPolicies = onSnapshot(policiesQuery, (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPolicies(data);
            setLoading(false);
        });

        // Cars Listener
        const unsubCars = onSnapshot(collection(db, 'cars'), (snap) => {
            setCars(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Owners Listener
        const unsubOwners = onSnapshot(collection(db, 'owners'), (snap) => {
            setOwners(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Employees (Users) Listener - only for managers
        let unsubEmployees = () => { };
        if (isManager) {
            unsubEmployees = onSnapshot(collection(db, 'users'), (snap) => {
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
            'Void Policy',
            'Are you sure you want to void this insurance policy? This action is irreversible.',
            'warning'
        );
        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, 'policies', id));
            addToast('Policy voided successfully', 'info');
        } catch (error) {
            console.error(error);
            addToast('Failed to void policy', 'error');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Connecting to real-time sync...</div>;


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Policy Management</h1>
                <button
                    onClick={() => {
                        setEditingPolicy(null);
                        setIsAddModalOpen(true);
                    }}
                    className="flex items-center space-x-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-lg shadow-emerald-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    <span>Issue New Policy</span>
                </button>
            </div>

            <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Policy # / Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vehicle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Coverage</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Premium</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {policies.map(policy => (
                            <tr key={policy.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-indigo-900">{policy.policyNumber || 'Running Quotation'}</div>
                                    <div className="text-xs font-medium text-slate-600">{policy.policyType}</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">{policy.policyDuration} starting {new Date(policy.startDate || policy.policyStartDate || Date.now()).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                    {ownersMap.get(policy.ownerId)?.name || 'Unknown Client'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded">
                                        {carsMap.get(policy.carId)?.vehicleNumber || 'Unknown Vehicle'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 max-w-xs truncate">
                                    {policy.insuranceCompany || 'Pending Issue'} - {policy.finalInsuredAmount ? `IDV: ₹${policy.finalInsuredAmount}` : 'No IDV'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">₹{policy.finalPremium || policy.premiumAmount || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-3">
                                        <button onClick={() => handleEdit(policy)} className="text-indigo-600 hover:text-indigo-900 font-semibold transition-colors">Edit</button>
                                        <button onClick={() => handleDelete(policy.id)} className="text-red-500 hover:text-red-700">Void</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals using the new detailed forms */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl overflow-hidden h-[90vh] my-4">
                        <AddPolicyForm
                            cars={cars}
                            owners={owners}
                            employees={employees}
                            isManager={true}
                            onAdd={() => {
                                setIsAddModalOpen(false);
                                addToast('Policy successfully created', 'success');
                            }}
                            onClose={() => setIsAddModalOpen(false)}
                        />
                    </div>
                </div>
            )}

            {editingPolicy && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl overflow-hidden h-[90vh] my-4">
                        <EditPolicyForm
                            policy={editingPolicy}
                            cars={cars}
                            owners={owners}
                            employees={employees}
                            isManager={true}
                            onUpdate={() => {
                                setEditingPolicy(null);
                                addToast('Policy successfully updated', 'success');
                            }}
                            onCancel={() => setEditingPolicy(null)}
                        />
                    </div>
                </div>
            )}

        </div>
    );
};

export default ManagerPolicies;
