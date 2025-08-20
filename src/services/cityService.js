import ApiService from './apiService';

class CityService {
    /**
     * Obtener todas las ciudades
     * @returns {Promise<Array>} Array con las ciudades
     */
    static async getAllCities() {
        try {
            const response = await ApiService.get('/cities');
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en CityService.getAllCities:', error);
            throw new Error('Error al obtener las ciudades');
        }
    }

    /**
     * Obtener una ciudad por ID
     * @param {string} id - ID de la ciudad
     * @returns {Promise<Object|null>} Ciudad o null si no existe
     */
    static async getCityById(id) {
        try {
            const response = await ApiService.get(`/cities/${id}`);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en CityService.getCityById:', error);
            throw new Error('Error al obtener la ciudad');
        }
    }

    /**
     * Buscar una ciudad por nombre
     * @param {string} name - Nombre de la ciudad
     * @returns {Promise<Object|null>} Ciudad o null si no existe
     */
    static async getCityByName(name) {
        try {
            const response = await ApiService.get(`/cities/search?name=${encodeURIComponent(name)}`);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en CityService.getCityByName:', error);
            throw new Error('Error al buscar las ciudades');
        }
    }

    /**
     * Buscar una ciudad por nombre
     * @param {string} name - Nombre de la ciudad
     * @returns {Promise<Object|null>} Ciudad o null si no existe
     */
    static async getCityByCountryId(countryId) {
        try {
            const response = await ApiService.get(`/cities/country/${countryId}`);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en CityService.getCityByCountryId:', error);
            throw new Error('Error al buscar la ciudad');
        }
    }
}

export default CityService; 