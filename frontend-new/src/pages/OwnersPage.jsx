import React, { useState, useEffect } from 'react';

const OwnersPage = () => {
  const [owners, setOwners] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/owners');
      const data = await res.json();
      setOwners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching owners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/owners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchOwners();
        setFormData({ name: '', email: '', mobile: '', address: '' });
      } else {
        console.error('Failed to create owner');
      }
    } catch (error) {
      console.error('Error creating owner:', error);
    }
  };

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-2 px-4">Name</th>
            <th className="py-2 px-4">Email</th>
            <th className="py-2 px-4">Mobile</th>
            <th className="py-2 px-4">Address</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {owners.map((owner) => (
            <tr key={owner._id} className="border-b hover:bg-gray-100">
              <td className="py-2 px-4">{owner.name}</td>
              <td className="py-2 px-4">{owner.email}</td>
              <td className="py-2 px-4">{owner.mobile}</td>
              <td className="py-2 px-4">{owner.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Add New Owner</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Name*" required className="p-2 border rounded"/>
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="p-2 border rounded"/>
          <input type="text" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="Mobile" className="p-2 border rounded"/>
          <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" className="p-2 border rounded"/>
          <div className="col-span-full">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add Owner</button>
          </div>
        </form>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Existing Owners</h2>
        {isLoading ? <p>Loading owners...</p> : renderTable()}
      </div>
    </div>
  );
};

export default OwnersPage;
