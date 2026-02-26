/**
 * SmartBuy — API Service
 * Centralised Axios instance for all backend API calls.
 */
import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

// ── Dataset Upload ────────────────────────────────────────────────
export const uploadDataset = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload_dataset', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// ── Customer Clusters ─────────────────────────────────────────────
export const getClusters = () => api.get('/clusters');

// ── Trends ────────────────────────────────────────────────────────
export const getTrends = (window = '24h') =>
    api.get(`/trends?window=${window}`);

// ── Recommendations ───────────────────────────────────────────────
export const getRecommendations = (customerId) => {
    const params = customerId ? `?customer_id=${customerId}` : '';
    return api.get(`/recommendations${params}`);
};

// ── Drift Report ──────────────────────────────────────────────────
export const getDriftReport = () => api.get('/drift_report');

export default api;
