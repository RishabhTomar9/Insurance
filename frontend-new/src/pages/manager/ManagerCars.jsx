import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useConfirmed } from '../../contexts/DialogContext';
import { Plus, Edit2, Trash2, Car, Search, Filter, ArrowUpRight } from 'lucide-react';
import AddCarForm from '../../components/employee/AddCarForm';
import EditCarForm from '../../components/employee/EditCarForm';

const ManagerCars = () => {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const { showConfirm } = useConfirmed();
    const [cars, setCars] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCar, setEditingCar] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!currentUser) return;

        const isManager = currentUser.role === 'manager' || currentUser.role === 'super-admin';
        const companyId = currentUser.companyId;

        if (!companyId) return;

        // Cars Listener
        const carsQuery = isManager
            ? query(collection(db, 'cars'), where('companyId', '==', companyId), orderBy('createdAt', 'desc'))
            : query(collection(db, 'cars'), where('companyId', '==', companyId), where('employeeId', '==', currentUser.uid), orderBy('createdAt', 'desc'));

        const unsubCars = onSnapshot(carsQuery, (snap) => {
            setCars(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        }, (error) => {
            console.error(error);
            addToast('Permission denied or error loading cars', 'error');
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
            unsubCars();
            unsubEmployees();
        };
    }, [currentUser]);

    const handleEdit = (car) => {
        setEditingCar(car);
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm(
            'Delete Vehicle',
            'Are you sure you want to remove this vehicle from the system? Associated policies might be affected.',
            'danger'
        );
        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, 'cars', id));
            addToast('Vehicle deleted successfully', 'info');
        } catch (error) {
            console.error(error);
            addToast('Failed to delete vehicle', 'error');
        }
    };

    const filteredCars = cars.filter(car =>
        car.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.make?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-[#6b7db3] font-bold uppercase tracking-widest text-sm text-center px-4">Loading Vehicle List...</p>
        </div>
    );

    const showForm = isAddModalOpen || editingCar;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Page Header */}
            {!showForm && (
                <>
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white font-bold tracking-widest uppercase flex items-center gap-3">
                                <Car className="text-purple-500 w-8 h-8" />
                                Vehicle List
                            </h1>
                            <p className="text-[#6b7db3] text-xs mt-1 uppercase tracking-[2px]">Manage all company vehicles</p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                            <div className="relative group flex-1 sm:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7db3] group-focus-within:text-purple-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="SEARCH VEHICLES..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#111629] border border-[#1e2745] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-[#2a3660]"
                                />
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="w-full sm:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                            >
                                <Plus size={16} /> Add Vehicle
                            </button>
                        </div>
                    </div>

                    {/* Fleet Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCars.map(car => (
                            <div key={car.id} className="bg-[#111629] border border-[#1e2745] rounded-3xl p-6 group hover:border-purple-500/50 transition-all relative overflow-hidden flex flex-col h-full">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-600/10 transition-all" />

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                            <span className="text-[9px]  text-purple-400 uppercase tracking-widest">
                                                {car.category || 'Private'}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(car)}
                                                className="p-2 bg-[#0b0e1a] text-[#6b7db3] border border-[#1e2745] rounded-lg hover:border-blue-500 hover:text-white transition-all"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(car.id)}
                                                className="p-2 bg-[#0b0e1a] text-rose-500/70 border border-[#1e2745] rounded-lg hover:border-rose-500 hover:text-white transition-all"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-white font-bold tracking-wider group-hover:text-purple-400 transition-colors uppercase truncate">
                                        {car.vehicleNumber}
                                    </h3>
                                    <p className="text-[10px] text-[#6b7db3] mt-1 font-bold uppercase tracking-[2px]">
                                        {car.make} {car.model}
                                    </p>

                                    <div className="mt-8 space-y-4 pt-6 border-t border-[#1e2745] flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-[#2a3660] font-bold uppercase tracking-widest">Capacity</span>
                                            <span className="text-xs text-white font-bold">{car.cc || 'N/A'} CC</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-[#2a3660] font-bold uppercase tracking-widest">Chassis No</span>
                                            <span className="text-[10px] text-white font-bold truncate max-w-[120px]" title={car.chassisNumber}>{car.chassisNumber}</span>
                                        </div>
                                        {car.agentDetails?.name && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] text-[#2a3660] font-bold uppercase tracking-widest">Assigned</span>
                                                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">{car.agentDetails.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleEdit(car)}
                                        className="mt-6 w-full py-3 bg-[#0b0e1a] border border-[#1e2745] rounded-xl text-[9px] font-bold text-[#6b7db3] uppercase tracking-[3px] group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        VIEW DETAILS <ArrowUpRight size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {filteredCars.length === 0 && (
                            <div className="col-span-full py-20 text-center bg-[#111629] border border-dashed border-[#1e2745] rounded-3xl">
                                <Car size={48} className="mx-auto mb-4 text-[#2a3660]" />
                                <p className="text-[#6b7db3] font-bold uppercase tracking-[3px] text-xs">No vehicles found</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Asset Forge (Forms) */}
            {showForm && (
                <div className="fixed inset-0 z-50 bg-[#0b0e1a] animate-in slide-in-from-bottom duration-500 overflow-y-auto custom-scrollbar">
                    <div className="min-h-screen p-4 md:p-10">
                        <div className="max-w-[1400px] mx-auto">
                            {isAddModalOpen && (
                                <AddCarForm
                                    onAdd={() => {
                                        setIsAddModalOpen(false);
                                        addToast('Vehicle added successfully', 'success');
                                    }}
                                    onClose={() => setIsAddModalOpen(false)}
                                    employees={employees}
                                    isManager={currentUser?.role === 'manager' || currentUser?.role === 'super-admin'}
                                />
                            )}

                            {editingCar && (
                                <EditCarForm
                                    car={editingCar}
                                    onUpdate={() => {
                                        setEditingCar(null);
                                        addToast('Vehicle details updated', 'success');
                                    }}
                                    onCancel={() => setEditingCar(null)}
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

export default ManagerCars;
