import React, { useState } from 'react';
import { getRewardConfig } from '../storage.js';

const isText = (value) => typeof value === 'string' && value.trim().length > 0;
const isNumber = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const currency = (value) => value.toLocaleString('en-IN', {
  style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2,
});

export default function CustomerReward({ restaurantId }) {
  const [config] = useState(() => {
    try { return getRewardConfig(restaurantId); } catch { return null; }
  });
  const fallback = <p className="muted">Your feedback helps us improve.</p>;
  if (!config || config.active !== true || !isText(config.rewardName) || !isNumber(config.validityDays)) return fallback;
  const minimumBill = config.minimumBill === undefined ? 0 : config.minimumBill;
  if (!isNumber(minimumBill)) return fallback;

  let title = config.rewardName;
  let headline;
  let description;
  switch (config.rewardType) {
    case 'instant-discount':
      if (!['percentage', 'fixed'].includes(config.discountType) || !isNumber(config.discountValue)
        || (config.maximumDiscount != null && !isNumber(config.maximumDiscount))) return fallback;
      headline = `${config.discountType === 'percentage' ? `${config.discountValue}%` : currency(config.discountValue)} OFF on your next visit`;
      break;
    case 'fixed-coupon':
      if (!isText(config.couponTitle) || !isText(config.couponDescription)) return fallback;
      title = config.couponTitle;
      headline = config.couponDescription;
      break;
    case 'loyalty-points':
      if (![config.spendAmount, config.pointsEarned, config.pointsRequired].every(isNumber) || !isText(config.loyaltyReward)) return fallback;
      headline = `Earn ${config.pointsEarned} points for every ${currency(config.spendAmount)} spent`;
      description = `${config.pointsRequired} points = ${config.loyaltyReward}`;
      break;
    case 'visit-based':
      if (!isNumber(config.visitsRequired) || !isText(config.visitReward)) return fallback;
      headline = `Complete ${config.visitsRequired} visits and get ${config.visitReward}`;
      break;
    case 'custom':
      if (!isText(config.customTitle) || !isText(config.customDescription)) return fallback;
      title = config.customTitle;
      headline = config.customDescription;
      break;
    default:
      return fallback;
  }

  return (
    <>
      <p className="muted">You've received a reward</p>
      <article className="card customer-reward" aria-labelledby="customer-reward-title">
        <h3 id="customer-reward-title">{title}</h3>
        <p className="reward-headline">{headline}</p>
        {description && <p>{description}</p>}
        <div className="reward-details">
          {(config.rewardType === 'instant-discount' || minimumBill > 0) && <p>Minimum bill {currency(minimumBill)}</p>}
          {config.rewardType === 'instant-discount' && config.maximumDiscount != null && <p>Maximum discount {currency(config.maximumDiscount)}</p>}
          <p>Valid for {config.validityDays} days</p>
        </div>
        <p className="reward-note">Show this reward at the restaurant.</p>
      </article>
    </>
  );
}
