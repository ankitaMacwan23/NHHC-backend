import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CareGivers = () => {
  const [pendingCaregivers, setPendingCaregivers] = useState([]);
  const [approvedGrouped, setApprovedGrouped] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null); // For showing list on card click

  const fetchCaregivers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/caregivers`);
      setPendingCaregivers(response.data.pendingCaregivers);
      setApprovedGrouped(response.data.approvedGrouped);
    } catch (error) {
      console.error('Error fetching caregivers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaregivers();
  }, []);

  const handleAddToFavourite = async (id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/caregiver/add-to-favourite`, {
        caregiverId: id,
      });
      alert('Added to favourites!');
      fetchCaregivers(); // refresh the list
    } catch (error) {
      console.error('Failed to add to favourites:', error);
      alert('Something went wrong');
    }
  };
  

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/caregiver/update-caregiver`, {
        caregiverId: id,
        status: status
      });
      fetchCaregivers();
    } catch (error) {
      console.error(`Failed to update status to ${status}:`, error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-blue-700 text-center">Caregiver Management</h2>
      <p className="text-center text-green-700 font-semibold bg-green-100 py-2 px-4 rounded-lg shadow-md">
        Your Active Team Members
      </p>


      {/* Role cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {approvedGrouped.map((group) => (
          <div
            key={group._id}
            onClick={() => setSelectedRole(group._id)}
            className="cursor-pointer bg-blue-100 hover:bg-blue-200 p-4 rounded-xl shadow text-center"
          >
            <h3 className="text-xl font-bold text-blue-800">{group._id}</h3>
            <p className="text-lg text-gray-700">{group.count} Active</p>
          </div>
        ))}
      </div>

      {/* Selected role caregiver list */}
      {selectedRole && (
        <div className="mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold text-blue-600">{selectedRole}s</h3>
            <button
              className="text-red-500 hover:underline"
              onClick={() => setSelectedRole(null)}
            >
              Close
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow">
            <thead>
              <tr className="bg-blue-100 text-left text-sm font-semibold text-blue-700">
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Gender</th>
                <th className="py-2 px-4 border-b">DOB</th>
                <th className="py-2 px-4 border-b">Contact</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Address</th>
                <th className="py-2 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvedGrouped
                .find((g) => g._id === selectedRole)
                ?.caregivers.map((caregiver, index) => (
                  <tr key={caregiver._id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="py-2 px-4 border-b">{caregiver.name}</td>
                    <td className="py-2 px-4 border-b">{caregiver.gender}</td>
                    <td className="py-2 px-4 border-b">{new Date(caregiver.dob).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b">{caregiver.contact}</td>
                    <td className="py-2 px-4 border-b">{caregiver.email}</td>
                    <td className="py-2 px-4 border-b">{caregiver.address}</td>
                    <td className="py-2 px-4 border-b text-center space-x-2">
                      <button
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => handleAddToFavourite(caregiver._id)}
                      >
                        Favourite
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => handleUpdateStatus(caregiver._id, "Rejected")}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
</div>

        </div>
      )}

      {/* Pending caregivers section */}
      <div className="mt-10">
        <h3 className="text-2xl font-semibold text-green-600">Register Caregivers (waiting for your approval)</h3>
        {loading ? (
          <p className="text-center mt-4">Loading caregivers...</p>
        ) : pendingCaregivers.length === 0 ? (
          <p className="text-center mt-4 text-gray-500">No pending caregivers found who registered.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingCaregivers.map((caregiver) => (
              <div key={caregiver._id} className="border rounded-xl shadow p-4 bg-white">
                <h3 className="text-lg font-semibold text-blue-600">{caregiver.name}</h3>
                <p className="text-sm text-gray-700">Role: {caregiver.role}</p>
                <p className="text-sm text-gray-700">Gender: {caregiver.gender}</p>
                <p className="text-sm text-gray-700">DOB: {new Date(caregiver.dob).toLocaleDateString()}</p>
                <p className="text-sm text-gray-700">Contact: {caregiver.contact}</p>
                <p className="text-sm text-gray-700">Email: {caregiver.email}</p>
                <p className="text-sm text-gray-700">Address: {caregiver.address}</p>
                <p className="text-sm text-gray-700 mt-2 font-medium">Status: {caregiver.status}</p>
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => handleUpdateStatus(caregiver._id, "Approved")}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(caregiver._id, "Rejected")}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CareGivers;
