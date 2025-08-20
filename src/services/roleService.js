import ApiService from './apiService';

class RoleService {
    static async getAllRoles() {
        try {
            const response = await ApiService.get('/roles');
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error fetching roles:', error);
            throw error;
        }
    }
    // Verificar si existe un rol con el código
    static async codeExists(code) {
        try {
            const response = await ApiService.get(`/roles/check-code/${code}`);
            const data = await ApiService.processResponse(response);
            return data.exists; // ← Devuelve true si existe, false si no
        } catch (error) {
            console.error('Error checking role code:', error);
            throw error;
        }
    }

    // Verificar si existe un rol con el nombre
    static async nameExists(name) {
        try {
            const response = await ApiService.get(`/roles/check-name/${encodeURIComponent(name)}`);
            const data = await ApiService.processResponse(response);
            return data.exists; // ← Devuelve true si existe, false si no
        } catch (error) {
            console.error('Error checking role name:', error);
            throw error;
        }
    }

    // Crear un nuevo rol
    static async createRole(roleData) {
        try {
            const rolePayload = {
                nombreRol: roleData.nombreRol,
                codigoRol: roleData.codigoRol,
                isActiveRol: roleData.isActiveRol,
                permisosSeleccionados: roleData.permisosSeleccionados,
                created_by: roleData.created_by
            };
            
            console.log('📝 Enviando datos para crear rol:', rolePayload);
            
            const response = await ApiService.post('/roles', rolePayload);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error creating role:', error);
            throw error;
        }
    }

    // Eliminar un rol
    static async deleteRole(roleId) {
        try {
            const response = await ApiService.delete(`/roles/${roleId}`);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error deleting role:', error);
            throw error;
        }
    }

    // Obtener información completa de un rol por ID
    static async getRoleById(roleId) {
        try {
            const response = await ApiService.get(`/roles/${roleId}`);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error getting role by ID:', error);
            throw error;
        }
    }

    // Actualizar un rol existente
    static async updateRole(roleId, roleData) {
        try {
            const rolePayload = {
                nombreRol: roleData.nombreRol,
                codigoRol: roleData.codigoRol,
                isActiveRol: roleData.isActiveRol,
                permisosSeleccionados: roleData.permisosSeleccionados,
                updated_by: roleData.updated_by
            };
            
            console.log('📝 Enviando datos para actualizar rol:', rolePayload);
            
            const response = await ApiService.put(`/roles/${roleId}`, rolePayload);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error updating role:', error);
            throw error;
        }
    }

    // Cambiar estado activo/inactivo de un rol
    static async toggleRoleStatus(roleId, isActive, updatedBy) {
        try {
            const statusPayload = {
                isActive: isActive,
                updated_by: updatedBy
            };
            
            console.log('📝 Cambiando estado del rol:', statusPayload);
            
            const response = await ApiService.patch(`/roles/${roleId}/toggle-status`, statusPayload);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error toggling role status:', error);
            throw error;
        }
    }
}



export default RoleService;