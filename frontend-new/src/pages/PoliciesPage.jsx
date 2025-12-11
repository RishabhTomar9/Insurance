import React, { useState, useEffect } from 'react';

const PoliciesPage = () => {
  const [policies, setPolicies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [owners, setOwners] = useState([]);
  const [formData, setFormData] = useState({
    policyNumber: '',
    insurer: '',
    vehicle: '',
    owner: '',
    startDate: '',
    endDate: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
    fetchVehicles();
    fetchOwners();
  }, []);

  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/policies');
      const data = await res.json();
      setPolicies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching policies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/vehicles');
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/owners');
      const data = await res.json();
      setOwners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchPolicies();
        setFormData({ policyNumber: '', insurer: '', vehicle: '', owner: '', startDate: '', endDate: '' });
      } else {
        console.error('Failed to create policy');
      }
    } catch (error) {
      console.error('Error creating policy:', error);
    }
  };

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-2 px-4">Policy Number</th>
            <th className="py-2 px-4">Vehicle No</th>
            <th className="py-2 px-4">Owner</th>
            <th className="py-2 px-4">Insurer</th>
            <th className="py-2 px-4">Start Date</th>
            <th className="py-2 px-4">End Date</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {policies.map((policy) => (
            <tr key={policy._id} className="border-b hover:bg-gray-100">
              <td className="py-2 px-4">{policy.policyNumber}</td>
              <td className="py-2 px-4">{policy.vehicle?.vehicleNo}</td>
              <td className="py-2 px-4">{policy.owner?.name}</td>
              <td className="py-2 px-4">{policy.insurer}</td>
              <td className="py-2 px-4">{new Date(policy.startDate).toLocaleDateString()}</td>
              <td className="py-2 px-4">{new Date(policy.endDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Add New Policy</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="policyNumber" value={formData.policyNumber} onChange={handleInputChange} placeholder="Policy Number*" required className="p-2 border rounded"/>
          <input type="text" name="insurer" value={formData.insurer} onChange={handleInputChange} placeholder="Insurer" className="p-2 border rounded"/>
          <select name="vehicle" value={formData.vehicle} onChange={handleInputChange} required className="p-2 border rounded">
            <option value="">Select Vehicle*</option>
            {vehicles.map(v => <option key={v._id} value={v._id}>{v.vehicleNo} - {v.brand}</option>)}
          </select>
          <select name="owner" value={formData.owner} onChange={handleInputChange} required className="p-2 border rounded">
            <option value="">Select Owner*</option>
            {owners.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
          </select>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} placeholder="Start Date" className="p-2 border rounded"/>
          <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} placeholder="End Date" className="p-2 border rounded"/>
          <div className="col-span-full">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add Policy</button>
          </div>
        </form>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Existing Policies</h2>
        {isLoading ? <p>Loading policies...</p> : renderTable()}
      </div>
    </div>
  );
};

export default PoliciesPage;
