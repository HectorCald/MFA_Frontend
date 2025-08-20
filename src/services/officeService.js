import ApiService from './apiService';

class OfficeService {
    // Obtener todas las oficinas
    static async getAllOffices() {
        try {
            const response = await ApiService.get('/offices');
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en OfficeService.getAllOffices:', error);
            throw new Error('Error al obtener todas las oficinas');
        }
    }

    // Obtener oficina por ID
    static async getOfficeById(id) {
        try {
            const response = await ApiService.get(`/offices/${id}`);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en OfficeService.getOfficeById:', error);
            throw new Error('Error al obtener la oficina');
        }
    }

    // Obtener oficinas por cliente empresarial
    static async getOfficesByBusinessClientId(clientId) {
        try {
            const response = await ApiService.get(`/offices/client/${clientId}`);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en OfficeService.getOfficesByBusinessClientId:', error);
            throw new Error('Error al obtener las oficinas del cliente');
        }
    }

    // Obtener roles de una oficina específica
    static async getOfficeRoles(officeId, businessClientId) {
        try {
            const response = await ApiService.get(`/offices/${officeId}/roles/${businessClientId}`);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en OfficeService.getOfficeRoles:', error);
            throw new Error('Error al obtener los roles de la oficina');
        }
    }

    // Obtener tipos de oficina
    static async getOfficeTypes() {
        try {
            const response = await ApiService.get('/office-types');
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en OfficeService.getOfficeTypes:', error);
            throw new Error('Error al obtener los tipos de oficina');
        }
    }

    // Obtener conteo de oficinas por cliente
    static async getOfficeCountByBusinessClientId(clientId) {
        try {
            const response = await ApiService.get(`/offices/client/${clientId}/count`);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en OfficeService.getOfficeCountByBusinessClientId:', error);
            throw new Error('Error al obtener el conteo de oficinas del cliente');
        }
    }

    // Crear nueva oficina
    static async createOffice(officeData) {
        try {
            const response = await ApiService.post('/offices', officeData);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en OfficeService.createOffice:', error);
            throw new Error('Error al crear la oficina');
        }
    }

    // Actualizar oficina
    static async updateOffice(id, officeData) {
        try {
            const response = await ApiService.put(`/offices/${id}`, officeData);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en OfficeService.updateOffice:', error);
            throw new Error('Error al actualizar la oficina');
        }
    }

    // Desactivar oficina
    static async deactivateOffice(id, updatedBy) {
        try {
            const response = await ApiService.delete(`/offices/${id}`, {
                body: JSON.stringify({ updatedBy })
            });
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en OfficeService.deactivateOffice:', error);
            throw new Error('Error al desactivar la oficina');
        }
    }

    // Validar nombre de oficina duplicado para un cliente específico
    static async validateDuplicateOfficeName(officeName, clientId, excludeOfficeId = null) {
        try {
            // Obtener todas las oficinas del cliente
            const response = await ApiService.get(`/offices/client/${clientId}`);
            const offices = await ApiService.processResponse(response);
            
            if (offices) {
                // Buscar si existe una oficina con el mismo nombre (excluyendo la actual)
                const duplicateOffice = offices.find(office => 
                    office.name.toLowerCase() === officeName.toLowerCase() && 
                    office.id !== excludeOfficeId
                );
                
                if (duplicateOffice) {
                    return {
                        isDuplicate: true,
                        message: `El nombre "${officeName}" ya existe en este cliente`
                    };
                } else {
                    return {
                        isDuplicate: false,
                        message: null
                    };
                }
            }
            
            return {
                isDuplicate: false,
                message: null
            };
            
        } catch (error) {
            console.error('Error en OfficeService.validateDuplicateOfficeName:', error);
            throw new Error('Error al validar el nombre de la oficina');
        }
    }

    // Asignar rol de persona en una oficina
    static async assignPersonRole(roleData) {
        try {
            const response = await ApiService.post('/offices/assign-role', roleData);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en OfficeService.assignPersonRole:', error);
            throw new Error('Error al asignar el rol de persona en la oficina');
        }
    }
}

export default OfficeService;

