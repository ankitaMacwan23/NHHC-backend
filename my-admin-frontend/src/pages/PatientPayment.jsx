import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const PatientPayment = () => {
  const location = useLocation();
  const { patientId, patientData } = location.state;

  const [patient, setPatient] = useState(patientData || null);
  const [caregivers, setCaregivers] = useState([]);
  const [charges, setCharges] = useState({});
  const [total, setTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [extraCharges, setExtraCharges] = useState(0);
  const [finalTotal, setFinalTotal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const careRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/patient/payment-info`, {
          patientId
        });
        setCaregivers(careRes.data.caregivers);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [patientId]);

  const handleChargeChange = (index, value) => {
    const updated = { ...charges, [index]: parseFloat(value || 0) };
    setCharges(updated);
  };

  const handleGetTotal = () => {
    const totalAmount = Object.values(charges).reduce((acc, val) => acc + val, 0);
    setTotal(totalAmount);
  };

  const handleGenerateBill = async () => {
    const grandTotal = total + Number(extraCharges) - Number(discount);
    setFinalTotal(grandTotal);

    const payload = caregivers.map((item, idx) => ({
      _id: item._id,
      amount: charges[idx] || 0
    }));

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/patient/submit-payment`,
        {
          id: patientId,
          charges: payload,
          total,
          discount,
          extraCharges,
          finalTotal: grandTotal,
        },
        {
          responseType: 'blob', // Important for file download
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${patient?.patientName || 'patient'}.pdf`;
      link.click();

      alert("Bill generated and downloaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to generate bill");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">Patient Payment</h2>

      {patient && (
        <div className="bg-white shadow p-4 rounded mb-6">
          <h3 className="text-xl font-semibold">{patient.patientName}</h3>
          <p>Age: {patient.patientAge}</p>
          <p>Gender: {patient.patientGender}</p>
          <p>Contact: {patient.patientContact}</p>
          <p>Email: {patient.patientEmail}</p>
          <p>Address: {patient.patientAddress}</p>
          <p>Status: {patient.status}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Caregiver</th>
              <th className="p-2 border">Contact</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Duty</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Charge (₹)</th>
            </tr>
          </thead>
          <tbody>
            {caregivers.map((item, idx) => (
              <tr key={item._id} className="border-t">
                <td className="p-2">{idx + 1}</td>
                <td className="p-2">{item.caregiver?.name}</td>
                <td className="p-2">{item.caregiver?.contact}</td>
                <td className="p-2">{item.caregiverRole}</td>
                <td className="p-2">{new Date(item.date).toLocaleDateString()}</td>
                <td className="p-2">{item.duty}</td>
                <td className="p-2">{item.status}</td>
                <td className="p-2">
                  <input
                    type="number"
                    className="border p-1 rounded w-24"
                    onChange={(e) => handleChargeChange(idx, e.target.value)}
                    value={charges[idx] || ''}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-6">
        <button
          onClick={handleGetTotal}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Get Total
        </button>
      </div>

      {total > 0 && (
        <div className="mt-6 bg-gray-100 p-4 rounded max-w-md mx-auto shadow">
          <p className="text-lg font-semibold text-blue-800 mb-2">Subtotal: ₹{total}</p>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Discount (₹):</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="border p-2 w-full rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Extra Charges (₹):</label>
            <input
              type="number"
              value={extraCharges}
              onChange={(e) => setExtraCharges(Number(e.target.value))}
              className="border p-2 w-full rounded"
            />
          </div>

          <button
            onClick={handleGenerateBill}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-full"
          >
            Generate & Download Bill
          </button>

          {finalTotal !== null && (
            <p className="mt-4 text-xl font-bold text-green-700">
              Final Total: ₹{finalTotal}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientPayment;
