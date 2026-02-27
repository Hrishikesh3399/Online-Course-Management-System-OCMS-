// frontend/js/api.js

const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Global API Utility that automatically handles JWT injection, Content-Type, and parsing.
 * 
 * @param {string} endpoint - The API path (e.g. '/auth/login/')
 * @param {object} options - Fetch options { method, body, headers, requireAuth }
 */
async function fetchAPI(endpoint, options = {}) {
    const {
        method = 'GET',
        body = null,
        headers = {},
        requireAuth = true
    } = options;

    const config = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    if (requireAuth) {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        } else {
            console.warn("No access token found for authenticated request.");
            // If strictly enforced, we could redirect to login here:
            // window.location.href = '/index.html';
        }
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Handle 401 Unauthorized (Token expired)
        if (response.status === 401 && requireAuth) {
            console.warn("Token expired or invalid. Need to refresh token.");
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                // Retry initial request with new token
                config.headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
                const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, config);
                const retryData = await retryResponse.json().catch(() => ({}));
                return { ok: retryResponse.ok, status: retryResponse.status, data: retryData };
            } else {
                // Force logout if refresh fails
                logout();
                return { ok: false, status: 401, data: { detail: "Session expired." } };
            }
        }

        // Parse JSON safely
        const data = await response.json().catch(() => ({}));
        return { ok: response.ok, status: response.status, data };

    } catch (error) {
        console.error('API Fetch Error:', error);
        return { ok: false, status: 500, data: { detail: 'Network error connecting to API.' } };
    }
}

/**
 * Attempts to refresh the JWT token using the refresh_token stored in localStorage.
 */
async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
        const response = await fetch(`${API_BASE_URL}/accounts/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access);
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
}

/**
 * Helper to log the user out and clear tokens
 */
function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

/**
 * Check if user is currently logged in based on token existence
 */
function isAuthenticated() {
    return !!localStorage.getItem('access_token');
}

/**
 * Get current user object from localStorage
 */
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}
