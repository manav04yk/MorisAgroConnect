// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-success text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h1 className="display-3 fw-bold mb-3">
                Moris AgroConnect
                <br />
                <span className="display-5">Planter to Plate</span>
              </h1>
              <p className="lead mb-4">
                AI-Powered Agricultural Procurement, Logistics & Sustainability Platform for Mauritius
              </p>
              <div className="d-flex gap-3">
                <Link to="/login" className="btn btn-light btn-lg px-4 fw-bold text-success">
                  Get Started
                </Link>
                <Link to="/register" className="btn btn-outline-light btn-lg px-4">
                  Create Account
                </Link>
              </div>
            </div>
            <div className="col-lg-5 text-center mt-4 mt-lg-0">
              <div className="bg-white text-dark rounded-circle p-4 d-inline-block shadow">
                <span className="display-1">🌾</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Section - 7 Pain Points */}
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="display-6 fw-bold">The Problem We're Solving</h2>
          <p className="lead text-muted">7 critical pain points in Mauritius agricultural supply chain</p>
        </div>
        
        {/* Row 1 - 4 items */}
        <div className="row g-3 mb-3">
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm border-0 bg-light">
              <div className="card-body text-center p-3">
                <div className="fs-1 mb-2">🧑‍🌾</div>
                <h6 className="fw-bold mb-1">Farmers</h6>
                <p className="small text-muted mb-0">No guaranteed buyers</p>
                <small className="text-danger">→ Rely on word of mouth</small>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm border-0 bg-light">
              <div className="card-body text-center p-3">
                <div className="fs-1 mb-2">🏨</div>
                <h6 className="fw-bold mb-1">Hotels & Restaurants</h6>
                <p className="small text-muted mb-0">Cannot find fresh local produce consistently</p>
                <small className="text-danger">→ Import or use distributors</small>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm border-0 bg-light">
              <div className="card-body text-center p-3">
                <div className="fs-1 mb-2">📞</div>
                <h6 className="fw-bold mb-1">Manual Procurement</h6>
                <p className="small text-muted mb-0">Slow and error-prone process</p>
                <small className="text-danger">→ Phone calls & spreadsheets</small>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm border-0 bg-light">
              <div className="card-body text-center p-3">
                <div className="fs-1 mb-2">🗑️</div>
                <h6 className="fw-bold mb-1">Food Waste</h6>
                <p className="small text-muted mb-0">Surplus produce gets discarded</p>
                <small className="text-danger">→ Donated or thrown away</small>
              </div>
            </div>
          </div>
        </div>
        
        {/* Row 2 - 3 items centered */}
        <div className="row g-3 justify-content-center">
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm border-0 bg-light">
              <div className="card-body text-center p-3">
                <div className="fs-1 mb-2">📍</div>
                <h6 className="fw-bold mb-1">No Delivery Visibility</h6>
                <p className="small text-muted mb-0">No live tracking available</p>
                <small className="text-danger">→ Call driver for updates</small>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm border-0 bg-light">
              <div className="card-body text-center p-3">
                <div className="fs-1 mb-2">🌪️</div>
                <h6 className="fw-bold mb-1">Cyclone Disruptions</h6>
                <p className="small text-muted mb-0">Weather breaks supply chains</p>
                <small className="text-danger">→ No backup plan</small>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm border-0 bg-light">
              <div className="card-body text-center p-3">
                <div className="fs-1 mb-2">📊</div>
                <h6 className="fw-bold mb-1">No Sustainability Reporting</h6>
                <p className="small text-muted mb-0">No automated ESG metrics</p>
                <small className="text-danger">→ Manual calculations</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solution Section - 9 AI Agents */}
      <div className="bg-light py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold">9 Autonomous AI Agents</h2>
            <p className="lead text-muted">Working Together to Transform Agriculture</p>
          </div>
          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <div className="text-center p-3">
                <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                  <span className="fs-1">📊</span>
                </div>
                <h6>1. Demand Forecast Agent</h6>
                <small className="text-muted">Predicts demand using weather & tourism data</small>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="text-center p-3">
                <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                  <span className="fs-1">🤝</span>
                </div>
                <h6>2. Supplier Matching Agent</h6>
                <small className="text-muted">Finds best-matched farmers by proximity</small>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="text-center p-3">
                <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                  <span className="fs-1">💬</span>
                </div>
                <h6>3. AI Negotiation Agent</h6>
                <small className="text-muted">Automatically negotiates fair prices</small>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="text-center p-3">
                <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                  <span className="fs-1">📄</span>
                </div>
                <h6>4. Procurement Agent</h6>
                <small className="text-muted">Generates quotations & purchase orders</small>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="text-center p-3">
                <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                  <span className="fs-1">💰</span>
                </div>
                <h6>5. Finance Agent</h6>
                <small className="text-muted">Generates invoices & payment records</small>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="text-center p-3">
                <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                  <span className="fs-1">🚚</span>
                </div>
                <h6>6. Logistics Agent</h6>
                <small className="text-muted">Assigns drivers & calculates shortest routes</small>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="text-center p-3">
                <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                  <span className="fs-1">🌪️</span>
                </div>
                <h6>7. Cyclone Risk Agent</h6>
                <small className="text-muted">Monitors weather & suggests alternatives</small>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="text-center p-3">
                <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                  <span className="fs-1">♻️</span>
                </div>
                <h6>8. Food Waste Agent</h6>
                <small className="text-muted">Lists surplus food & matches with buyers</small>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="text-center p-3">
                <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                  <span className="fs-1">📈</span>
                </div>
                <h6>9. Sustainability Agent</h6>
                <small className="text-muted">Calculates carbon savings & local sourcing</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-success text-white py-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-3 mb-3 mb-md-0">
              <div className="display-4 fw-bold">9</div>
              <div>AI Agents</div>
            </div>
            <div className="col-md-3 mb-3 mb-md-0">
              <div className="display-4 fw-bold">24/7</div>
              <div>Platform Access</div>
            </div>
            <div className="col-md-3 mb-3 mb-md-0">
              <div className="display-4 fw-bold">100%</div>
              <div>Local Sourcing Goal</div>
            </div>
            <div className="col-md-3 mb-3 mb-md-0">
              <div className="display-4 fw-bold">0%</div>
              <div>Food Waste Goal</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container py-5 text-center">
        <h2 className="display-6 fw-bold mb-3">Ready to Transform Agriculture in Mauritius?</h2>
        <p className="lead text-muted mb-4">Join Moris AgroConnect today</p>
        <Link to="/register" className="btn btn-success btn-lg px-5">
          Create Free Account →
        </Link>
      </div>
    </div>
  );
}

export default Home;
