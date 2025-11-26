import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CaregiverAllocationForm from './CaregiverAllocationForm';
import { useLocation } from 'react-router-dom';

const PatientDetails = () => {
  const location = useLocation();
  const { patientId, patientData } = location.state;

 const [patient, setPatient] = useState(patientData || null);
  const [caregivers, setCaregivers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .post(`${import.meta.env.VITE_API_BASE_URL}/patient/detail-patient`)
      .then((res) => {
        setCaregivers(res.data.caregivers);
      })
      .catch((err) => console.error("Error fetching patient details:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-blue-600 text-lg font-medium animate-pulse">Loading patient details...</p>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-blue-50 to-gray-100">
      {/* Sidebar with Patient Info */}
      <div className="w-80 bg-white shadow-lg p-6 sticky top-0 h-screen overflow-y-auto border-r border-blue-100">
        <h3 className="text-xl font-bold text-blue-700 mb-4 border-b border-blue-300 pb-2">👤 Patient Info</h3>
        <ul className="space-y-4 text-sm text-gray-800">
          <li className="bg-gray-50 p-2 rounded">
            <span className="font-semibold text-blue-600">Name:</span><br />
            {patient.patientName}
          </li>
          <li className="bg-gray-50 p-2 rounded">
            <span className="font-semibold text-blue-600">Age:</span><br />
            {patient.patientAge}
          </li>
          <li className="bg-gray-50 p-2 rounded">
            <span className="font-semibold text-blue-600">Gender:</span><br />
            {patient.patientGender}
          </li>
          <li className="bg-gray-50 p-2 rounded">
            <span className="font-semibold text-blue-600">Contact:</span><br />
            {patient.patientContact}
          </li>
          <li className="bg-gray-50 p-2 rounded">
            <span className="font-semibold text-blue-600">Email:</span><br />
            {patient.patientEmail}
          </li>
          <li className="bg-gray-50 p-2 rounded">
            <span className="font-semibold text-blue-600">Address:</span><br />
            {patient.patientAddress}
          </li>
          <li className="bg-gray-50 p-2 rounded">
            <span className="font-semibold text-blue-600">Status:</span><br />
            <span
              className={`inline-block px-2 py-1 rounded text-white text-xs transition duration-200 ${
                patient.status === 'Approved'
                  ? 'bg-green-500 hover:bg-green-600'
                  : patient.status === 'Pending'
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-gray-500 hover:bg-gray-600'
              }`}
            >
              {patient.status}
            </span>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        <div className="max-w-4xl mx-auto">
          {/* Banner */}


          {/* Caregiver Form Section */}
          <div className="bg-white shadow-xl rounded-2xl p-6 border border-blue-100">
            <CaregiverAllocationForm patient={patient} caregivers={caregivers} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
