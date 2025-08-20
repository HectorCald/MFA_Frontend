import ApiService from './apiService';

class AuthService {

    static async login(credentials) {
        try {
            const response = await ApiService.post('/auth/login', credentials);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en AuthService.login:', error);
            throw error;
        }
    }

    static async logout() {
        try {
            const response = await ApiService.post('/auth/logout');
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en AuthService.logout:', error);
            throw error;
        }
    }
}

export default AuthService;
