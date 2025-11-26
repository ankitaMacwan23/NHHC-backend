import React from 'react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-6 py-10">
      <div className="max-w-4xl bg-white rounded-3xl shadow-2xl p-10 text-center border border-blue-200">
        <h1 className="text-4xl font-bold text-blue-800 mb-2">
          Welcome, Mr. Sumit Solanki
        </h1>
        <h2 className="text-xl sm:text-2xl text-gray-600 mb-6">
          Owner & Admin — Naysan Home Health Care
        </h2>
        <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto mb-8">
          You're now accessing the Naysan Care admin panel. From here, you can manage caregivers, patients, service requests, and system reports — all in one place.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mt-4">
          <div className="bg-blue-100 rounded-xl p-6 hover:bg-blue-200 transition">
            <h3 className="text-lg font-semibold text-blue-700 mb-1">Manage Caregivers</h3>
            <p className="text-sm text-gray-600">Add, update or remove caregivers and assign them to patients.</p>
          </div>
          <div className="bg-blue-100 rounded-xl p-6 hover:bg-blue-200 transition">
            <h3 className="text-lg font-semibold text-blue-700 mb-1">Patient Overview</h3>
            <p className="text-sm text-gray-600">Review patient profiles, statuses and allocation history.</p>
          </div>
          <div className="bg-blue-100 rounded-xl p-6 hover:bg-blue-200 transition">
            <h3 className="text-lg font-semibold text-blue-700 mb-1">Service Requests</h3>
            <p className="text-sm text-gray-600">Monitor pending and approved requests for care services.</p>
          </div>
          <div className="bg-blue-100 rounded-xl p-6 hover:bg-blue-200 transition">
            <h3 className="text-lg font-semibold text-blue-700 mb-1">Reports & Analytics</h3>
            <p className="text-sm text-gray-600">Access performance reports and system usage data.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
