import ApiService from './apiService';

class PermissionService {
    static async getAllPermissions() {
        try {
            const response = await ApiService.get('/permissions');
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error fetching permissions:', error);
            throw error;
        }
    }
}

export default PermissionService;