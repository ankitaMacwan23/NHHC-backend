import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Patients = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/patients`);
      setPatients(res.data.patients);
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPatients();
  }, []);
  
  const handleRejectPatient = async (id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/patient/reject-patient/${id}`);
      // You can re-fetch the patient list here if needed
      alert("Patient rejected successfully");

      // Refetch the updated patient list
      fetchPatients();
    } catch (error) {
      console.error("Failed to reject patient:", error);
      alert("Error rejecting patient");
    }
  };
  

  const renderButtons = (patient) => {
    const { status, _id } = patient;
    const buttons = [];

    if (status === 'Pending') {
      buttons.push(
        <button
          key="reject"
          className="bg-red-500 text-white px-3 py-1 rounded mr-2 hover:bg-red-600"
          onClick={() => {
            if (window.confirm("Are you sure you want to reject this patient?")) {
              handleRejectPatient(_id);
            }
          }}
        >
          Reject
        </button>,
        <button
          key="allot"
          className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
          onClick={() => navigate(`/patient/details`, { state: { patientId: _id, patientData: patient } })}
        >
          Allot Caregiver
        </button>,
        <button
        key="payment"
        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        onClick={() => navigate(`/patient/payment`, { state: { patientId: _id, patientData: patient } })}
      >
        Payment
      </button>      
      );
    }

    if (status === 'Approved') {
      buttons.push(
        <button
          key="allot"
          className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
          onClick={() => navigate(`/patient/details`, { state: { patientId: _id, patientData: patient } })}
        >
          Allot Caregiver
        </button>,
        <button
        key="payment"
        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        onClick={() => navigate(`/patient/payment`, { state: { patientId: _id, patientData: patient } })}
      >
        Payment
      </button>
      );
    }

    if (status === 'PaymentDone') {
      buttons.push(
        <p key="done" className="text-green-600 font-semibold mt-2">
          Service Completed
        </p>
      );
    }

    return <div className="mt-3">{buttons}</div>;
  };

  return (
    <div className="p-4 sm:p-8">
      <h2 className="text-2xl font-bold text-blue-700 text-center mb-4">Patients List</h2>
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <div
              key={patient._id}
              className="bg-white rounded-xl shadow-md p-4 border hover:shadow-lg transition-all"
            >
              <h3 className="text-lg font-semibold text-blue-800">{patient.patientName}</h3>
              <p className="text-sm text-gray-600">Age: {patient.patientAge}</p>
              <p className="text-sm text-gray-600">Gender: {patient.patientGender}</p>
              <p className="text-sm text-gray-600">Contact: {patient.patientContact}</p>
              <p className="text-sm text-gray-600">Email: {patient.patientEmail}</p>
              <p className="text-sm text-gray-600">Address: {patient.patientAddress}</p>
              <p className="text-sm font-semibold text-purple-600 mt-2">Status: {patient.status}</p>

              {renderButtons(patient)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Patients;
