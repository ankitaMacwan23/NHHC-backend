import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PaymentsDone = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/patient/payment-done`, {
          withCredentials: true,
        });
        setPatients(res.data.patients || []);
      } catch (err) {
        console.error('Error fetching payment-done patients:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-4 sm:p-8">
      <h2 className="text-2xl font-bold text-blue-700 text-center mb-6">Completed Payments</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading…</p>
      ) : patients.length === 0 ? (
        <p className="text-center text-gray-500">No completed payments yet.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {patients.map((p) => (
            <div key={p._id} className="bg-white rounded-xl shadow-md p-5 border">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">{p.patientName}</h3>
                  <p className="text-sm text-gray-600">Age: {p.patientAge} · {p.patientGender}</p>
                  <p className="text-sm text-gray-600">Contact: {p.patientContact}</p>
                  <p className="text-sm text-gray-600">Email: {p.patientEmail || '—'}</p>
                  <p className="text-sm text-gray-600">Address: {p.patientAddress}</p>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                  {p.status}
                </span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-blue-50 text-left text-blue-700">
                      <th className="py-2 px-3 border-b">Caregiver</th>
                      <th className="py-2 px-3 border-b">Role</th>
                      <th className="py-2 px-3 border-b">Date</th>
                      <th className="py-2 px-3 border-b">Duty</th>
                      <th className="py-2 px-3 border-b">Service</th>
                      <th className="py-2 px-3 border-b text-right">Charge (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.caregivers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-2 px-3 text-center text-gray-400">
                          No caregivers recorded
                        </td>
                      </tr>
                    ) : (
                      p.caregivers.map((c, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-2 px-3 border-b">
                            {c.name}
                            {c.contact && c.contact !== '-' && (
                              <span className="block text-xs text-gray-500">{c.contact}</span>
                            )}
                          </td>
                          <td className="py-2 px-3 border-b">{c.role}</td>
                          <td className="py-2 px-3 border-b">
                            {c.date ? new Date(c.date).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-2 px-3 border-b">{c.duty}</td>
                          <td className="py-2 px-3 border-b">
                            {c.serviceStatus === 'service_completed' ? 'Completed' : 'Pending'}
                          </td>
                          <td className="py-2 px-3 border-b text-right">{c.charge}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-green-50 font-semibold text-green-800">
                      <td colSpan={5} className="py-2 px-3 text-right">Total</td>
                      <td className="py-2 px-3 text-right">₹{p.totalCharge}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentsDone;
