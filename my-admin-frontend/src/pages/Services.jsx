import React, { useState } from 'react';

const Service = () => {
    const [serviceName, setServiceName] = useState('');
    const [serviceImage, setServiceImage] = useState('');
    const [serviceDesc, setServiceDesc] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Physio');
    const [status, setStatus] = useState('active');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [services, setServices] = useState([]);
    const [showTable, setShowTable] = useState(false);

    const handleDelete = async (id) => {
      const confirmDelete = window.confirm("Are you sure you want to delete this service?");
      if (!confirmDelete) return;
    
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/services/delete-service`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }), // pass the id in body
        });
    
        const result = await response.json();
    
        if (result.success) {
          setServices((prev) => prev.filter((s) => s._id !== id));
          setSuccessMessage('Service deleted successfully.');
        } else {
          setErrorMessage(result.message || 'Failed to delete service.');
        }
      } catch (error) {
        console.error('Error deleting service:', error);
        setErrorMessage('Something went wrong while deleting the service.');
      }
    };    

    const handleFetchServices = async () => {
      if (!showTable) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/services/service-list`);
          const data = await response.json();
          if (data.success) {
            setServices(data.services);
            setShowTable(true);
          } else {
            setErrorMessage('Failed to fetch services');
          }
        } catch (error) {
          console.error('Error fetching services:', error);
          setErrorMessage('Something went wrong while fetching services.');
        }
      } else {
        setShowTable(false);
        setServices([]); // 👈 Optional: clears table data when hiding
      }
    };
    
    
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Reset success and error messages
        setSuccessMessage('');
        setErrorMessage('');

        const formData = new FormData();
          formData.append('service_name', serviceName);
          formData.append('service_image', serviceImage); // ✅ raw file
          formData.append('service_desc', serviceDesc);
          formData.append('price', price);
          formData.append('category', category);
          formData.append('status', status);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/services/add-service`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setSuccessMessage('Service added successfully!');
                // Optionally clear the form fields
                setServiceName('');
                setServiceImage('');
                setServiceDesc('');
                setPrice('');
                setCategory('');
                setStatus('active');
            } else {
                setErrorMessage(data.message || 'An error occurred');
            }
        } catch (error) {
            console.error('Error adding service:', error);
            setErrorMessage('There was an error processing your request.');
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8">

        <button
          onClick={handleFetchServices}
          type="button"
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {showTable ? 'Hide Services' : 'Show All Services'}
        </button>

        {showTable && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Service List</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Image</th>
                  <th className="border p-2">Description</th>
                  <th className="border p-2">Price</th>
                  <th className="border p-2">Category</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Actions</th> {/* New column */}
                </tr>
              </thead>
              <tbody>
                {services.map((service, idx) => (
                  <tr key={idx} className="text-sm">
                    <td className="border p-2">{service.service_name}</td>
                    <td className="border p-2">
                      <img
                        src={`http://localhost:3000${service.service_image}`}
                        alt="service"
                        className="w-16 h-16 object-cover"
                      />
                    </td>
                    <td className="border p-2">{service.service_desc}</td>
                    <td className="border p-2">₹{service.price}</td>
                    <td className="border p-2">{service.category}</td>
                    <td className="border p-2">{service.status}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => handleDelete(service._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


            <h1 className="text-3xl font-bold text-center text-green-800 mb-6">Add New Service</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {errorMessage && <div className="text-red-500">{errorMessage}</div>}
                {successMessage && <div className="text-green-500">{successMessage}</div>}

                <div>
                    <label htmlFor="service_name" className="block text-sm font-medium text-gray-700">Service Name:</label>
                    <input
                        type="text"
                        id="service_name"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        required
                        className="mt-2 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="service_image" className="block text-sm font-medium text-gray-700">Service Image (Upload File):</label>
                    <input
                        type="file"
                        id="service_image"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setServiceImage(file);
                            setImagePreview(URL.createObjectURL(file)); // For preview only
                          }
                        }}
                        required
                        className="mt-2 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  {imagePreview  && (
                  <div className="mt-2">
                      <img src={imagePreview } alt="Preview" className="max-w-xs rounded-md" />
                  </div>
                    )}
                </div>


                <div>
                    <label htmlFor="service_desc" className="block text-sm font-medium text-gray-700">Service Description:</label>
                    <textarea
                        id="service_desc"
                        value={serviceDesc}
                        onChange={(e) => setServiceDesc(e.target.value)}
                        required
                        className="mt-2 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    ></textarea>
                </div>

                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price:</label>
                    <input
                        type="number"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        className="mt-2 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category:</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="mt-2 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="Physio">Physio</option>
                        <option value="Nursing">Nursing</option>
                        <option value="Lab">Lab</option>
                        <option value="Latest">Latest</option>
                        <option value="General">General</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status:</label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="mt-2 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    Add Service
                </button>
            </form>
        </div>
    );
};

export default Service;
