import React, { useEffect, useState } from 'react';
import { getRewardConfig, saveRewardConfig } from '../storage.js';

const rewardTypes = [
  ['none', 'No Reward'], ['instant-discount', 'Instant Discount'],
  ['fixed-coupon', 'Fixed Coupon'], ['loyalty-points', 'Loyalty Points'],
  ['visit-based', 'Visit-Based Reward'], ['custom', 'Custom Reward'],
];
const commonFields = [
  ['rewardName', 'Reward name', 'text'],
  ['validityDays', 'Validity in days', 'number'],
  ['minimumBill', 'Minimum bill amount (₹)', 'number'],
  ['dailyLimit', 'Daily redemption limit (optional)', 'number', true],
  ['totalLimit', 'Total redemption limit (optional)', 'number', true],
];
const typeFields = {
  none: [],
  'instant-discount': [
    ['discountType', 'Discount type', 'select'],
    ['discountValue', 'Discount value', 'number'],
    ['maximumDiscount', 'Maximum discount amount (₹)', 'number'],
  ],
  'fixed-coupon': [
    ['couponTitle', 'Coupon title', 'text'],
    ['couponDescription', 'Coupon value/description', 'textarea'],
  ],
  'loyalty-points': [
    ['spendAmount', 'Spend amount required to earn points (₹)', 'number'],
    ['pointsEarned', 'Points earned', 'number'],
    ['pointsRequired', 'Points required for reward', 'number'],
    ['loyaltyReward', 'Reward value/description', 'textarea'],
  ],
  'visit-based': [
    ['visitsRequired', 'Number of visits required', 'number'],
    ['visitReward', 'Reward description', 'textarea'],
  ],
  custom: [['customTitle', 'Custom title', 'text'], ['customDescription', 'Custom description', 'textarea']],
};
const defaults = {
  rewardType: 'none', rewardName: '', active: false, validityDays: 30,
  minimumBill: 0, oneUsePerCustomer: false, dailyLimit: '', totalLimit: '',
  staffConfirmationRequired: false, discountType: 'percentage',
};
const templates = [
  {
    name: 'Repeat Visit', description: '10% OFF · Minimum ₹500 · Maximum ₹100 · 15 days',
    config: { rewardType: 'instant-discount', rewardName: 'Repeat Visit', discountType: 'percentage', discountValue: 10, minimumBill: 500, maximumDiscount: 100, validityDays: 15 },
  },
  {
    name: 'Free Dessert', description: 'Free dessert · Minimum ₹600 · 7 days',
    config: { rewardType: 'fixed-coupon', rewardName: 'Free Dessert', couponTitle: 'Free Dessert', couponDescription: 'Free dessert', minimumBill: 600, validityDays: 7 },
  },
  {
    name: 'Loyalty', description: '₹100 spent = 5 points · 100 points = ₹50 OFF',
    config: { rewardType: 'loyalty-points', rewardName: 'Loyalty', spendAmount: 100, pointsEarned: 5, pointsRequired: 100, loyaltyReward: '₹50 OFF' },
  },
  {
    name: 'Visit Stamp', description: '5 visits = Free item',
    config: { rewardType: 'visit-based', rewardName: 'Visit Stamp', visitsRequired: 5, visitReward: 'Free item' },
  },
];

