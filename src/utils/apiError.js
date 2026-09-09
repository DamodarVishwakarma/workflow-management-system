const NETWORK_ERROR_PATTERN = /network error|timeout|ECONNREFUSED|ERR_NETWORK|Failed to fetch/i;
const FALLBACK_NETWORK_MESSAGE = 'Unable to reach the server. Please make sure the backend is running and try again.';

export function getApiErrorMessage(error) {
  if (error?.status === 'FETCH_ERROR') return FALLBACK_NETWORK_MESSAGE;

  const detail = error?.response?.data?.detail || error?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || item.message).filter(Boolean).join(', ');
  }
  if (typeof detail === 'string' && !NETWORK_ERROR_PATTERN.test(detail)) return detail;
  if (typeof error?.response?.data?.message === 'string') return error.response.data.message;
  if (typeof error?.data?.message === 'string') return error.data.message;
  if (typeof error?.message === 'string' && !NETWORK_ERROR_PATTERN.test(error.message)) return error.message;
  return FALLBACK_NETWORK_MESSAGE;
}