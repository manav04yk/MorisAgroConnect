// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import FloatingChat from '../components/FloatingChat';
import Toast from '../components/Toast';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [toasts, setToasts] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    foodWasteSaved: 0,
    carbonReduced: 0,
    activeFarmers: 0,
    activeBuyers: 0
  });
  const [users, setUsers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // Add toast notification
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  // Remove toast
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setStats({
      totalUsers: 156,
      totalOrders: 342,
      foodWasteSaved: 1250,
      carbonReduced: 3420,
      activeFarmers: 89,
      activeBuyers: 45
    });
    
    setUsers([
      { id: 1, name: 'Le Meridien Hotel', email: 'buyer@demo.mu', role: 'buyer', location: 'Pointe aux Piments', status: 'active', joined: '2024-01-10' },
      { id: 2, name: 'Jean-Pierre Farm', email: 'farmer@demo.mu', role: 'farmer', location: 'Riviere du Rempart', status: 'active', joined: '2024-01-11' },
      { id: 3, name: 'Raj Delivery', email: 'driver@demo.mu', role: 'driver', location: 'Port Louis', status: 'active', joined: '2024-01-12' },
      { id: 4, name: 'Bel Ombre Resort', email: 'buyer2@demo.mu', role: 'buyer', location: 'Bel Ombre', status: 'active', joined: '2024-01-13' },
      { id: 5, name: 'Green Farms MU', email: 'farmer2@demo.mu', role: 'farmer', location: 'Curepipe', status: 'inactive', joined: '2024-01-14' }
    ]);
    
    setRecentActivities([
      { id: 1, action: 'New user registered', user: 'Jean-Pierre Farm', time: '5 min ago', type: 'user' },
      { id: 2, action: 'Order completed', user: 'Le Meridien Hotel', time: '15 min ago', type: 'order' },
      { id: 3, action: 'Food waste listing sold', user: 'Green Farms MU', time: '1 hour ago', type: 'waste' },
      { id: 4, action: 'New quotation generated', user: 'Agent 4', time: '2 hours ago', type: 'quotation' },
      { id: 5, action: 'Cyclone alert sent', user: 'Agent 7', time: '3 hours ago', type: 'alert' }
    ]);
  };

  const addActivity = (action, userName, type) => {
    const newActivity = {
      id: recentActivities.length + 1,
      action: action,
      user: userName,
      time: 'Just now',
      type: type
    };
    setRecentActivities([newActivity, ...recentActivities]);
  };

  const addNewUser = () => {
    const name = document.getElementById('userName')?.value;
    const email = document.getElementById('userEmail')?.value;
    const role = document.getElementById('userRole')?.value;
    const location = document.getElementById('userLocation')?.value;
    
    if (!name || !email || !location) {
      addToast('Please fill in all fields', 'error');
      return;
    }
    
    const newUser = {
      id: users.length + 1,
      name: name,
      email: email,
      role: role,
      location: location,
      status: 'active',
      joined: new Date().toISOString().split('T')[0]
    };
    
    setUsers([...users, newUser]);
    
    setStats({
      ...stats,
      totalUsers: stats.totalUsers + 1,
      activeFarmers: role === 'farmer' ? stats.activeFarmers + 1 : stats.activeFarmers,
      activeBuyers: role === 'buyer' ? stats.activeBuyers + 1 : stats.activeBuyers
    });
    
    addActivity(`New user registered: ${name}`, name, 'user');
    addToast(`${name} added as ${role}!`, 'success');
    
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userLocation').value = '';
  };

  const deleteUser = (userId) => {
    const deletedUser = users.find(u => u.id === userId);
    setUsers(users.filter(user => user.id !== userId));
    
    setStats({
      ...stats,
      totalUsers: stats.totalUsers - 1,
      activeFarmers: deletedUser?.role === 'farmer' ? stats.activeFarmers - 1 : stats.activeFarmers,
      activeBuyers: deletedUser?.role === 'buyer' ? stats.activeBuyers - 1 : stats.activeBuyers
    });
    
    if (deletedUser) {
      addActivity(`User deleted: ${deletedUser.name}`, 'Admin', 'user');
      addToast(`🗑️ ${deletedUser.name} deleted`, 'success');
    }
  };

  const toggleUserStatus = (userId) => {
    const updatedUser = users.find(u => u.id === userId);
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
    
    if (updatedUser) {
      const newStatus = updatedUser.status === 'active' ? 'inactive' : 'active';
      addActivity(`User ${updatedUser.name} ${newStatus === 'active' ? 'enabled' : 'disabled'}`, 'Admin', 'user');
      addToast(`${updatedUser.name} ${newStatus === 'active' ? 'enabled' : 'disabled'}`, 'success');
    }
  };

  return (
    <div className="container-fluid mt-3 mb-5">
      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}

      <div className="row">
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
                  👥 Users
                </button>
                <button 
                  className={`nav-link text-dark ${activeTab === 'activities' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('activities')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  🔄 Activities
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

        <div className="col-md-10 col-12">
          {activeTab === 'overview' && (
            <>
              <div className="card mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">📊 Platform Overview</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <div className="card bg-primary text-white text-center">
                        <div className="card-body">
                          <div className="display-4">{stats.totalUsers}</div>
                          <div>Total Users</div>
                          <small>{stats.activeFarmers} Farmers | {stats.activeBuyers} Buyers</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="card bg-success text-white text-center">
                        <div className="card-body">
                          <div className="display-4">{stats.totalOrders}</div>
                          <div>Total Orders</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="card bg-info text-white text-center">
                        <div className="card-body">
                          <div className="display-4">{stats.foodWasteSaved} kg</div>
                          <div>Food Waste Saved</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="card bg-warning text-white text-center">
                        <div className="card-body">
                          <div className="display-4">{stats.carbonReduced} kg</div>
                          <div>CO₂ Reduced</div>
                        </div>
                      </div>
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
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <>
              <div className="card mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">➕ Add New User</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <input type="text" className="form-control" id="userName" placeholder="Full Name" />
                    </div>
                    <div className="col-md-3">
                      <input type="email" className="form-control" id="userEmail" placeholder="Email" />
                    </div>
                    <div className="col-md-2">
                      <select className="form-select" id="userRole">
                        <option value="buyer">Buyer</option>
                        <option value="farmer">Farmer</option>
                        <option value="driver">Driver</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <input type="text" className="form-control" id="userLocation" placeholder="Location" />
                    </div>
                    <div className="col-md-2">
                      <button type="button" className="btn btn-success w-100" onClick={addNewUser}>
                        + Add User
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header bg-white">
                  <h5 className="mb-0">👥 User Management</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Location</th>
                          <th>Status</th>
                          <th>Joined</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                              <span className={`badge bg-${user.role === 'buyer' ? 'primary' : user.role === 'farmer' ? 'success' : 'info'}`}>
                                {user.role}
                              </span>
                            </td>
                            <td>{user.location || 'N/A'}</td>
                            <td>
                              <span className={`badge bg-${user.status === 'active' ? 'success' : 'secondary'}`}>
                                {user.status}
                              </span>
                            </td>
                            <td>{user.joined}</td>
                            <td>
                              <button className="btn btn-sm btn-outline-danger me-1" onClick={() => deleteUser(user.id)}>Delete</button>
                              <button className="btn btn-sm btn-outline-warning" onClick={() => toggleUserStatus(user.id)}>
                                {user.status === 'active' ? 'Disable' : 'Enable'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'activities' && (
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">🔄 Recent Platform Activities</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>User/Agent</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivities.map(activity => (
                        <tr key={activity.id}>
                          <td>{activity.action}</td>
                          <td>
                            <span className={`badge bg-${activity.type === 'user' ? 'primary' : activity.type === 'order' ? 'success' : 'info'}`}>
                              {activity.user}
                            </span>
                          </td>
                          <td>{activity.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">🤖 AI Agent Status</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {[1,2,3,4,5,6,7,8,9].map(i => (
                    <div className="col-md-6 col-lg-4 mb-3" key={i}>
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6>{i}. {['Demand Forecast', 'Supplier Matching', 'AI Negotiation', 'Procurement', 'Finance', 'Logistics', 'Cyclone Risk', 'Food Waste', 'Sustainability'][i-1]} Agent</h6>
                          <span className="badge bg-success">Active</span>
                          <p className="small mt-2 mb-0">
                            {['Predicts demand using weather & tourism data', 'Matches buyers with best farmers', 'Negotiates fair prices automatically', 'Generates quotations & purchase orders', 'Manages invoices & payments', 'Optimizes delivery routes', 'Monitors weather & supply risks', 'Manages surplus food marketplace', 'Tracks environmental impact'][i-1]}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
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
