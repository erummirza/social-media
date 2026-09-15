import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './Register';
import SignIn from './SignIn';
import Dashboard from './Dashboard';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

function App() {
  const [loggedInUser, setLoggedInUser] = useState(
    localStorage.getItem('loggedInUser') || ''
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('user');
    setLoggedInUser('');
  };

  const isAdminLoggedIn = () => !!localStorage.getItem('adminToken');

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route
          path="/signin"
          element={<SignIn setLoggedInUser={setLoggedInUser} />}
        />
        <Route
          path="/dashboard"
          element={
            loggedInUser
              ? <Dashboard loggedInUser={loggedInUser} onLogout={handleLogout} />
              : <Navigate to="/signin" replace />
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            isAdminLoggedIn()
              ? <AdminDashboard />
              : <Navigate to="/admin/login" replace />
          }
        />
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;