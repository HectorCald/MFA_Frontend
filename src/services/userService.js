import ApiService from './apiService';

class UserService {
    // Crear usuario
    static async createUser(userData) {
        try {
            const response = await ApiService.post('/users', userData);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    // Obtener todos los usuarios
    static async getAllUsers() {
        try {
            const response = await ApiService.get('/users');
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error getting users:', error);
            throw error;
        }
    }

    // Eliminar usuario
    static async deleteUser(userId) {
        try {
            const response = await ApiService.delete(`/users/${userId}`);
            return await ApiService.processResponse(response);
        }
        catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    // Obtener usuario por id
    static async getUserById(userId) {
        try {
            const response = await ApiService.get(`/users/${userId}`);
            return await ApiService.processResponse(response);
        }
        catch (error) {
            console.error('Error getting user by id:', error);
            throw error;
        }
    }

    // Actualizar usuario
    static async updateUser(userId, userData) {
        try {
            const response = await ApiService.put(`/users/${userId}`, userData);
            return await ApiService.processResponse(response);
        }
        catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    // Actualizar contraseña de usuario
    static async updateUserPassword(userId, password) {
        try {
            const response = await ApiService.put(`/users/password/${userId}`, { password });
            return await ApiService.processResponse(response);
        }
        catch (error) {
            console.error('Error updating user password:', error);
            throw error;
        }
    }

    // Desactivar usuario
    static async deactivateUser(userId) {
        try {
            const response = await ApiService.put(`/users/deactivate/${userId}`);
            return await ApiService.processResponse(response);
        }
        catch (error) {
            console.error('Error deactivating user:', error);
            throw error;
        }
    }

    // Activar usuario
    static async activateUser(userId) {
        try {
            const response = await ApiService.put(`/users/activate/${userId}`);
            return await ApiService.processResponse(response);
        }
        catch (error) {
            console.error('Error activating user:', error);
            throw error;
        }
    }
}

export default UserService;