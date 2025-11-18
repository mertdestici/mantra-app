export const API_BASE = process.env.REACT_APP_API_BASE;

export const apiUrl = (path = '') => {
  if (!path.startsWith('/')) {
    return `${API_BASE}/${path}`;
  }
  return `${API_BASE}${path}`;
};
