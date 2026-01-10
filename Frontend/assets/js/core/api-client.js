/**
 * Improved API Client
 * Features: Retry logic, request caching, interceptors, error handling
 */

class ApiClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || 'http://127.0.0.1:8000';
    this.defaultTimeout = config.timeout || 30000;
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000;
    this.cache = new Map();
    this.cacheTimeout = config.cacheTimeout || 60000; // 1 minute default

    // Request/Response interceptors
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  /**
   * Get access token
   */
  getToken() {
    // Try sessionStorage first (more secure), fallback to localStorage
    return sessionStorage.getItem('token') || localStorage.getItem('token');
  }

  /**
   * Set access token
   */
  setToken(token) {
    sessionStorage.setItem('token', token);
  }

  /**
   * Clear token
   */
  clearToken() {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
  }

  /**
   * Get refresh token
   */
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Logout user
   */
  logout() {
    this.clearToken();
    localStorage.removeItem('refreshToken');
    window.location.href = '/pages/login.html';
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token) {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp < now;
    } catch (e) {
      return true;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    this.setToken(data.access_token);

    return data.access_token;
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Build request options
   */
  buildOptions(options = {}) {
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return {
      ...options,
      headers
    };
  }

  /**
   * Apply request interceptors
   */
  async applyRequestInterceptors(url, options) {
    let request = { url, options };

    for (const interceptor of this.requestInterceptors) {
      request = await interceptor(request) || request;
    }

    return request;
  }

  /**
   * Apply response interceptors
   */
  async applyResponseInterceptors(response, url) {
    let result = response;

    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(result, url) || result;
    }

    return result;
  }

  /**
   * Get cache key for request
   */
  getCacheKey(method, url, options) {
    return `${method}:${url}:${JSON.stringify(options.body || '')}`;
  }

  /**
   * Get cached response
   */
  getCached(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.expires) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  /**
   * Cache response
   */
  setCache(cacheKey, data, timeout = this.cacheTimeout) {
    this.cache.set(cacheKey, {
      data,
      expires: Date.now() + timeout
    });
  }

  /**
   * Clear cache
   */
  clearCache(pattern) {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    // Clear matching cache entries
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Sleep for retry delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make HTTP request with retry logic
   */
  async fetch(url, options = {}) {
    const method = options.method || 'GET';
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    // Apply request interceptors
    const { url: interceptedUrl, options: interceptedOptions } =
      await this.applyRequestInterceptors(fullUrl, this.buildOptions(options));

    // Check cache for GET requests
    if (method === 'GET' && !options.skipCache) {
      const cacheKey = this.getCacheKey(method, interceptedUrl, interceptedOptions);
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Retry logic
    let lastError;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.defaultTimeout);

        const response = await fetch(interceptedUrl, {
          ...interceptedOptions,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Handle 401 - try to refresh token
        if (response.status === 401 && attempt === 0 && this.getRefreshToken()) {
          try {
            await this.refreshToken();
            // Update headers with new token and retry
            interceptedOptions.headers['Authorization'] = `Bearer ${this.getToken()}`;
            continue;
          } catch (e) {
            this.logout();
            throw new Error('Session expired');
          }
        }

        // Handle other error statuses
        if (!response.ok) {
          // Don't retry for client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            const errorData = await this.parseError(response);
            throw new ApiError(errorData?.detail || response.statusText, response.status, response.url);
          }

          // Retry for server errors (5xx)
          if (attempt < this.maxRetries) {
            await this.sleep(this.retryDelay * Math.pow(2, attempt)); // Exponential backoff
            continue;
          }
        }

        // Parse response
        const data = await response.json();

        // Cache successful GET requests
        if (method === 'GET' && response.ok && !options.skipCache) {
          const cacheKey = this.getCacheKey(method, interceptedUrl, interceptedOptions);
          this.setCache(cacheKey, data, options.cacheTimeout);
        }

        // Apply response interceptors
        return await this.applyResponseInterceptors(data, interceptedUrl);

      } catch (error) {
        lastError = error;

        // Don't retry for abort or network errors that won't be fixed by retrying
        if (error.name === 'AbortError' || error instanceof ApiError) {
          throw error;
        }

        // Retry for network errors
        if (attempt < this.maxRetries) {
          await this.sleep(this.retryDelay * Math.pow(2, attempt));
        }
      }
    }

    throw lastError;
  }

  /**
   * Parse error response
   */
  async parseError(response) {
    try {
      return await response.json();
    } catch (e) {
      return { detail: response.statusText };
    }
  }

  // Convenience methods

  get(url, options = {}) {
    return this.fetch(url, { ...options, method: 'GET' });
  }

  post(url, data, options = {}) {
    return this.fetch(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(url, data, options = {}) {
    return this.fetch(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  patch(url, data, options = {}) {
    return this.fetch(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  delete(url, options = {}) {
    return this.fetch(url, { ...options, method: 'DELETE' });
  }

  /**
   * Upload file with progress
   */
  upload(url, formData, options = {}) {
    return new Promise((resolve, reject) => {
      const token = this.getToken();
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (options.onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            options.onProgress((e.loaded / e.total) * 100);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (e) {
            resolve(xhr.responseText);
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new ApiError(error.detail || xhr.statusText, xhr.status, url));
          } catch (e) {
            reject(new ApiError(xhr.statusText, xhr.status, url));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', url.startsWith('http') ? url : `${this.baseURL}${url}`);

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  }
}

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(message, status, url) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
  }
}

// Global API client instance and export for non-module scripts
if (typeof window !== 'undefined') {
  window.api = new ApiClient();
  // Backwards compatibility
  window.apiFetch = (url, options) => window.api.fetch(url, options);
  window.API_URL = window.api.baseURL;
}
