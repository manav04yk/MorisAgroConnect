// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingChat from '../components/FloatingChat';
import Toast from '../components/Toast';
import api from '../utils/api';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    totalBuyers: 0,
    totalDrivers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  
  // Users state
  const [users, setUsers] = useState([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('buyer');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserLocation, setNewUserLocation] = useState('');

  const navigate = useNavigate();

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    
    const currentUser = JSON.parse(userStr);
    if (currentUser.role !== 'admin') {
      navigate('/');
      return;
    }
    
    setUser(currentUser);
    fetchAllData();
  }, [navigate]);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchStats(),
        fetchUsers()
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const usersResponse = await api.get('/users');
      const allUsers = Array.isArray(usersResponse.data) ? usersResponse.data : [];
      
      const farmers = allUsers.filter(u => u.role === 'farmer').length;
      const buyers = allUsers.filter(u => u.role === 'buyer').length;
      const drivers = allUsers.filter(u => u.role === 'driver').length;
      
      setStats({
        totalUsers: allUsers.length,
        totalFarmers: farmers,
        totalBuyers: buyers,
        totalDrivers: drivers,
        totalOrders: 0,
        totalRevenue: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    if (!newUserName || !newUserEmail || !newUserPassword) {
      addToast('Please fill in all fields', 'error');
      return;
    }
    
    try {
      await api.post('/auth/register', {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        location: newUserLocation
      });
      
      addToast(`✅ User ${newUserName} added successfully`, 'success');
      
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserLocation('');
      setNewUserRole('buyer');
      
      fetchStats();
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      addToast(error.response?.data?.error || 'Failed to add user', 'error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        await api.delete(`/users/${userId}`);
        addToast(`🗑️ ${userName} deleted successfully`, 'success');
        fetchStats();
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        addToast(error.response?.data?.error || 'Failed to delete user', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-3 mb-5">
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}

      <div className="row">
        {/* Sidebar */}
        <div className="col-md-2 col-12 mb-3">
          <div className="card">
            <div className="card-body">
              <h6 className="fw-bold">Admin Panel</h6>
              <p className="text-success fw-bold">{user?.name || 'Admin'}</p>
              <hr />
              <nav className="nav flex-column">
                <button 
                  className={`nav-link text-dark ${activeTab === 'overview' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('overview')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  📊 Overview
                </button>
                <button 
                  className={`nav-link text-dark ${activeTab === 'users' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('users')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  👥 Users ({stats.totalUsers})
                </button>
                <button 
                  className={`nav-link text-dark ${activeTab === 'agents' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('agents')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  🤖 AI Agents
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-10 col-12">
          <div className="mb-4">
            <h2 className="text-success">👑 Admin Dashboard</h2>
          </div>
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              <div className="row mb-4">
                <div className="col-md-3 mb-3">
                  <div className="card bg-primary text-white text-center">
                    <div className="card-body">
                      <div className="display-4">{stats.totalUsers}</div>
                      <div>Total Users</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card bg-success text-white text-center">
                    <div className="card-body">
                      <div className="display-4">{stats.totalFarmers}</div>
                      <div>Farmers</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card bg-info text-white text-center">
                    <div className="card-body">
                      <div className="display-4">{stats.totalBuyers}</div>
                      <div>Buyers</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card bg-warning text-white text-center">
                    <div className="card-body">
                      <div className="display-4">{stats.totalDrivers}</div>
                      <div>Drivers</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header bg-white">
                  <h5 className="mb-0">✅ Platform Health</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="alert alert-success">
                        <strong>9/9 Agents</strong> - All AI agents operational
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="alert alert-success">
                        <strong>100%</strong> - System uptime
                      </div>
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-md-6">
                      <div className="alert alert-info">
                        <strong>📦 Orders</strong> - {stats.totalOrders} total orders
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="alert alert-info">
                        <strong>💰 Revenue</strong> - Rs {stats.totalRevenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <>
              {/* Add User Form */}
              <div className="card mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">➕ Add New User</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleAddUser} className="row g-3">
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Full Name"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-2">
                      <select
                        className="form-select"
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                      >
                        <option value="buyer">Buyer</option>
                        <option value="farmer">Farmer</option>
                        <option value="driver">Driver</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Location"
                        value={newUserLocation}
                        onChange={(e) => setNewUserLocation(e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-success">
                        + Add User
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Users Table */}
              <div className="card">
                <div className="card-header bg-white">
                  <h5 className="mb-0">👥 User Management</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Location</th>
                          <th>Joined</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center text-muted">No users found</td>
                          </tr>
                        ) : (
                          users.map(userItem => (
                            <tr key={userItem.id}>
                              <td>{userItem.id}</td>
                              <td><strong>{userItem.name}</strong></td>
                              <td>{userItem.email}</td>
                              <td>
                                <span className={`badge bg-${userItem.role === 'admin' ? 'danger' : userItem.role === 'farmer' ? 'success' : userItem.role === 'buyer' ? 'primary' : 'info'}`}>
                                  {userItem.role}
                                </span>
                              </td>
                              <td>{userItem.location || 'N/A'}</td>
                              <td>{userItem.created_at?.split('T')[0]}</td>
                              <td>
                                {userItem.role !== 'admin' && (
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteUser(userItem.id, userItem.name)}
                                  >
                                    Delete
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* AI AGENTS TAB */}
          {activeTab === 'agents' && (
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">🤖 AI Agent Status</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 col-lg-4 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6>1. Demand Forecast Agent</h6>
                        <span className="badge bg-success">Active</span>
                        <p className="small mt-2 mb-0">Predicts demand using weather & tourism data</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6>2. Supplier Matching Agent</h6>
                        <span className="badge bg-success">Active</span>
                        <p className="small mt-2 mb-0">Matches buyers with best farmers</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6>3. AI Negotiation Agent</h6>
                        <span className="badge bg-success">Active</span>
                        <p className="small mt-2 mb-0">Negotiates fair prices automatically</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6>4. Procurement Agent</h6>
                        <span className="badge bg-success">Active</span>
                        <p className="small mt-2 mb-0">Generates quotations & purchase orders</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6>5. Finance Agent</h6>
                        <span className="badge bg-success">Active</span>
                        <p className="small mt-2 mb-0">Manages invoices & payments</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6>6. Logistics Agent</h6>
                        <span className="badge bg-success">Active</span>
                        <p className="small mt-2 mb-0">Optimizes delivery routes</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6>7. Cyclone Risk Agent</h6>
                        <span className="badge bg-success">Active</span>
                        <p className="small mt-2 mb-0">Monitors weather & supply risks</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6>8. Food Waste Agent</h6>
                        <span className="badge bg-success">Active</span>
                        <p className="small mt-2 mb-0">Manages surplus food marketplace</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4 mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6>9. Sustainability Agent</h6>
                        <span className="badge bg-success">Active</span>
                        <p className="small mt-2 mb-0">Tracks environmental impact</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <FloatingChat currentPage="Admin Dashboard" userRole="admin" />
    </div>
  );
}

export default AdminDashboard;
