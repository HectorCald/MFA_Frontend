import ApiService from './apiService';

class CountryService {
    /**
     * Obtener todos los países
     * @returns {Promise<Array>} Array con los países
     */
    static async getAllCountries() {
        try {
            const response = await ApiService.get('/countries');
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en CountryService.getAllCountries:', error);
            throw new Error('Error al obtener los países');
        }
    }

    /**
     * Obtener un país por ID
     * @param {string} id - ID del país
     * @returns {Promise<Object|null>} País o null si no existe
     */
    static async getCountryById(id) {
        try {
            const response = await ApiService.get(`/countries/${id}`);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en CountryService.getCountryById:', error);
            throw new Error('Error al obtener el país');
        }
    }

    /**
     * Buscar un país por nombre
     * @param {string} name - Nombre del país
     * @returns {Promise<Object|null>} País o null si no existe
     */
    static async getCountryByName(name) {
        try {
            const response = await ApiService.get(`/countries/search?name=${encodeURIComponent(name)}`);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en CountryService.getCountryByName:', error);
            throw new Error('Error al buscar el país');
        }
    }
}

export default CountryService; 