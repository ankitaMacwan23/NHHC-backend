import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All'); // All | Unsolved | Solved

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/inquiry`, {
        withCredentials: true,
      });
      setInquiries(res.data.inquiries || []);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/inquiry/${id}/status`,
        { status },
        { withCredentials: true }
      );
      fetchInquiries();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
    }
  };

  const visible = inquiries
    .filter((i) => (filter === 'All' ? true : i.status === filter))
    .filter((i) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        (i.name || '').toLowerCase().includes(q) ||
        (i.mobile || '').includes(q) ||
        (i.email || '').toLowerCase().includes(q) ||
        (i.subject || '').toLowerCase().includes(q)
      );
    });

  return (
    <div className="p-4 sm:p-8">
      <h2 className="text-2xl font-bold text-blue-700 text-center mb-6">Inquiries</h2>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 max-w-3xl mx-auto">
        <input
          type="text"
          placeholder="Search by name, mobile, email or subject…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 flex-1"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="All">All</option>
          <option value="Unsolved">Unsolved</option>
          <option value="Solved">Solved</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="text-center text-gray-500">No inquiries found.</p>
      ) : (
        <div className="overflow-x-auto max-w-5xl mx-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow">
            <thead>
              <tr className="bg-blue-100 text-left text-sm font-semibold text-blue-700">
                <th className="py-2 px-3 border-b text-center">Status</th>
                <th className="py-2 px-3 border-b">Name</th>
                <th className="py-2 px-3 border-b">Mobile</th>
                <th className="py-2 px-3 border-b">Email</th>
                <th className="py-2 px-3 border-b">Subject</th>
                <th className="py-2 px-3 border-b">Message</th>
                <th className="py-2 px-3 border-b">Date &amp; Time</th>
                <th className="py-2 px-3 border-b text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((i, idx) => {
                const solved = i.status === 'Solved';
                return (
                  <tr key={i._id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2 px-3 border-b text-center">
                      <span
                        title={i.status}
                        className={`inline-block w-3.5 h-3.5 rounded-full ${solved ? 'bg-green-500' : 'bg-red-500'}`}
                      />
                      <span className={`block text-xs mt-1 ${solved ? 'text-green-600' : 'text-red-600'}`}>
                        {i.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 border-b">{i.name}</td>
                    <td className="py-2 px-3 border-b">{i.mobile}</td>
                    <td className="py-2 px-3 border-b">{i.email || '—'}</td>
                    <td className="py-2 px-3 border-b">{i.subject}</td>
                    <td className="py-2 px-3 border-b max-w-xs whitespace-pre-wrap">{i.message}</td>
                    <td className="py-2 px-3 border-b whitespace-nowrap">
                      {i.createdAt ? new Date(i.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="py-2 px-3 border-b text-center">
                      {solved ? (
                        <button
                          onClick={() => updateStatus(i._id, 'Unsolved')}
                          className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Mark Unsolved
                        </button>
                      ) : (
                        <button
                          onClick={() => updateStatus(i._id, 'Solved')}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Mark Solved
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Inquiries;
