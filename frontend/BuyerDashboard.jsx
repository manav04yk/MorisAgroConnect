// src/pages/BuyerDashboard.jsx
import React, { useState, useEffect } from 'react';
import SustainabilityTicker from '../components/SustainabilityTicker';
import FloatingChat from '../components/FloatingChat';
import Toast from '../components/Toast';

function BuyerDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [produceRequests, setProduceRequests] = useState([]);
  const [requestProduct, setRequestProduct] = useState('');
  const [requestQuantity, setRequestQuantity] = useState('');
  const [requestDate, setRequestDate] = useState('');

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
    
    // Load saved produce requests from localStorage
    const savedRequests = localStorage.getItem('produceRequests');
    if (savedRequests) {
      setProduceRequests(JSON.parse(savedRequests));
    } else {
      // Initial mock data only once
      setProduceRequests([
        { id: 1, product: 'Tomatoes', quantity: 100, requiredDate: '2024-01-20', status: 'pending', createdAt: '2024-01-10' }
      ]);
    }
    
    fetchDashboardData();
    
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Save produce requests to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('produceRequests', JSON.stringify(produceRequests));
  }, [produceRequests]);

  const fetchDashboardData = async () => {
    try {
      // These are the ONLY things that should refresh
      setActiveOrders([
        { id: 1, product: 'Tomatoes', quantity: 100, status: 'in_transit', date: '2024-01-15' },
        { id: 2, product: 'Lettuce', quantity: 50, status: 'confirmed', date: '2024-01-16' }
      ]);
      
      setQuotations([
        { id: 1, product: 'Carrots', quantity: 75, totalAmount: 1500, farmerName: 'Jean-Pierre Farm', status: 'pending' }
      ]);
      
      setInvoices([
        { id: 'INV-001', amount: 3850, dueDate: '2024-01-20', status: 'pending' },
        { id: 'INV-002', amount: 1200, dueDate: '2024-01-15', status: 'paid' }
      ]);
      
      setDeliveries([
        { id: 1, orderId: 1, eta: '45 min', driverName: 'Raj Delivery', status: 'in_transit' }
      ]);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleCreateRequest = (e) => {
    e.preventDefault();
    
    if (!requestProduct || !requestQuantity || !requestDate) {
      addToast('Please fill in all fields', 'error');
      return;
    }
    
    const newRequest = {
      id: Date.now(), // Use timestamp for unique ID
      product: requestProduct,
      quantity: parseInt(requestQuantity),
      requiredDate: requestDate,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setProduceRequests(prev => [...prev, newRequest]);
    addToast(`✅ Request created for ${requestQuantity}kg of ${requestProduct}`, 'success');
    
    setRequestProduct('');
    setRequestQuantity('');
    setRequestDate('');
  };

  const handleApproveQuotation = async (quotationId) => {
    addToast(`✅ Quotation ${quotationId} approved! Farmer will be notified.`, 'success');
  };

  const handleDeleteRequest = (requestId, productName) => {
    setProduceRequests(prev => prev.filter(req => req.id !== requestId));
    addToast(`🗑️ Request for ${productName} deleted`, 'warning');
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
      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}

      <div className="row">
        {/* Sidebar with Tabs */}
        <div className="col-md-2 col-12 mb-3">
          <div className="card">
            <div className="card-body">
              <h6 className="fw-bold">Welcome back,</h6>
              <p className="text-success fw-bold">{user?.name || 'Buyer'}</p>
              <hr />
              <nav className="nav flex-column">
                <button 
                  className={`nav-link text-dark ${activeTab === 'dashboard' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  📊 Dashboard
                </button>
                <button 
                  className={`nav-link text-dark ${activeTab === 'requests' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('requests')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  📝 Produce Requests ({produceRequests.length})
                </button>
                <button 
                  className={`nav-link text-dark ${activeTab === 'orders' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('orders')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  📦 Orders
                </button>
                <button 
                  className={`nav-link text-dark ${activeTab === 'quotations' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('quotations')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  💰 Quotations
                </button>
                <button 
                  className={`nav-link text-dark ${activeTab === 'invoices' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('invoices')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  📄 Invoices
                </button>
                <a className="nav-link text-dark" href="/marketplace">
                  🛒 Marketplace
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content based on Active Tab */}
        <div className="col-md-10 col-12">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <>
              <SustainabilityTicker buyerId={user?.id} />

              {/* Create Request Form */}
              <div className="card mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">📝 Create New Produce Request</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleCreateRequest} className="row g-3">
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Product name (e.g., Tomatoes)"
                        value={requestProduct}
                        onChange={(e) => setRequestProduct(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Quantity (kg)"
                        value={requestQuantity}
                        onChange={(e) => setRequestQuantity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="date"
                        className="form-control"
                        value={requestDate}
                        onChange={(e) => setRequestDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-2">
                      <button type="submit" className="btn btn-success w-100">
                        Submit Request
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Active Deliveries */}
              <div className="card">
                <div className="card-header bg-white">
                  <h5 className="mb-0">🚚 Active Deliveries</h5>
                </div>
                <div className="card-body">
                  {deliveries.map(delivery => (
                    <div key={delivery.id} className="alert alert-info">
                      <strong>Order #{delivery.orderId}</strong> - ETA: {delivery.eta} - Driver: {delivery.driverName}
                      <div className="progress mt-2">
                        <div className="progress-bar bg-success" style={{ width: '60%' }}>
                          In Transit
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* PRODUCE REQUESTS TAB */}
          {activeTab === 'requests' && (
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">📝 My Produce Requests</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity (kg)</th>
                        <th>Required Date</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produceRequests.map(request => (
                        <tr key={request.id}>
                          <td>{request.product}</td>
                          <td>{request.quantity} kg</td>
                           <td>{request.requiredDate}</td>
                           <td>
                            <span className={`badge bg-${request.status === 'pending' ? 'warning' : 'success'}`}>
                              {request.status}
                            </span>
                           </td>
                           <td>{request.createdAt}</td>
                           <td>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteRequest(request.id, request.product)}
                            >
                              Delete
                            </button>
                           </td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
                  {produceRequests.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted">No produce requests yet. Create one from the Dashboard tab!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">📦 All Orders</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeOrders.map(order => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                           <td>{order.product}</td>
                           <td>{order.quantity} kg</td>
                           <td>
                            <span className={`badge bg-${order.status === 'in_transit' ? 'warning' : 'info'}`}>
                              {order.status}
                            </span>
                           </td>
                           <td>{order.date}</td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* QUOTATIONS TAB */}
          {activeTab === 'quotations' && (
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">💰 Pending Quotations</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Farmer</th>
                        <th>Total Amount</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotations.map(quotation => (
                        <tr key={quotation.id}>
                          <td>{quotation.product}</td>
                           <td>{quotation.quantity} kg</td>
                           <td>{quotation.farmerName}</td>
                           <td>Rs {quotation.totalAmount}</td>
                           <td>
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => handleApproveQuotation(quotation.id)}
                            >
                              Approve
                            </button>
                           </td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* INVOICES TAB */}
          {activeTab === 'invoices' && (
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">📄 All Invoices</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map(invoice => (
                        <tr key={invoice.id}>
                          <td>{invoice.id}</td>
                           <td>Rs {invoice.amount}</td>
                           <td>{invoice.dueDate}</td>
                           <td>
                            <span className={`badge bg-${invoice.status === 'pending' ? 'warning' : 'success'}`}>
                              {invoice.status}
                            </span>
                           </td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating AI Chat */}
      <FloatingChat currentPage="Buyer Dashboard" userRole="buyer" />
    </div>
  );
}

export default BuyerDashboard;
