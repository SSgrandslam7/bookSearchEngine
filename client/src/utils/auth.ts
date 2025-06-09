import { jwtDecode } from 'jwt-decode';

interface UserToken {
  name: string;
  exp: number;
}

class AuthService {
  getProfile() {
    return jwtDecode(this.getToken() || '');
  }

  loggedIn() {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isTokenExpired(token: string) {
    try {
      const decoded = jwtDecode<UserToken>(token);
      return decoded.exp < Date.now() / 1000;
    } catch {
      return false;
    }
  }

  getToken() {
    return localStorage.getItem('id_token');
  }

  login(idToken: string) {
    localStorage.setItem('id_token', idToken);
    window.location.assign('/');
  }

  logout() {
    localStorage.removeItem('id_token');
    window.location.assign('/');
  }
}

export default new AuthService();