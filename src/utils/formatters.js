export function formatCurrency(value) {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function parseISODate(value) {
  const match = String(value || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return new Date();
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function toISODateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateLabel(value) {
  if (!value) return '--';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(value).trim())
    ? parseISODate(value)
    : new Date(value);
  return new Intl.DateTimeFormat('es-EC', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateTimeLocal(date, hour) {
  return toGraphqlDateTime(date, hour);
}

/** HotChocolate DateTime exige ISO UTC: 2026-06-18T09:00:00.000Z */
export function toGraphqlDateTime(date, hour = '00:00') {
  const datePart = String(date || '').trim();
  const hourPart = String(hour || '00:00').trim();
  if (!datePart) return null;

  if (datePart.includes('T')) {
    if (/[zZ]|[+-]\d{2}:\d{2}$/.test(datePart)) return datePart;
    return `${datePart.replace(/\.\d+$/, '')}.000Z`;
  }

  const [hh = '00', mm = '00'] = hourPart.split(':');
  return `${datePart}T${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:00.000Z`;
}

export function calculateRentalDays(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
