// src/pages/Marketplace.jsx
import React, { useState, useEffect } from 'react';
import FloatingChat from '../components/FloatingChat';

function Marketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      // Mock data - will be replaced with GET /api/waste
      setListings([
        {
          id: 1,
          farmer: "Jean-Pierre Farm",
          farmerLocation: "Riviere du Rempart",
          product: "Tomatoes",
          quantity: 20,
          originalPrice: 38,
          discountedPrice: 25,
          expiryDate: "2024-01-20",
          status: "available",
          reason: "Surplus harvest"
        },
        {
          id: 2,
          farmer: "Green Farms MU",
          farmerLocation: "Curepipe",
          product: "Lettuce",
          quantity: 15,
          originalPrice: 25,
          discountedPrice: 15,
          expiryDate: "2024-01-18",
          status: "available",
          reason: "Near expiry"
        },
        {
          id: 3,
          farmer: "Jean-Pierre Farm",
          farmerLocation: "Riviere du Rempart",
          product: "Carrots",
          quantity: 30,
          originalPrice: 20,
          discountedPrice: 12,
          expiryDate: "2024-01-21",
          status: "available",
          reason: "Overproduction"
        }
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching marketplace listings:', error);
    }
  };

  const handleReserve = async (listing) => {
    if (!user || user.role !== 'buyer') {
      alert('Please login as a buyer to reserve food');
      return;
    }
    
    try {
      // TODO: Replace with POST /api/waste
      alert(`✅ Reserved ${listing.quantity}kg of ${listing.product} from ${listing.farmer} at Rs ${listing.discountedPrice}/kg!\n\nFarmer will be notified.`);
      
      // Remove from listings or mark as reserved
      setListings(listings.filter(l => l.id !== listing.id));
    } catch (error) {
      console.error('Error reserving:', error);
      alert('Failed to reserve. Please try again.');
    }
  };

  const getExpiryBadge = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 1) return <span className="badge bg-danger">Expires Tomorrow!</span>;
    if (daysLeft <= 3) return <span className="badge bg-warning">Expires in {daysLeft} days</span>;
    return <span className="badge bg-info">Fresh</span>;
  };

  const filteredListings = filter === 'all' 
    ? listings 
    : listings.filter(l => l.product.toLowerCase().includes(filter.toLowerCase()));

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
    <div className="container mt-4 mb-5">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-warning bg-opacity-25 border-warning">
            <div className="card-body">
              <h2 className="text-center mb-2">♻️ Food Waste Marketplace</h2>
              <p className="text-center mb-0">
                Save surplus food from going to waste! Buy at discounted prices and help reduce food waste in Mauritius.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card bg-success text-white text-center">
            <div className="card-body">
              <div className="display-4">{listings.length}</div>
              <div>Available Listings</div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-info text-white text-center">
            <div className="card-body">
              <div className="display-4">
                {listings.reduce((sum, l) => sum + l.quantity, 0)} kg
              </div>
              <div>Food Saved from Waste</div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-primary text-white text-center">
            <div className="card-body">
              <div className="display-4">
                Rs {listings.reduce((sum, l) => sum + (l.originalPrice - l.discountedPrice) * l.quantity, 0)}
              </div>
              <div>Total Savings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-3">
              <strong>🔍 Quick Filter:</strong>
            </div>
            <div className="col-md-9">
              <div className="btn-group" role="group">
                <button 
                  className={`btn ${filter === 'all' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setFilter('all')}
                >
                  All Items
                </button>
                <button 
                  className={`btn ${filter === 'tomato' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setFilter('tomato')}
                >
                  🍅 Tomatoes
                </button>
                <button 
                  className={`btn ${filter === 'lettuce' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setFilter('lettuce')}
                >
                  🥬 Lettuce
                </button>
                <button 
                  className={`btn ${filter === 'carrot' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setFilter('carrot')}
                >
                  🥕 Carrots
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="row">
        {filteredListings.length === 0 ? (
          <div className="col-12 text-center py-5">
            <div className="display-1">🌱</div>
            <h4>No listings available</h4>
            <p className="text-muted">Check back later for surplus food deals!</p>
          </div>
        ) : (
          filteredListings.map(listing => (
            <div className="col-md-6 col-lg-4 mb-4" key={listing.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-header bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{listing.product}</h5>
                    {getExpiryBadge(listing.expiryDate)}
                  </div>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="text-muted small">From</div>
                    <strong>{listing.farmer}</strong>
                    <br />
                    <small className="text-muted">📍 {listing.farmerLocation}</small>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-muted small">Quantity Available</div>
                    <h4>{listing.quantity} kg</h4>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-muted small">Price</div>
                    <div>
                      <span className="text-decoration-line-through text-muted">
                        Rs {listing.originalPrice}/kg
                      </span>
                      <span className="fs-4 text-success fw-bold ms-2">
                        Rs {listing.discountedPrice}/kg
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-muted small">Reason for Discount</div>
                    <span className="badge bg-warning text-dark">{listing.reason}</span>
                  </div>
                  
                  <div className="alert alert-success alert-sm mb-0">
                    💰 Save Rs {(listing.originalPrice - listing.discountedPrice) * listing.quantity} on this purchase!
                  </div>
                </div>
                <div className="card-footer bg-white">
                  <button 
                    className="btn btn-success w-100"
                    onClick={() => handleReserve(listing)}
                    disabled={user?.role !== 'buyer'}
                  >
                    {user?.role === 'buyer' ? '🛒 Reserve Now' : '🔒 Login as Buyer to Reserve'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body">
              <h6 className="mb-2">💡 How It Works</h6>
              <ul className="small mb-0">
                <li>Farmers list surplus or near-expiry produce at discounted prices</li>
                <li>Hotels and restaurants can reserve food at up to 40% off</li>
                <li>Agent 8 (Food Waste Marketplace Agent) automatically matches surplus with demand</li>
                <li>Every kg saved = less food waste + more profit for farmers + savings for buyers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Chat */}
      <FloatingChat currentPage="Marketplace" userRole={user?.role || null} />
    </div>
  );
}

export default Marketplace;