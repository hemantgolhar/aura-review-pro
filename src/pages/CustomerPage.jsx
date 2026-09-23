import React, { useRef, useState } from 'react';
import { demoRestaurant } from '../data.js';
import { saveFeedback } from '../storage.js';
import CustomerReward from '../components/CustomerReward.jsx';

const improvementTags = ['Food', 'Service', 'Waiting Time', 'Cleanliness', 'Price', 'Staff Behaviour', 'Other'];
const enjoymentTags = ['Food', 'Service', 'Ambience', 'Staff', 'Cleanliness', 'Value for Money', 'Other'];
const ratingLabels = ['', 'Disappointing', 'Could be better', 'Okay', 'Good', 'Excellent'];

function generateReview(rating, tags, comment) {
  const openings = [
    '',
    `My experience at ${demoRestaurant.name} was disappointing.`,
    `My experience at ${demoRestaurant.name} could have been better.`,
    `My experience at ${demoRestaurant.name} was okay, with room for improvement.`,
    `I had a good experience at ${demoRestaurant.name}.`,
    `I had an excellent experience at ${demoRestaurant.name}.`,
  ];
  const topics = tags.map((tag) => tag === 'Other' ? 'other aspects of the visit' : tag.toLowerCase());
  const topicText = topics.length > 1 ? `${topics.slice(0, -1).join(', ')} and ${topics.at(-1)}` : topics[0];
  const detail = topics.length
    ? rating <= 3 ? `I'd like to see improvements in ${topicText}.` : `I especially enjoyed the ${topicText}.`
    : '';

  return [openings[rating], detail, comment.trim()].filter(Boolean).join(' ');
}

export default function CustomerPage() {
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState('');
  const [review, setReview] = useState('');
  const [notice, setNotice] = useState('');
  const reviewField = useRef(null);
  const submitted = useRef(false);
  const availableTags = rating <= 3 ? improvementTags : enjoymentTags;
  const googleUrl = /^https?:\/\//i.test(demoRestaurant.googleReviewUrl) ? demoRestaurant.googleReviewUrl : '#';

  function selectRating(value) {
    if (value === rating) return;
    if ((value <= 3) !== (rating <= 3)) setTags([]);
    setRating(value);
    setReview('');
  }

  function toggleTag(tag) {
    setTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]);
    setReview('');
  }

  function showReview() {
    if (!review) setReview(generateReview(rating, tags, comment));
    setNotice('');
    setStep(3);
  }

  async function copyReview() {
    try {
      await navigator.clipboard.writeText(review);
      setNotice('Review copied!');
    } catch {
      reviewField.current?.focus();
      reviewField.current?.select();
      setNotice('Copy is unavailable here. Please copy the selected review text manually.');
    }
  }

  function submitFeedback() {
    if (submitted.current) return;
    try {
      saveFeedback({
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        restaurantId: demoRestaurant.id,
        rating,
        tags,
        comment: comment.trim(),
        generatedReview: review,
        createdAt: new Date().toISOString(),
        status: rating <= 3 ? 'needs-attention' : 'normal',
      });
      submitted.current = true;
      setStep(4);
    } catch {
      setNotice('Your feedback could not be saved on this device. Please try again.');
    }
  }

  return (
    <main className="page customer-page">
      <header className="page-header customer-header">
        <p className="eyebrow">Aura Review Pro</p>
        <div className="restaurant-mark" aria-hidden="true">DR</div>
        <h1>{demoRestaurant.name}</h1>
      </header>
      <div className="flow-progress">
        <p className="muted" aria-live="polite">Step {step} of 4</p>
        <progress max="4" value={step} aria-label={`Step ${step} of 4`} />
      </div>
      <section className="card customer-card" aria-labelledby="step-title">
        {step === 1 && (
          <>
            <h2 className="customer-title" id="step-title">How was your experience?</h2>
            <p className="muted">Tap a star to share how your visit went.</p>
            <div className="stars" role="group" aria-label="Rate your experience">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  className={`star-button${value <= rating ? ' selected' : ''}`}
                  type="button"
                  key={value}
                  aria-label={`${value} ${value === 1 ? 'star' : 'stars'}`}
                  aria-pressed={rating === value}
                  onClick={() => selectRating(value)}
                >
                  <span aria-hidden="true">{value <= rating ? '★' : '☆'}</span>
                </button>
              ))}
            </div>
            <p className="rating-label" aria-live="polite">{rating ? `${rating} / 5 — ${ratingLabels[rating]}` : 'Choose your rating'}</p>
            <button className="button" type="button" disabled={!rating} onClick={() => setStep(2)}>Continue</button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="customer-title" id="step-title">{rating <= 3 ? 'What could we improve?' : 'What did you enjoy?'}</h2>
            <p className="muted">Choose any that apply, or just leave a comment.</p>
            <div className="feedback-tags" role="group" aria-label="Experience tags">
              {availableTags.map((tag) => (
                <button className={`tag-button${tags.includes(tag) ? ' selected' : ''}`} type="button" key={tag} aria-pressed={tags.includes(tag)} onClick={() => toggleTag(tag)}>
                  {tag}
                </button>
              ))}
            </div>
            <label className="field-label" htmlFor="comment">Your feedback <span className="muted">(optional)</span></label>
            <textarea className="customer-textarea" id="comment" rows="4" placeholder="Tell us a little about your visit…" value={comment} onChange={(event) => { setComment(event.target.value); setReview(''); }} />
            <div className="customer-actions">
              <button className="button button-secondary" type="button" onClick={() => setStep(1)}>Back</button>
              <button className="button" type="button" onClick={showReview}>Continue</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="customer-title" id="step-title">Your Review</h2>
            <p className="muted">Here’s a draft based on your feedback. Edit it to make it your own.</p>
            <label className="field-label" htmlFor="review">Review text</label>
            <textarea className="customer-textarea" id="review" ref={reviewField} rows="6" value={review} onChange={(event) => { setReview(event.target.value); setNotice(''); }} />
            <div className="review-actions">
              <button className="button button-secondary" type="button" disabled={!review.trim()} onClick={copyReview}>Copy Review</button>
              <a className="button button-secondary" href={googleUrl} target="_blank" rel="noopener noreferrer" onClick={(event) => {
                if (googleUrl === '#') {
                  event.preventDefault();
                  setNotice('The restaurant’s Google review link is not set up yet.');
                }
              }}>Review on Google</a>
            </div>
            <p className="form-message" role="status">{notice}</p>
            <div className="customer-actions">
              <button className="button button-secondary" type="button" onClick={() => setStep(2)}>Back</button>
              <button className="button" type="button" onClick={submitFeedback}>Continue</button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="thank-you-mark" aria-hidden="true">✓</div>
            <h2 className="customer-title" id="step-title">Thank you for your feedback</h2>
            <CustomerReward restaurantId={demoRestaurant.id} />
          </>
        )}
      </section>
    </main>
  );
}
