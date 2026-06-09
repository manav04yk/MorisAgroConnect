// src/pages/DeliveryDashboard.jsx
import React, { useEffect, useState } from 'react';
import FloatingChat from '../components/FloatingChat';
import Toast from '../components/Toast';

import {
  getDeliveries,
  updateDeliveryStatus as updateDeliveryStatusApi
} from '../utils/api';

function DeliveryDashboard() {
  const [user, setUser] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [driverStats, setDriverStats] = useState({
    completedToday: 0,
    totalDeliveries: 0,
    totalDistance: 0,
    rating: 5.0
  });
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

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

    fetchDeliveries();

    const interval = setInterval(fetchDeliveries, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);

      const response = await getDeliveries();

      const formattedDeliveries = response.data.map(delivery => ({
        id: delivery.id,
        orderId: delivery.order_id,
        buyer: delivery.buyer_name,
        buyerLocation: 'Buyer location',
        farmer: delivery.farmer_name,
        farmerLocation: 'Farmer location',
        product: delivery.product_name,
        quantity: Number(delivery.quantity_kg),
        status: delivery.status,
        eta: delivery.eta || 'N/A',
        distance: 'N/A',
        route: delivery.route || 'Route not available',
        orderStatus: delivery.order_status
      }));

      setDeliveries(formattedDeliveries);

      const completed = formattedDeliveries.filter(d => d.status === 'delivered').length;

      setDriverStats({
        completedToday: completed,
        totalDeliveries: formattedDeliveries.length,
        totalDistance: 0,
        rating: 5.0
      });

      setLoading(false);
    } catch (error) {
      console.error('Delivery fetch error:', error);
      addToast(error.response?.data?.error || 'Failed to load deliveries', 'error');
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (deliveryId, status) => {
    try {
      await updateDeliveryStatusApi(deliveryId, status);

      addToast(`Delivery marked as ${status}`, 'success');
      fetchDeliveries();
    } catch (error) {
      console.error('Update delivery error:', error);
      addToast(error.response?.data?.error || 'Failed to update delivery', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      assigned: 'bg-warning text-dark',
      picked_up: 'bg-primary',
      delivered: 'bg-success'
    };

    return badges[status] || 'bg-secondary';
  };

  const getStatusLabel = (status) => {
    const labels = {
      assigned: 'Assigned',
      picked_up: 'Picked Up',
      delivered: 'Delivered'
    };

    return labels[status] || status;
  };

  const getNextAction = (status) => {
    const actions = {
      assigned: {
        text: 'Mark as Picked Up',
        nextStatus: 'picked_up',
        color: 'btn-primary'
      },
      picked_up: {
        text: 'Mark as Delivered',
        nextStatus: 'delivered',
        color: 'btn-success'
      },
      delivered: {
        text: 'Completed',
        nextStatus: null,
        color: 'btn-secondary',
        disabled: true
      }
    };

    return actions[status] || actions.assigned;
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
              <h2 className="fw-bold mb-1">🚚 Delivery Dashboard</h2>
              <p className="mb-0">
                Welcome back, {user?.name || 'Driver'}.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3 col-6 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h6>Completed Today</h6>
              <h3 className="text-success">{driverStats.completedToday}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h6>Total Assigned</h6>
              <h3 className="text-primary">{driverStats.totalDeliveries}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h6>Total Distance</h6>
              <h3 className="text-info">{driverStats.totalDistance} km</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h6>Rating</h6>
              <h3 className="text-warning">{driverStats.rating} ⭐</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-white">
          <h5 className="mb-0">📦 Assigned Deliveries</h5>
        </div>

        <div className="card-body">
          {deliveries.length === 0 ? (
            <div className="text-center text-muted py-5">
              <h5>No deliveries assigned yet.</h5>
              <p>Assigned deliveries will appear here.</p>
            </div>
          ) : (
            <div className="row">
              {deliveries.map(delivery => {
                const nextAction = getNextAction(delivery.status);

                return (
                  <div className="col-lg-6 col-12 mb-4" key={delivery.id}>
                    <div className="card h-100 shadow-sm">
                      <div className="card-header bg-white d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Delivery #{delivery.id}</h6>
                        <span className={`badge ${getStatusBadge(delivery.status)}`}>
                          {getStatusLabel(delivery.status)}
                        </span>
                      </div>

                      <div className="card-body">
                        <p className="mb-2">
                          <strong>Order:</strong> #{delivery.orderId}
                        </p>

                        <p className="mb-2">
                          <strong>Product:</strong> {delivery.product}
                        </p>

                        <p className="mb-2">
                          <strong>Quantity:</strong> {delivery.quantity} kg
                        </p>

                        <p className="mb-2">
                          <strong>From Farmer:</strong> {delivery.farmer}
                        </p>

                        <p className="mb-2">
                          <strong>To Buyer:</strong> {delivery.buyer}
                        </p>

                        <p className="mb-2">
                          <strong>Route:</strong> {delivery.route}
                        </p>

                        <p className="mb-2">
                          <strong>ETA:</strong> {delivery.eta}
                        </p>

                        <p className="mb-2">
                          <strong>Order Status:</strong> {delivery.orderStatus}
                        </p>
                      </div>

                      <div className="card-footer bg-white">
                        <button
                          className={`btn ${nextAction.color} w-100`}
                          disabled={nextAction.disabled}
                          onClick={() => handleUpdateStatus(delivery.id, nextAction.nextStatus)}
                        >
                          {nextAction.text}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <FloatingChat currentPage="Delivery Dashboard" userRole="driver" />
    </div>
  );
}

export default DeliveryDashboard;