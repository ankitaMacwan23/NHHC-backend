import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';
import Home from './pages/Home';
import Patients from './pages/Patients';
import CareGivers from './pages/CareGivers';
import Services from './pages/Services';
import Blogs from './pages/Blogs';
import Testimonials from './pages/Testimonials';
import Accounts from './pages/Accounts';
import PatientDetails from './components/PatientDetails';
import PatientPayment from './pages/PatientPayment';
import ProtectedRoute from "./components/ProtectedRoute";
import axios from 'axios';

const AppContent = () => {
  const [authCheck, setAuthCheck] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/admin/check-session`, {
          withCredentials: true,
        });
        setIsAdmin(res.data.isAdmin);
      } catch (err) {
        setIsAdmin(false);
      }
    };

    checkSession();
  }, [authCheck]);

  const isLoginPage = location.pathname === '/';

  return (
    <>
      {isAdmin && <Header onLogout={() => setAuthCheck(prev => prev + 1)} />}
      <main className="min-h-screen">
        <Routes>
          <Route
            path="/"
            element={<Login onLogin={() => setAuthCheck(prev => prev + 1)} />}
          />
          <Route element={<ProtectedRoute authCheck={authCheck} />}>
            <Route path="/home" element={<Home />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/caregivers" element={<CareGivers />} />
            <Route path="/services" element={<Services />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/patient/details" element={<PatientDetails />} />
            <Route path="/patient/payment" element={<PatientPayment />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
