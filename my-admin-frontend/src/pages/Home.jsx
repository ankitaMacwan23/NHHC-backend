import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const StatCard = ({ label, value, accent, to }) => {
  const card = (
    <div className={`rounded-2xl p-5 shadow-sm border bg-white hover:shadow-md transition ${accent}`}>
      <p className="text-3xl font-extrabold text-gray-800">{value}</p>
      <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
    </div>
  );
  return to ? <Link to={to}>{card}</Link> : card;
};

const Home = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/stats`, {
          withCredentials: true,
        });
        setStats(res.data.stats);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 sm:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Dashboard</h1>
          <p className="text-gray-600">Naysan Home Health Care — admin overview</p>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading dashboard…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard label="Total Patients" value={stats?.totalPatients ?? 0} accent="border-blue-200" to="/patients" />
              <StatCard label="Pending Patients" value={stats?.pendingPatients ?? 0} accent="border-amber-200" to="/patients" />
              <StatCard label="Completed Payments" value={stats?.paymentDonePatients ?? 0} accent="border-green-200" to="/payments-done" />
              <StatCard label="Total Caregivers" value={stats?.totalCaregivers ?? 0} accent="border-blue-200" to="/caregivers" />
              <StatCard label="Pending Approvals" value={stats?.pendingCaregivers ?? 0} accent="border-red-200" to="/caregivers" />
              <StatCard label="Approved Caregivers" value={stats?.approvedCaregivers ?? 0} accent="border-green-200" to="/caregivers" />
              <StatCard label="Total Inquiries" value={stats?.totalInquiries ?? 0} accent="border-blue-200" to="/inquiries" />
              <StatCard label="Unsolved Inquiries" value={stats?.unsolvedInquiries ?? 0} accent="border-red-200" to="/inquiries" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <Link to="/caregivers" className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition">
                <h3 className="text-lg font-semibold text-blue-700 mb-1">Manage Caregivers</h3>
                <p className="text-sm text-gray-600">Approve, reject and view caregiver work history.</p>
              </Link>
              <Link to="/patients" className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition">
                <h3 className="text-lg font-semibold text-blue-700 mb-1">Patients</h3>
                <p className="text-sm text-gray-600">Review profiles, allocate caregivers and take payments.</p>
              </Link>
              <Link to="/payments-done" className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition">
                <h3 className="text-lg font-semibold text-blue-700 mb-1">Payments</h3>
                <p className="text-sm text-gray-600">Completed payments with full charge breakdown.</p>
              </Link>
              <Link to="/inquiries" className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition">
                <h3 className="text-lg font-semibold text-blue-700 mb-1">Inquiries</h3>
                <p className="text-sm text-gray-600">Contact-us messages — mark solved / unsolved.</p>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
