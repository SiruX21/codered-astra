const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }
    return response.json();
  }

  // Auth endpoints
  async register(email, password, name) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password, name })
    });
    const data = await this.handleResponse(response);
    this.setToken(data.token);
    return data;
  }

  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password })
    });
    const data = await this.handleResponse(response);
    this.setToken(data.token);
    return data;
  }

  async getCurrentUser() {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  logout() {
    this.setToken(null);
  }

  // Fursona endpoints
  async generateFursona(imageBase64) {
    const response = await fetch(`${API_URL}/fursona/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ image: imageBase64 })
    });
    return this.handleResponse(response);
  }

  async getFursonaHistory() {
    const response = await fetch(`${API_URL}/fursona/history`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  // Subscription endpoints
  async getPlans() {
    const response = await fetch(`${API_URL}/subscription/plans`);
    return this.handleResponse(response);
  }

  async getCurrentSubscription() {
    const response = await fetch(`${API_URL}/subscription/current`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async createCheckoutSession(priceId, planType) {
    const response = await fetch(`${API_URL}/subscription/create-checkout`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ priceId, planType })
    });
    return this.handleResponse(response);
  }

  async createPortalSession() {
    const response = await fetch(`${API_URL}/subscription/create-portal`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }
}

export default new ApiService();
