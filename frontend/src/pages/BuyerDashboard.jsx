// src/pages/BuyerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SustainabilityTicker from '../components/SustainabilityTicker';
import FloatingChat from '../components/FloatingChat';
import Toast from '../components/Toast';
import api from '../utils/api';

function BuyerDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [produceRequests, setProduceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestProduct, setRequestProduct] = useState('');
  const [requestQuantity, setRequestQuantity] = useState('');
  const [requestDate, setRequestDate] = useState('');
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
    if (currentUser.role !== 'buyer') {
      navigate('/');
      return;
    }
    
    setUser(currentUser);
    fetchAllData();
    
    const interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchRequests(),
        fetchQuotations(),
        fetchOrders(),
        fetchInvoices(),
        fetchDeliveries()
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests');
      setProduceRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setProduceRequests([]);
    }
  };

  const fetchQuotations = async () => {
    try {
      const response = await api.get('/quotations');
      setQuotations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      setQuotations([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setActiveOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setActiveOrders([]);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      setInvoices(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const response = await api.get('/deliveries');
      setDeliveries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      setDeliveries([]);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    
    if (!requestProduct || !requestQuantity || !requestDate) {
      addToast('Please fill in all fields', 'error');
      return;
    }
    
    try {
      await api.post('/requests', {
        product_name: requestProduct,
        quantity_kg: parseInt(requestQuantity),
        required_date: requestDate
      });
      
      addToast(`✅ Request created for ${requestQuantity}kg of ${requestProduct}`, 'success');
      
      setRequestProduct('');
      setRequestQuantity('');
      setRequestDate('');
      fetchRequests();
    } catch (error) {
      console.error('Error creating request:', error);
      addToast(error.response?.data?.error || 'Failed to create request', 'error');
    }
  };

  const handleApproveQuotation = async (quotationId) => {
    try {
      await api.patch(`/quotations/${quotationId}/approve`);
      addToast(`✅ Quotation approved! Order and invoice created.`, 'success');
      fetchAllData();
    } catch (error) {
      console.error('Error approving quotation:', error);
      addToast(error.response?.data?.error || 'Failed to approve quotation', 'error');
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
                  className={`nav-link text-dark ${activeTab === 'quotations' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('quotations')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  💰 Quotations ({quotations.filter(q => q.status === 'pending').length})
                </button>
                <button 
                  className={`nav-link text-dark ${activeTab === 'orders' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('orders')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  📦 Orders ({activeOrders.length})
                </button>
                <button 
                  className={`nav-link text-dark ${activeTab === 'invoices' ? 'active fw-bold bg-success bg-opacity-10' : ''}`}
                  onClick={() => setActiveTab('invoices')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  📄 Invoices ({invoices.filter(i => i.status === 'pending').length})
                </button>
                <a className="nav-link text-dark" href="/marketplace">
                  🛒 Marketplace
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-10 col-12">
          <div className="mb-4">
            <h2 className="text-success">📊 Buyer Dashboard</h2>
          </div>
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <>
              <SustainabilityTicker buyerId={user?.id} />

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

              <div className="card">
                <div className="card-header bg-white">
                  <h5 className="mb-0">🚚 Active Deliveries</h5>
                </div>
                <div className="card-body">
                  {deliveries.filter(d => d.status !== 'delivered').length === 0 ? (
                    <p className="text-muted text-center">No active deliveries</p>
                  ) : (
                    deliveries.filter(d => d.status !== 'delivered').map(delivery => (
                      <div key={delivery.id} className="alert alert-info">
                        <strong>Order #{delivery.order_id}</strong> - ETA: {delivery.eta || 'Calculating...'} - Driver: {delivery.driver_name || 'Assigning...'}
                        <div className="progress mt-2">
                          <div className="progress-bar bg-success" style={{ width: delivery.status === 'picked_up' ? '50%' : '25%' }}>
                            {delivery.status === 'picked_up' ? 'Picked Up' : 'Assigned'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
                      </tr>
                    </thead>
                    <tbody>
                      {produceRequests.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center text-muted">No produce requests yet. Create one from the Dashboard tab!</td>
                        </tr>
                      ) : (
                        produceRequests.map(request => (
                          <tr key={request.id}>
                            <td>{request.product_name}</td>
                            <td>{request.quantity_kg} kg</td>
                            <td>{request.required_date?.split('T')[0] || request.required_date}</td>
                            <td>
                              <span className={`badge bg-${request.status === 'pending' ? 'warning' : 'success'}`}>
                                {request.status}
                              </span>
                            </td>
                            <td>{request.created_at?.split('T')[0]}</td>
                          </tr>
                        ))
                      )}
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
                <h5 className="mb-0">💰 Quotations</h5>
                <small className="text-muted">Quotations appear here after Agentforce processes your requests</small>
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
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotations.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center text-muted">No quotations yet. Agentforce will generate quotations from your produce requests.</td>
                        </tr>
                      ) : (
                        quotations.map(quotation => (
                          <tr key={quotation.id}>
                            <td>{quotation.product_name}</td>
                            <td>{quotation.quantity_kg} kg</td>
                            <td>{quotation.farmer_name}</td>
                            <td>Rs {quotation.total_amount}</td>
                            <td>
                              <span className={`badge bg-${quotation.status === 'pending' ? 'warning' : 'success'}`}>
                                {quotation.status}
                              </span>
                            </td>
                            <td>
                              {quotation.status === 'pending' && (
                                <button 
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleApproveQuotation(quotation.id)}
                                >
                                  Approve
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
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">📦 My Orders</h5>
                <small className="text-muted">Orders appear after you approve quotations</small>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Farmer</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeOrders.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center text-muted">No orders yet. Orders appear after you approve quotations.</td>
                        </tr>
                      ) : (
                        activeOrders.map(order => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{order.product_name}</td>
                            <td>{order.quantity_kg} kg</td>
                            <td>{order.farmer_name}</td>
                            <td>
                              <span className={`badge bg-${order.status === 'delivered' ? 'success' : order.status === 'in_transit' ? 'warning' : 'info'}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
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
                <h5 className="mb-0">📄 My Invoices</h5>
                <small className="text-muted">Invoices appear after orders are confirmed</small>
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
                      {invoices.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">No invoices yet. Invoices appear after orders are confirmed.</td>
                        </tr>
                      ) : (
                        invoices.map(invoice => (
                          <tr key={invoice.id}>
                            <td>#{invoice.id}</td>
                            <td>Rs {invoice.amount}</td>
                            <td>{invoice.due_date?.split('T')[0]}</td>
                            <td>
                              <span className={`badge bg-${invoice.status === 'pending' ? 'warning' : 'success'}`}>
                                {invoice.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <FloatingChat currentPage="Buyer Dashboard" userRole="buyer" />
    </div>
  );
}

export default BuyerDashboard;
