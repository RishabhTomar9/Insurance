import React, { useState, useEffect } from 'react';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    vehicleNo: '',
    chassisNo: '',
    engineNo: '',
    brand: '',
    product: '',
    yearOfManufacture: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/vehicles');
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
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
      const res = await fetch('http://localhost:5000/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchVehicles(); // Refetch to display the new vehicle
        setFormData({ vehicleNo: '', chassisNo: '', engineNo: '', brand: '', product: '', yearOfManufacture: '' });
      } else {
        console.error('Failed to create vehicle');
      }
    } catch (error) {
      console.error('Error creating vehicle:', error);
    }
  };

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-2 px-4">Vehicle No</th>
            <th className="py-2 px-4">Brand</th>
            <th className="py-2 px-4">Product</th>
            <th className="py-2 px-4">Chassis No</th>
            <th className="py-2 px-4">Year</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {vehicles.map((vehicle) => (
            <tr key={vehicle._id} className="border-b hover:bg-gray-100">
              <td className="py-2 px-4">{vehicle.vehicleNo}</td>
              <td className="py-2 px-4">{vehicle.brand}</td>
              <td className="py-2 px-4">{vehicle.product}</td>
              <td className="py-2 px-4">{vehicle.chassisNo}</td>
              <td className="py-2 px-4">{vehicle.yearOfManufacture}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Add New Vehicle</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input type="text" name="vehicleNo" value={formData.vehicleNo} onChange={handleInputChange} placeholder="Vehicle Number*" required className="p-2 border rounded"/>
          <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="Brand" className="p-2 border rounded"/>
          <input type="text" name="product" value={formData.product} onChange={handleInputChange} placeholder="Product" className="p-2 border rounded"/>
          <input type="text" name="chassisNo" value={formData.chassisNo} onChange={handleInputChange} placeholder="Chassis Number" className="p-2 border rounded"/>
          <input type="number" name="yearOfManufacture" value={formData.yearOfManufacture} onChange={handleInputChange} placeholder="Year of Manufacture" className="p-2 border rounded"/>
          <input type="text" name="engineNo" value={formData.engineNo} onChange={handleInputChange} placeholder="Engine Number" className="p-2 border rounded"/>
          <div className="col-span-full">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add Vehicle</button>
          </div>
        </form>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Existing Vehicles</h2>
        {isLoading ? <p>Loading vehicles...</p> : renderTable()}
      </div>
    </div>
  );
};

export default VehiclesPage;
