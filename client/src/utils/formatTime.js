export const formatMinutes = (minutes) => {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

export const formatHours = (minutes) => {
  const h = Math.floor(minutes / 60);
  return `${h.toLocaleString()}h`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'TBA';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatYear = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).getFullYear();
};

export const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const formatCountdown = (dateStr) => {
  const days = daysUntil(dateStr);
  if (days === null) return 'TBA';
  if (days < 0) return 'Aired';
  if (days === 0) return 'TODAY';
  if (days === 1) return 'TOMORROW';
  return `${days} DAYS`;
};

export const getProgressPercent = (watched, total) => {
  if (!total || total === 0) return 0;
  return Math.round((watched / total) * 100);
};
