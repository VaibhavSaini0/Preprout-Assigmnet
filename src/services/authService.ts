import { api } from './httpClient';

export const authService = {
  async login(userId: string, password: string) {
    const response = await api.post('/auth/login', { userId, password });
    const isSuccess = response.data.status === 'success' || response.data.success === true;
    if (isSuccess) {
      localStorage.setItem('preproute_token', response.data.data.token);
      localStorage.setItem('preproute_user', JSON.stringify(response.data.data.user));
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    return {
      success: false,
      message: response.data.message || 'Login failed'
    };
  },

  logout() {
    localStorage.removeItem('preproute_token');
    localStorage.removeItem('preproute_user');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('preproute_token');
  },
};
