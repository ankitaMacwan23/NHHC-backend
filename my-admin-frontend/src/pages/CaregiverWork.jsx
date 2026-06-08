import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const SummaryCard = ({ label, value, color }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border text-center">
    <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
    <p className="text-sm text-gray-500 mt-1">{label}</p>
  </div>
);

const CaregiverWork = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/caregiver/work/${id}`, {
          withCredentials: true,
        });
        setData(res.data);
      } catch (err) {
        console.error('Failed to load caregiver work:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <p className="text-center text-gray-500 p-8">Loading…</p>;
  if (!data || !data.caregiver) return <p className="text-center text-gray-500 p-8">Caregiver not found.</p>;

  const { caregiver, summary, records } = data;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-4">
        ← Back
      </button>

      <div className="bg-white rounded-2xl shadow p-6 border mb-6">
        <h2 className="text-2xl font-bold text-blue-800">{caregiver.name}</h2>
        <p className="text-gray-600">{caregiver.role} · {caregiver.gender}</p>
        <p className="text-gray-600">Contact: {caregiver.contact}</p>
        <p className="text-gray-600">Email: {caregiver.email || '—'}</p>
        <span className="inline-block mt-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
          {caregiver.status}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <SummaryCard label="Total Assignments" value={summary.totalAssignments} color="text-blue-700" />
        <SummaryCard label="Completed Visits" value={summary.completedVisits} color="text-green-600" />
        <SummaryCard label="Pending Visits" value={summary.pendingVisits} color="text-amber-600" />
        <SummaryCard label="Unique Patients" value={summary.uniquePatients} color="text-purple-600" />
        <SummaryCard label="Total Earnings (₹)" value={summary.totalEarnings} color="text-green-700" />
      </div>

      <h3 className="text-lg font-semibold text-gray-700 mb-3">Service Records</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow">
          <thead>
            <tr className="bg-blue-100 text-left text-sm font-semibold text-blue-700">
              <th className="py-2 px-3 border-b">Patient</th>
              <th className="py-2 px-3 border-b">Contact</th>
              <th className="py-2 px-3 border-b">Date</th>
              <th className="py-2 px-3 border-b">Duty</th>
              <th className="py-2 px-3 border-b">Service</th>
              <th className="py-2 px-3 border-b">Caregiver Paid</th>
              <th className="py-2 px-3 border-b text-right">Charge (₹)</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-3 text-center text-gray-400">No service records.</td>
              </tr>
            ) : (
              records.map((r, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-3 border-b">{r.patientName}</td>
                  <td className="py-2 px-3 border-b">{r.patientContact}</td>
                  <td className="py-2 px-3 border-b">{r.date ? new Date(r.date).toLocaleDateString() : '—'}</td>
                  <td className="py-2 px-3 border-b">{r.duty}</td>
                  <td className="py-2 px-3 border-b">
                    <span className={r.serviceStatus === 'service_completed' ? 'text-green-600' : 'text-amber-600'}>
                      {r.serviceStatus === 'service_completed' ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-2 px-3 border-b">{r.paymentToCaregiver}</td>
                  <td className="py-2 px-3 border-b text-right">{r.charge}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CaregiverWork;
