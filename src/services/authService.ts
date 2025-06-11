import axios from 'axios';
import { User } from '../types';

const API_BASE_URL = 'http://localhost:3001';

class AuthService {
  async getAuthUrl(): Promise<string> {
    const response = await axios.get(`${API_BASE_URL}/auth/google`);
    return response.data.authUrl;
  }

  async getUser(sessionId: string): Promise<User> {
    const response = await axios.get(`${API_BASE_URL}/api/user`, {
      headers: { Authorization: `Bearer ${sessionId}` }
    });
    return response.data.user;
  }

  async logout(sessionId: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/api/logout`, {}, {
      headers: { Authorization: `Bearer ${sessionId}` }
    });
  }
}

export const authService = new AuthService();