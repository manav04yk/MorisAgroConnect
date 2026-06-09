// src/pages/BuyerDashboard.jsx
import React, { useEffect, useState } from 'react';
import FloatingChat from '../components/FloatingChat';
import Toast from '../components/Toast';
import SustainabilityTicker from '../components/SustainabilityTicker';

import {
  getOrders,
  getQuotations,
  getInvoices,
  getDeliveries,
  createProduceRequest,
  approveQuotation
} from '../utils/api';

function BuyerDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeOrders, setActiveOrders] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [produceRequests, setProduceRequests] = useState([]);

  const [requestProduct, setRequestProduct] = useState('');
  const [requestQuantity, setRequestQuantity] = useState('');
  const [requestDate, setRequestDate] = useState('');

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');

    if (userStr) {
      setUser(JSON.parse(userStr));
    }

    fetchDashboardData();

    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [ordersRes, quotationsRes, invoicesRes, deliveriesRes] = await Promise.all([
        getOrders(),
        getQuotations(),
        getInvoices(),
        getDeliveries()
      ]);

      setActiveOrders(ordersRes.data);
      setQuotations(quotationsRes.data);
      setInvoices(invoicesRes.data);
      setDeliveries(deliveriesRes.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching buyer dashboard data:', error);
      addToast(error.response?.data?.error || 'Failed to load dashboard data', 'error');
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();

    if (!requestProduct || !requestQuantity || !requestDate) {
      addToast('Please fill in all fields', 'error');
      return;
    }

    if (Number(requestQuantity) <= 0) {
      addToast('Quantity must be greater than 0', 'error');
      return;
    }

    try {
      const response = await createProduceRequest({
        product_name: requestProduct,
        quantity_kg: Number(requestQuantity),
        required_date: requestDate
      });

      setProduceRequests(prev => [...prev, response.data.request]);

      addToast(
        `✅ Request created for ${requestQuantity}kg of ${requestProduct}`,
        'success'
      );

      setRequestProduct('');
      setRequestQuantity('');
      setRequestDate('');

      fetchDashboardData();
    } catch (error) {
      console.error('Create request error:', error);
      addToast(error.response?.data?.error || 'Failed to create request', 'error');
    }
  };

  const handleApproveQuotation = async (quotationId) => {
    try {
      await approveQuotation(quotationId);

      addToast(
        `✅ Quotation ${quotationId} approved. Order and invoice created.`,
        'success'
      );

      fetchDashboardData();
    } catch (error) {
      console.error('Approve quotation error:', error);
      addToast(error.response?.data?.error || 'Failed to approve quotation', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning text-dark',
      approved: 'bg-success',
      rejected: 'bg-danger',
      confirmed: 'bg-primary',
      in_transit: 'bg-info',
      delivered: 'bg-success',
      assigned: 'bg-warning text-dark',
      picked_up: 'bg-primary',
      paid: 'bg-success'
    };

    return badges[status] || 'bg-secondary';
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    return new Date(dateValue).toLocaleDateString();
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
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h2 className="fw-bold mb-1">🏨 Buyer Dashboard</h2>
              <p className="mb-0">
                Welcome back, {user?.name || 'Buyer'}.
              </p>
            </div>
          </div>
        </div>
      </div>

      {user?.id && (
        <div className="mb-4">
          <SustainabilityTicker buyerId={user.id} />
        </div>
      )}

      <div className="row mb-4">
        <div className="col-md-3 col-6 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h6>Orders</h6>
              <h3 className="text-success">{activeOrders.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h6>Quotations</h6>
              <h3 className="text-primary">{quotations.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h6>Invoices</h6>
              <h3 className="text-warning">{invoices.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h6>Deliveries</h6>
              <h3 className="text-info">{deliveries.length}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <nav className="nav nav-pills flex-wrap gap-2">
            {['overview', 'request', 'quotations', 'orders', 'invoices', 'deliveries'].map(tab => (
              <button
                key={tab}
                className={`nav-link ${activeTab === tab ? 'active bg-success' : 'text-success'}`}
                onClick={() => setActiveTab(tab)}
                style={{ border: '1px solid #198754' }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="card">
          <div className="card-header bg-white">
            <h5 className="mb-0">📊 Overview</h5>
          </div>

          <div className="card-body">
            <p>
              Use this dashboard to create produce requests, review quotations,
              approve quotations, view invoices, and track deliveries.
            </p>

            <div className="alert alert-info">
              <strong>Tip:</strong> Create a request first. Once Salesforce/backend creates a quotation,
              it will appear in the quotations tab.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'request' && (
        <div className="card">
          <div className="card-header bg-white">
            <h5 className="mb-0">📝 Create Produce Request</h5>
          </div>

          <div className="card-body">
            <form onSubmit={handleCreateRequest} className="row g-3">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Product name e.g. Tomatoes"
                  value={requestProduct}
                  onChange={(e) => setRequestProduct(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-3">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Quantity kg"
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
                  Create
                </button>
              </div>
            </form>

            {produceRequests.length > 0 && (
              <div className="mt-4">
                <h6>Recently Created Requests</h6>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Required Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {produceRequests.map(request => (
                        <tr key={request.id}>
                          <td>{request.id}</td>
                          <td>{request.product_name}</td>
                          <td>{Number(request.quantity_kg)} kg</td>
                          <td>{formatDate(request.required_date)}</td>
                          <td>
                            <span className={`badge ${getStatusBadge(request.status)}`}>
                              {request.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'quotations' && (
        <div className="card">
          <div className="card-header bg-white">
            <h5 className="mb-0">💬 Quotations</h5>
          </div>

          <div className="card-body">
            {quotations.length === 0 ? (
              <p className="text-muted text-center">No quotations yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Farmer</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {quotations.map(q => (
                      <tr key={q.id}>
                        <td>{q.id}</td>
                        <td>{q.farmer_name}</td>
                        <td>{q.product_name}</td>
                        <td>{Number(q.quantity_kg)} kg</td>
                        <td>Rs {Number(q.total_amount).toLocaleString()}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(q.status)}`}>
                            {q.status}
                          </span>
                        </td>
                        <td>
                          {q.status === 'pending' ? (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleApproveQuotation(q.id)}
                            >
                              Approve
                            </button>
                          ) : (
                            <span className="text-muted">No action</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="card">
          <div className="card-header bg-white">
            <h5 className="mb-0">📦 Orders</h5>
          </div>

          <div className="card-body">
            {activeOrders.length === 0 ? (
              <p className="text-muted text-center">No orders yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Farmer</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {activeOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.farmer_name}</td>
                        <td>{order.product_name}</td>
                        <td>{Number(order.quantity_kg)} kg</td>
                        <td>Rs {Number(order.total_amount).toLocaleString()}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="card">
          <div className="card-header bg-white">
            <h5 className="mb-0">🧾 Invoices</h5>
          </div>

          <div className="card-body">
            {invoices.length === 0 ? (
              <p className="text-muted text-center">No invoices yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Order</th>
                      <th>Farmer</th>
                      <th>Product</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {invoices.map(invoice => (
                      <tr key={invoice.id}>
                        <td>{invoice.id}</td>
                        <td>{invoice.order_id}</td>
                        <td>{invoice.farmer_name}</td>
                        <td>{invoice.product_name}</td>
                        <td>Rs {Number(invoice.amount).toLocaleString()}</td>
                        <td>{formatDate(invoice.due_date)}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'deliveries' && (
        <div className="card">
          <div className="card-header bg-white">
            <h5 className="mb-0">🚚 Deliveries</h5>
          </div>

          <div className="card-body">
            {deliveries.length === 0 ? (
              <p className="text-muted text-center">No deliveries yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Order</th>
                      <th>Driver</th>
                      <th>Product</th>
                      <th>Route</th>
                      <th>ETA</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {deliveries.map(delivery => (
                      <tr key={delivery.id}>
                        <td>{delivery.id}</td>
                        <td>{delivery.order_id}</td>
                        <td>{delivery.driver_name || 'Not assigned'}</td>
                        <td>{delivery.product_name}</td>
                        <td>{delivery.route || 'N/A'}</td>
                        <td>{delivery.eta || 'N/A'}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(delivery.status)}`}>
                            {delivery.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <FloatingChat currentPage="Buyer Dashboard" userRole="buyer" />
    </div>
  );
}

export default BuyerDashboard;