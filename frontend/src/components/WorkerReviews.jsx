import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './WorkerReviews.css';

// Reusable Star component for ratings
const Stars = ({ rating }) => {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
  return (
    <span style={{ color: "#f97316", fontSize: 16 }}>
      {"★".repeat(safeRating)}{"☆".repeat(5 - safeRating)}
    </span>
  );
};

const serviceLabels = {
  acRepair: 'AC Repair',
  mechanicRepair: 'Mechanic Repair',
  electricalRepair: 'Electrical Repair',
  electronicRepair: 'Electronics Repair',
  plumber: 'Plumbing',
  packersMovers: 'Packers & Movers'
};

const WorkerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRating, setFilterRating] = useState('all'); // 'all', '5', '4plus'
  const [filterService, setFilterService] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/api/reviews`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to fetch reviews');

      setReviews(data.reviews || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Unable to load client feedback at this time.');
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredReviews = reviews.filter(r => {
    // Rating filter
    if (filterRating === '5' && r.rating !== 5) return false;
    if (filterRating === '4plus' && r.rating < 4) return false;

    // Service filter
    if (filterService !== 'all' && r.serviceType !== filterService) return false;

    return true;
  });

  return (
    <div className="cr-page">
      {/* ── HEADER ── */}
      <div className="cr-header-banner">
        <div className="cr-container">
          <Link to="/" className="cr-back-link">
            <span>←</span> Back to Home
          </Link>
          <div className="cr-title-group">
            <span className="cr-emoji">⭐</span>
            <h1>Client Feedback</h1>
            <p>Real reviews from customers who have used our professional services</p>
          </div>
        </div>
      </div>

      <div className="cr-container cr-main-content">

        {/* ── FILTERS ── */}
        <div className="cr-filters-card">
          <div className="cr-filter-group">
            <label>Filter by Service</label>
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="cr-select"
            >
              <option value="all">All Services</option>
              {Object.entries(serviceLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="cr-filter-group">
            <label>Filter by Rating</label>
            <div className="cr-rating-pills">
              <button
                className={`cr-pill ${filterRating === 'all' ? 'active' : ''}`}
                onClick={() => setFilterRating('all')}
              >
                All Ratings
              </button>
              <button
                className={`cr-pill ${filterRating === '5' ? 'active' : ''}`}
                onClick={() => setFilterRating('5')}
              >
                5 Stars Only
              </button>
              <button
                className={`cr-pill ${filterRating === '4plus' ? 'active' : ''}`}
                onClick={() => setFilterRating('4plus')}
              >
                4+ Stars
              </button>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="cr-loading">Loading reviews...</div>
        ) : error ? (
          <div className="cr-error">
            <span className="emoji">⚠️</span> {error}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="cr-empty">
            <span className="emoji">📝</span>
            <h3>No feedback found</h3>
            <p>Try adjusting your filters to see more reviews.</p>
            <button className="cr-clear-btn" onClick={() => { setFilterRating('all'); setFilterService('all'); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="cr-grid">
            {filteredReviews.map(review => (
              <div key={review._id} className="cr-card">
                <div className="cr-card-top">
                  <div className="cr-worker-info">
                    <strong>{review.workerName}</strong>
                  </div>
                  <Stars rating={review.rating} />
                </div>

                {review.comment && (
                  <div className="cr-comment">
                    "{review.comment}"
                  </div>
                )}

                <div className="cr-card-bottom">
                  <span className="cr-service-badge">
                    {serviceLabels[review.serviceType] || review.serviceType}
                  </span>
                  <div className="cr-meta">
                    <span className="cr-customer">
                      <span className="cr-avatar">
                        {review.customerName?.charAt(0)?.toUpperCase() || 'C'}
                      </span>
                      {review.customerName}
                    </span>
                    <span className="cr-date">
                      {new Date(review.jobDate || review.createdAt).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerReviews;