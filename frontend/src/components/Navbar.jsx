// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const userStr = localStorage.getItem('user');
  const [user, setUser] = useState(userStr ? JSON.parse(userStr) : null);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/';
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'buyer': return '/buyer-dashboard';
      case 'farmer': return '/farmer-dashboard';
      case 'driver': return '/driver-dashboard';
      case 'admin': return '/admin-dashboard';
      default: return '/';
    }
  };

  const getDashboardName = () => {
    if (!user) return 'Dashboard';
    switch (user.role) {
      case 'buyer': return 'Buyer Dashboard';
      case 'farmer': return 'Farmer Dashboard';
      case 'driver': return 'Delivery Dashboard';
      case 'admin': return 'Admin Dashboard';
      default: return 'Dashboard';
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          🌾 Moris AgroConnect
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>
            {!user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to={getDashboardLink()}>
                    📊 {getDashboardName()}
                  </Link>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm ms-2" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
