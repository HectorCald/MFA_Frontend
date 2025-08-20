import ApiService from './apiService';

class BusinessClientRegistrationService {
    static async registerBusinessClient(formData) {
        try {
            console.log('Enviando datos al backend:', formData);
            
            const response = await ApiService.post('/business-client-registration/register', formData);
            const result = await ApiService.processResponse(response);
            console.log('Respuesta del backend:', result);
            
            return result;
        } catch (error) {
            console.error('Error en BusinessClientRegistrationService.registerBusinessClient:', error);
            throw error;
        }
    }

    static async getAllBusinessClients() {
        try {
            const response = await ApiService.get('/business-client-registration/all');
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error fetching business clients:', error);
            throw error;
        }
    }

    static async deleteBusinessClient(id) {
        try {
            console.log('Eliminando cliente empresarial con ID:', id);
            
            const response = await ApiService.delete(`/business-client-registration/${id}`);
            const result = await ApiService.processResponse(response);
            console.log('Respuesta del backend:', result);
            
            return result;
        } catch (error) {
            console.error('Error en BusinessClientRegistrationService.deleteBusinessClient:', error);
            throw error;
        }
    }

    static async validateDuplicate(fieldType, value, excludeId = null) {
        try {
            console.log(`Validando duplicado: ${fieldType} = ${value}, excluyendo ID: ${excludeId}`);
            
            const requestBody = {
                fieldType: fieldType,
                value: value
            };
            
            // Si se proporciona un ID para excluir, agregarlo al request
            if (excludeId) {
                requestBody.excludeId = excludeId;
            }
            
            const response = await ApiService.post('/business-client-registration/validate-duplicate', requestBody);
            const result = await ApiService.processResponse(response);
            
            console.log('Respuesta de validación:', result);
            return result;
        } catch (error) {
            console.error('Error en BusinessClientRegistrationService.validateDuplicate:', error);
            throw error;
        }
    }

    static async updateBusinessClient(id, formData) {
        try {
            console.log('Enviando datos de actualización al backend:', { id, formData });
            
            const response = await ApiService.put(`/business-client-registration/${id}`, formData);
            const result = await ApiService.processResponse(response);
            console.log('Respuesta del backend:', result);
            
            return result;
        } catch (error) {
            console.error('Error en BusinessClientRegistrationService.updateBusinessClient:', error);
            throw error;
        }
    }

    static async getBusinessClientById(id) {
        try {
            console.log('Obteniendo cliente empresarial con ID:', id);
            
            const response = await ApiService.get(`/business-client-registration/${id}`);
            const result = await ApiService.processResponse(response);
            console.log('Respuesta del backend:', result);
            
            return result;
        } catch (error) {
            console.error('Error en BusinessClientRegistrationService.getBusinessClientById:', error);
            throw error;
        }
    }

    static async getBusinessClientRoles(businessClientId) {
        try {
            console.log('Obteniendo roles del cliente empresarial:', businessClientId);
            
            const response = await ApiService.get(`/business-client-registration/${businessClientId}/roles`);
            const result = await ApiService.processResponse(response);
            console.log('Roles del cliente empresarial:', result);
            
            return result;
        } catch (error) {
            console.error('Error en BusinessClientRegistrationService.getBusinessClientRoles:', error);
            throw error;
        }
    }

    static async getRoleTypeIdByName(roleName) {
        try {
            console.log('Obteniendo ID del rol:', roleName);
            
            const response = await ApiService.get('/role-types');
            const result = await ApiService.processResponse(response);
            console.log('Roles obtenidos:', result);
            
            if (result) {
                const role = result.find(r => r.name === roleName);
                if (role) {
                    console.log('ID del rol encontrado:', role.id);
                    return role.id;
                } else {
                    throw new Error(`Rol '${roleName}' no encontrado`);
                }
            } else {
                throw new Error('Error al obtener los roles');
            }
        } catch (error) {
            console.error('Error obteniendo ID del rol:', error);
            throw error;
        }
    }

    static async createPerson(personData) {
        try {
            console.log('Creando nueva persona:', personData);
            
            const response = await ApiService.post('/persons', personData);
            const result = await ApiService.processResponse(response);
            console.log('Respuesta del backend:', result);
            
            return result;
        } catch (error) {
            console.error('Error en BusinessClientRegistrationService.createPerson:', error);
            throw error;
        }
    }

    static async getPersonsByBusinessClientId(businessClientId) {
        try {
            console.log('Obteniendo personas del cliente empresarial:', businessClientId);
            
            const response = await ApiService.get(`/persons/business-client/${businessClientId}`);
            const result = await ApiService.processResponse(response);
            console.log('Personas del cliente empresarial:', result);
            
            return result;
        } catch (error) {
            console.error('Error obteniendo personas del cliente empresarial:', error);
            throw error;
        }
    }
}

export default BusinessClientRegistrationService; 