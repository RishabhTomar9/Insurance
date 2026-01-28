import React, { useState, useEffect } from 'react';
import { auth } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useConfirmed } from '../../contexts/DialogContext';
import { Plus, Edit2, Trash2, Car, Search, Filter } from 'lucide-react';
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

    const fetchCars = async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/cars`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setCars(data);
        } catch (error) {
            console.error('Error fetching cars');
            addToast('Failed to load vehicles', 'error');
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
        fetchCars();
        fetchEmployees();
    }, [currentUser]);

    const handleEdit = (car) => {
        setEditingCar(car);
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm(
            'Delete Vehicle Record',
            'Are you sure you want to remove this vehicle from the system? Associated policies might be affected.',
            'danger'
        );
        if (!confirmed) return;

        try {
            const token = await auth.currentUser.getIdToken();
            await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/cars/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchCars();
            addToast('Vehicle record deleted', 'info');
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
        <div className="flex items-center justify-center h-64 text-slate-500 animate-pulse">
            <Car size={32} className="mr-3" />
            <span className="text-lg font-medium">Loading fleet data...</span>
        </div>
    );

    const showForm = isAddModalOpen || editingCar;

    return (
        <div className="relative min-h-screen bg-slate-50">
            {/* List View */}
            {!showForm && (
                <div className="space-y-8 animate-fadeIn p-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">Vehicle Management</h1>
                            <p className="text-slate-500">Manage fleet, track assignments, and details.</p>
                        </div>
                        <div className="flex items-center space-x-4 mt-4 md:mt-0 w-full md:w-auto">
                            <div className="relative group w-full md:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search vehicles..."
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
                                <span>Add New Vehicle</span>
                            </button>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCars.map(car => (
                            <div key={car._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all duration-300 group relative overflow-hidden flex flex-col">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                    <Car size={100} className="text-indigo-900 transform rotate-12 translate-x-4 -translate-y-4" />
                                </div>

                                <div className="relative z-10 flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${car.category === 'Commercial' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {car.category || 'Private'}
                                        </span>
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => handleEdit(car)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Edit Details"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(car._id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Record"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-800 mb-1 truncate">{car.vehicleNumber}</h3>
                                    <p className="text-sm text-slate-500 mb-6">{car.make} {car.model}</p>

                                    <div className="space-y-3 pt-4 border-t border-slate-100">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Engine CC</span>
                                            <span className="font-mono text-slate-700 font-medium">{car.cc || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Chassis</span>
                                            <span className="font-mono text-slate-700 font-medium truncate max-w-[120px]" title={car.chassisNumber}>{car.chassisNumber}</span>
                                        </div>
                                        {car.agentDetails?.name && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Agent</span>
                                                <span className="font-medium text-slate-700">{car.agentDetails.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredCars.length === 0 && (
                            <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
                                <Car size={48} className="mx-auto mb-4 text-slate-300" />
                                <p className="text-lg">No vehicles found matching your search.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Form Flip View */}
            {showForm && (
                <div className="absolute inset-0 z-50 bg-white animate-flipUp min-h-screen overflow-y-auto">
                    {isAddModalOpen && (
                        <AddCarForm
                            onAdd={() => {
                                setIsAddModalOpen(false);
                                fetchCars();
                            }}
                            onClose={() => setIsAddModalOpen(false)}
                            employees={employees}
                            isManager={currentUser?.role === 'manager'}
                        />
                    )}

                    {editingCar && (
                        <EditCarForm
                            car={editingCar}
                            onUpdate={() => {
                                setEditingCar(null);
                                fetchCars();
                            }}
                            onCancel={() => setEditingCar(null)}
                            employees={employees}
                            isManager={currentUser?.role === 'manager'}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default ManagerCars;
