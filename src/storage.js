export const FEEDBACK_STORAGE_KEY = 'aura-review-pro:feedback';

function readFeedback() {
  const feedback = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');
  if (!Array.isArray(feedback)) throw new Error('Invalid feedback data');
  return feedback;
}

function writeFeedback(feedback) {
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedback));
}

export function getFeedback(restaurantId) {
  return readFeedback().filter((item) => item.restaurantId === restaurantId);
}

export function saveFeedback(feedback) {
  const existing = readFeedback();
  if (existing.some((item) => item.id === feedback.id)) return;
  writeFeedback([feedback, ...existing]);
}

export function setFeedbackStatus(restaurantId, id, status) {
  writeFeedback(readFeedback().map((item) =>
    item.restaurantId === restaurantId && item.id === id ? { ...item, status } : item,
  ));
}

export function deleteFeedback(restaurantId, id) {
  writeFeedback(readFeedback().filter((item) => item.restaurantId !== restaurantId || item.id !== id));
}

export function getRewardConfig(restaurantId) {
  const stored = localStorage.getItem(`aura-review-pro:reward-config:${restaurantId}`);
  if (stored === null) return null;
  const config = JSON.parse(stored);
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Invalid reward settings');
  }
  return config;
}

export function saveRewardConfig(restaurantId, config) {
  localStorage.setItem(
    `aura-review-pro:reward-config:${restaurantId}`,
    JSON.stringify({ ...config, restaurantId }),
  );
}