export default function RewardSettings({ restaurantId }) {
  const [form, setForm] = useState(defaults);
  const [saved, setSaved] = useState(null);
  const [ready, setReady] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    setReady(false);
    try {
      const config = getRewardConfig(restaurantId);
      if (config && !rewardTypes.some(([type]) => type === config.rewardType)) throw new Error('Invalid reward type');
      setForm({ ...defaults, ...config });
      setSaved(config);
      setStorageError('');
      setReady(true);
    } catch {
      setStorageError('Unable to load reward settings. Reload to try again.');
    }
  }, [restaurantId]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
    setMessage('');
  }

  function useTemplate(config) {
    setForm({ ...defaults, ...config, active: true });
    setErrors({});
    setMessage('Template applied. Save to keep these settings.');
  }

  function save(event) {
    event.preventDefault();
    if (!ready) return;
    const next = { rewardType: form.rewardType, active: form.rewardType !== 'none' && form.active };
    const nextErrors = {};
    if (form.rewardType !== 'none') {
      for (const [key, , type, optional] of [...commonFields, ...typeFields[form.rewardType]]) {
        const value = String(form[key] ?? '').trim();
        if (!value && !optional) nextErrors[key] = 'Required.';
        else if (type === 'number' && value && (!Number.isFinite(Number(value)) || Number(value) < 0)) nextErrors[key] = 'Enter a number of 0 or more.';
        next[key] = type === 'number' ? (value ? Number(value) : null) : value;
      }
      next.oneUsePerCustomer = form.oneUsePerCustomer;
      next.staffConfirmationRequired = form.staffConfirmationRequired;
    }
    setErrors(nextErrors);
    setMessage('');
    if (Object.keys(nextErrors).length) return;
    try {
      saveRewardConfig(restaurantId, next);
      setSaved(next);
      setStorageError('');
      setMessage('Reward settings saved.');
    } catch {
      setStorageError('Unable to save reward settings. Please try again.');
    }
  }

  function field([key, label, type, optional]) {
    const props = {
      id: `reward-${key}`, value: form[key] ?? '', required: !optional,
      onChange: (event) => update(key, event.target.value),
      'aria-invalid': Boolean(errors[key]),
      'aria-describedby': errors[key] ? `reward-error-${key}` : undefined,
    };
    return (
      <div className="reward-field" key={key}>
        <label htmlFor={props.id}>{label}</label>
        {type === 'textarea' ? <textarea {...props} rows={3} /> : type === 'select' ? (
          <select {...props}>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed amount</option>
          </select>
        ) : <input {...props} type={type} min={type === 'number' ? 0 : undefined} step={type === 'number' ? 'any' : undefined} placeholder={optional ? 'No limit' : undefined} />}
        {errors[key] && <span className="reward-error" id={`reward-error-${key}`}>{errors[key]}</span>}
      </div>
    );
  }

  const savedType = rewardTypes.find(([type]) => type === (saved?.rewardType ?? 'none'))[1];
  return (
    <section className="reward-settings" aria-labelledby="rewards-heading">
      <h2 id="rewards-heading">Rewards</h2>
      <p className="reward-status">{ready ? `Current saved reward: ${savedType} · ${saved?.active && saved.rewardType !== 'none' ? 'Active' : 'Inactive'}` : 'Reward settings unavailable.'}</p>
      <p className="muted">Rewards are for feedback, visits or loyalty and are independent of Google reviews.</p>
      <div className="reward-templates">
        {templates.map((template) => (
          <article className="card reward-template" key={template.name}>
            <h3>{template.name}</h3>
            <p>{template.description}</p>
            <button className="button reward-secondary" type="button" disabled={!ready} aria-label={`Use Template: ${template.name}`} onClick={() => useTemplate(template.config)}>Use Template</button>
          </article>
        ))}
      </div>
      <form className="card reward-form" onSubmit={save} noValidate>
        <div className="reward-field">
          <label htmlFor="reward-type">Reward type</label>
          <select id="reward-type" value={form.rewardType} disabled={!ready} onChange={(event) => { update('rewardType', event.target.value); setErrors({}); }}>
            {rewardTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        {form.rewardType !== 'none' && <>
          <label className="reward-check"><input type="checkbox" checked={form.active} onChange={(event) => update('active', event.target.checked)} />Active</label>
          <div className="reward-grid">{commonFields.map(field)}</div>
          <label className="reward-check"><input type="checkbox" checked={form.oneUsePerCustomer} onChange={(event) => update('oneUsePerCustomer', event.target.checked)} />One use per customer</label>
          <label className="reward-check"><input type="checkbox" checked={form.staffConfirmationRequired} onChange={(event) => update('staffConfirmationRequired', event.target.checked)} />Staff confirmation required</label>
          <div className="reward-grid">{typeFields[form.rewardType].map(field)}</div>
        </>}
        {storageError && <p className="reward-error" role="alert">{storageError}</p>}
        {message && <p role="status">{message}</p>}
        <button className="button" type="submit" disabled={!ready}>Save Reward Settings</button>
      </form>
    </section>
  );
}
