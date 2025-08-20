import ApiService from './apiService';

class BusinessClientTypeService {
    /**
     * Obtener todos los tipos de clientes empresariales
     * @returns {Promise<Array>} Array con los tipos de clientes
     */
    static async getAllTypes() {
        try {
            const response = await ApiService.get('/business-client-types');
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en BusinessClientTypeService.getAllTypes:', error);
            throw new Error('Error al obtener los tipos de clientes empresariales');
        }
    }

    /**
     * Obtener un tipo de cliente por ID
     * @param {string} id - ID del tipo de cliente
     * @returns {Promise<Object|null>} Tipo de cliente o null si no existe
     */
    static async getTypeById(id) {
        try {
            const response = await ApiService.get(`/business-client-types/${id}`);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en BusinessClientTypeService.getTypeById:', error);
            throw new Error('Error al obtener el tipo de cliente');
        }
    }

    /**
     * Buscar un tipo de cliente por nombre
     * @param {string} name - Nombre del tipo de cliente
     * @returns {Promise<Object|null>} Tipo de cliente o null si no existe
     */
    static async getTypeByName(name) {
        try {
            const response = await ApiService.get(`/business-client-types/search?name=${encodeURIComponent(name)}`);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en BusinessClientTypeService.getTypeByName:', error);
            throw new Error('Error al buscar el tipo de cliente');
        }
    }
}

export default BusinessClientTypeService; 