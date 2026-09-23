import React, { useEffect, useState } from 'react';
import { demoRestaurant } from '../data.js';
import RewardSettings from '../components/RewardSettings.jsx';
import { deleteFeedback, FEEDBACK_STORAGE_KEY, getFeedback, setFeedbackStatus } from '../storage.js';

const filters = ['All', 'Needs Attention', 'Resolved', '4–5 Star'];

export default function RestaurantAdmin() {
  const [feedback, setFeedback] = useState([]);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');

  function refreshFeedback() {
    try {
      setFeedback(getFeedback(demoRestaurant.id));
      setError('');
    } catch {
      setError('Unable to load feedback. Please check browser storage and try again.');
    }
  }

  useEffect(() => {
    refreshFeedback();
    function onStorage(event) {
      if (event.key === FEEDBACK_STORAGE_KEY || event.key === null) refreshFeedback();
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function updateFeedback(action) {
    try {
      action();
      refreshFeedback();
    } catch {
      setError('Unable to update feedback. Please try again.');
    }
  }

  const summaries = [
    ['Total Feedback', feedback.length],
    ['Average Rating', feedback.length ? (feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length).toFixed(1) : '—'],
    ['Low Rating Issues', feedback.filter((item) => item.status === 'needs-attention').length],
    ['5 Star Feedback', feedback.filter((item) => item.rating === 5).length],
  ];
  const visibleFeedback = feedback.filter((item) => (
    filter === 'All'
    || (filter === 'Needs Attention' && item.status === 'needs-attention')
    || (filter === 'Resolved' && item.status === 'resolved')
    || (filter === '4–5 Star' && item.rating >= 4)
  ));

  return (
    <main className="page admin-page">
      <header className="page-header">
        <p className="eyebrow">Aura Review Pro</p>
        <h1>{demoRestaurant.name} Dashboard</h1>
      </header>
      <div className="card-grid admin-summaries">
        {summaries.map(([label, value]) => (
          <section className="card" key={label}>
            <h2 className="card-title">{label}</h2>
            <p className="summary-value">{value}</p>
          </section>
        ))}
      </div>
      <section className="admin-feedback" aria-labelledby="feedback-heading">
        <h2 id="feedback-heading">Customer Feedback</h2>
        <div className="admin-filters" role="group" aria-label="Filter feedback">
          {filters.map((label) => (
            <button className={`filter-button${filter === label ? ' selected' : ''}`} key={label} type="button" aria-pressed={filter === label} onClick={() => setFilter(label)}>{label}</button>
          ))}
        </div>
        {error && <p className="admin-error" role="alert">{error}</p>}
        {!error && feedback.length === 0 && <p className="muted">No customer feedback yet.</p>}
        {feedback.length > 0 && visibleFeedback.length === 0 && <p className="muted">No feedback matches this filter.</p>}
        <div className="feedback-list">
          {visibleFeedback.map((item) => (
            <article className={`card feedback-card${item.status === 'needs-attention' ? ' needs-attention' : ''}`} key={item.id}>
              <div className="feedback-heading">
                <p className="feedback-rating" aria-label={`${item.rating} out of 5 stars`}><span aria-hidden="true">{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span> {item.rating}/5</p>
                <span className={`feedback-status ${item.status}`}>{item.status === 'resolved' ? 'Resolved' : item.status === 'needs-attention' ? 'Needs Attention' : 'Normal'}</span>
              </div>
              {item.tags.length > 0 && <div className="admin-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
              {item.comment && <p className="feedback-comment">{item.comment}</p>}
              <time className="muted" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>
              <div className="feedback-actions">
                {item.rating <= 3 && item.status !== 'resolved' && <button className="button" type="button" onClick={() => updateFeedback(() => setFeedbackStatus(demoRestaurant.id, item.id, 'resolved'))}>Mark Resolved</button>}
                <button className="button delete-button" type="button" onClick={() => updateFeedback(() => deleteFeedback(demoRestaurant.id, item.id))}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <RewardSettings restaurantId={demoRestaurant.id} />
      <div className="card-grid admin-settings">
        {['Google Review Setup'].map((section) => (
          <section className="card" key={section}>
            <h2 className="card-title">{section}</h2>
            <p className="muted">Coming soon</p>
          </section>
        ))}
      </div>
    </main>
  );
}
