/* Martins Realties — API client
   Talks to the live backend documented in the project README.
   Auth: JWT returned in the response body, stored in localStorage,
   sent as a Bearer token (backend also sets an httpOnly cookie as a fallback). */

const API_BASE = 'https://martinsrealties-backend.onrender.com/api/v1';
const TOKEN_KEY = 'mr_token';
const USER_KEY = 'mr_user';

const Auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t) => localStorage.setItem(TOKEN_KEY, t),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  getUser: () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  },
  setUser: (u) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
  clearUser: () => localStorage.removeItem(USER_KEY),
  isLoggedIn: () => !!Auth.getToken(),
  isAdmin: () => Auth.getUser()?.role === 'admin',
  logoutLocal: () => { Auth.clearToken(); Auth.clearUser(); },
};

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, { method = 'GET', body, isForm = false, auth = true } = {}) {
  const headers = {};
  if (!isForm) headers['Content-Type'] = 'application/json';
  if (auth && Auth.getToken()) headers['Authorization'] = `Bearer ${Auth.getToken()}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch (networkErr) {
    throw new ApiError('Unable to reach the server. Check your connection and try again.', 0, null);
  }

  let data = null;
  try { data = await res.json(); } catch { /* no body */ }

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    if (res.status === 401) { Auth.logoutLocal(); }
    throw new ApiError(message, res.status, data);
  }
  return data;
}

const Api = {
  // ---- Auth ----
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  updateMe: (payload) => request('/auth/me', { method: 'PATCH', body: payload }),
  updatePassword: (payload) => request('/auth/update-password', { method: 'PATCH', body: payload }),

  // ---- Properties ----
  getProperties: (query = '') => request(`/properties${query}`, { auth: false }),
  getFeatured: () => request('/properties/featured', { auth: false }),
  getProperty: (id) => request(`/properties/${id}`, { auth: false }),
  createProperty: (formData) => request('/properties', { method: 'POST', body: formData, isForm: true }),
  updateProperty: (id, formData) => request(`/properties/${id}`, { method: 'PATCH', body: formData, isForm: true }),
  deleteProperty: (id) => request(`/properties/${id}`, { method: 'DELETE' }),
  deletePropertyImage: (id, publicId) => request(`/properties/${id}/images/${encodeURIComponent(publicId)}`, { method: 'DELETE' }),

  // ---- Inquiries ----
  submitInquiry: (payload) => request('/inquiries', { method: 'POST', body: payload, auth: false }),
  getInquiries: (query = '') => request(`/inquiries${query}`),
  getInquiry: (id) => request(`/inquiries/${id}`),
  updateInquiry: (id, payload) => request(`/inquiries/${id}`, { method: 'PATCH', body: payload }),
  deleteInquiry: (id) => request(`/inquiries/${id}`, { method: 'DELETE' }),

  // ---- Reviews ----
  getReviews: () => request('/reviews', { auth: false }),
  getAdminReviews: (query = '') => request(`/reviews/admin${query}`),
  submitReview: (payload) => request('/reviews', { method: 'POST', body: payload }),
  updateReview: (id, payload) => request(`/reviews/${id}`, { method: 'PATCH', body: payload }),
  deleteReview: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),

  // ---- Cart ----
  getCart: () => request('/cart'),
  addToCart: (propertyId) => request('/cart/items', { method: 'POST', body: { propertyId } }),
  removeFromCart: (propertyId) => request(`/cart/items/${propertyId}`, { method: 'DELETE' }),
  clearCart: () => request('/cart', { method: 'DELETE' }),

  // ---- Orders ----
  checkout: (payload) => request('/orders/checkout', { method: 'POST', body: payload }),
  myOrders: () => request('/orders/my-orders'),
  getOrder: (id) => request(`/orders/${id}`),
  getAllOrders: (query = '') => request(`/orders${query}`),
  updateOrder: (id, payload) => request(`/orders/${id}`, { method: 'PATCH', body: payload }),

  // ---- Dashboard ----
  getStats: () => request('/dashboard/stats'),

  // ---- Users ----
  getUsers: (query = '') => request(`/users${query}`),
  getUser: (id) => request(`/users/${id}`),
  updateUser: (id, payload) => request(`/users/${id}`, { method: 'PATCH', body: payload }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};
