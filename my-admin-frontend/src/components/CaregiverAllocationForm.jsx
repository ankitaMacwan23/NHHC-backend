import React, { useState } from "react";
import axios from "axios";

const CaregiverAllocationForm = ({ patient, caregivers }) => {

  const [assignedCaregivers, setAssignedCaregivers] = useState([]);
  const [showCaregivers, setShowCaregivers] = useState(false);
  const [loadingCaregivers, setLoadingCaregivers] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    doctorId: "",
    nurseId: "",
    physioId: "",
    cleanerId: "",
    allocationDate: "",
    duty: "",
  });

  const fetchAssignedCaregivers = async () => {
    // If already shown, clicking the button again should hide it
    if (showCaregivers) {
      setShowCaregivers(false);
      return;
    }
  
    // Otherwise, fetch data and show
    setLoadingCaregivers(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/patient/assigned-caregivers`, {
        patientId: patient._id,
      });
  
      setAssignedCaregivers(res.data.caregivers || []);
      setShowCaregivers(true);
    } catch (err) {
      console.error("Error fetching assigned caregivers:", err);
      setAssignedCaregivers([]);
      setShowCaregivers(true); // still show the message even on failure
    } finally {
      setLoadingCaregivers(false);
    }
  };
   

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedCaregivers = [
      formData.doctorId,
      formData.nurseId,
      formData.physioId,
      formData.cleanerId,
    ].filter(Boolean);

    if (selectedCaregivers.length === 0) {
      setErrorMessage("Please assign at least one caregiver.");
      return;
    }

    const payload = {
      patientId: patient._id,
      patientName: patient.patientName,
      doctorId: formData.doctorId,
      nurseId: formData.nurseId,
      physioId: formData.physioId,
      cleanerId: formData.cleanerId,
      allocationDate: formData.allocationDate,
      duty: formData.duty,
    };

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/patient/assign-caregiver`, payload);

      if (res.status === 200) {
        alert("Caregivers assigned successfully!");
        setFormData({
          doctorId: "",
          nurseId: "",
          physioId: "",
          cleanerId: "",
          allocationDate: "",
          duty: "",
        });
        setErrorMessage("");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Error assigning caregivers:", err);
      const backendMsg = err.response?.data?.message || "Error assigning caregivers. Please try again.";
      setErrorMessage(backendMsg);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-6">
      <div className="mb-4">
      <button
  onClick={fetchAssignedCaregivers}
  type="button"
  className={`${
    showCaregivers ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
  } text-white font-medium px-4 py-2 rounded shadow transition duration-200`}
>
  {showCaregivers ? "Hide Assigned Caregivers" : "Show Assigned Caregivers"}
</button>


</div>
      {showCaregivers && (
  <div className="mt-6 bg-gray-50 border rounded p-4">
    <h3 className="text-lg font-semibold mb-4 text-gray-800">Assigned Caregivers</h3>

    {loadingCaregivers ? (
      <p className="text-gray-600">Loading caregivers...</p>
    ) : assignedCaregivers.length === 0 ? (
      <p className="text-gray-600">No caregivers assigned yet.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-blue-100 text-left text-gray-700 font-semibold">
            <tr>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Contact</th>
              <th className="border px-4 py-2">Duty</th>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {assignedCaregivers.map((cg, index) => (
              <tr key={index} className="bg-white hover:bg-gray-50">
                <td className="border px-4 py-2">{cg.caregiverName}</td>
                <td className="border px-4 py-2">{cg.caregiverContact}</td>
                <td className="border px-4 py-2">{cg.duty}</td>
                <td className="border px-4 py-2">
                  {new Date(cg.date).toLocaleDateString()}
                </td>
                <td className="border px-4 py-2 capitalize">{cg.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}

      

      <h2 className="text-2xl font-bold text-blue-700 mb-4">Allocate Caregivers</h2>

      {errorMessage && (
        <div className="bg-red-100 text-red-700 border border-red-300 p-3 rounded mb-4 text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Caregiver Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["Doctor", "Nurse", "Physio", "Cleaner"].map((role) => {
            const key = role.toLowerCase() + "Id";
            const list = caregivers[role.toLowerCase() + "s"];

            return (
              <div key={role}>
                <label className="block text-gray-700 font-medium mb-1">{role}</label>
                <select
                  name={key}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData[key]}
                  onChange={handleChange}
                >
                  <option value="">-- Select --</option>
                  {list?.map((cg) => (
                    <option key={cg._id} value={cg._id}>
                      {cg.name}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        {/* Date and Duty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Date</label>
            <input
              type="date"
              name="allocationDate"
              min={today}
              value={formData.allocationDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Duty</label>
            <select
              name="duty"
              value={formData.duty}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select --</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-right">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded shadow transition duration-200"
          >
            Assign Caregivers
          </button>
        </div>
      </form>
    </div>
  );
};

export default CaregiverAllocationForm;