const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
    /**
     * Obtener el token de autenticación del localStorage
     * @returns {string|null} Token o null si no existe
     */
    static getAuthToken() {
        return localStorage.getItem('token');
    }

    /**
     * Verificar si el usuario está autenticado
     * @returns {boolean} true si está autenticado
     */
    static isAuthenticated() {
        const token = this.getAuthToken();
        return token !== null && token !== undefined;
    }

    /**
     * Obtener headers de autenticación
     * @returns {Object} Headers con token si existe
     */
    static getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };

        const token = this.getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Realizar petición HTTP con autenticación automática
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} options - Opciones de fetch
     * @returns {Promise<Response>} Response de fetch
     */
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        
        // Combinar headers por defecto con los proporcionados
        const headers = {
            ...this.getAuthHeaders(),
            ...options.headers
        };

        // Configuración por defecto
        const config = {
            headers,
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            // Si el token expiró o es inválido, redirigir al login
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
            }

            return response;
        } catch (error) {
            console.error('Error en ApiService.request:', error);
            throw error;
        }
    }

    /**
     * Realizar petición GET
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} options - Opciones adicionales
     * @returns {Promise<Response>} Response de fetch
     */
    static async get(endpoint, options = {}) {
        return this.request(endpoint, {
            method: 'GET',
            ...options
        });
    }

    /**
     * Realizar petición POST
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} data - Datos a enviar
     * @param {Object} options - Opciones adicionales
     * @returns {Promise<Response>} Response de fetch
     */
    static async post(endpoint, data = null, options = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : null,
            ...options
        });
    }

    /**
     * Realizar petición PUT
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} data - Datos a enviar
     * @param {Object} options - Opciones adicionales
     * @returns {Promise<Response>} Response de fetch
     */
    static async put(endpoint, data = null, options = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : null,
            ...options
        });
    }

    /**
     * Realizar petición DELETE
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} options - Opciones adicionales
     * @returns {Promise<Response>} Response de fetch
     */
    static async delete(endpoint, options = {}) {
        return this.request(endpoint, {
            method: 'DELETE',
            ...options
        });
    }

    /**
     * Realizar petición PATCH
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} data - Datos a enviar
     * @param {Object} options - Opciones adicionales
     * @returns {Promise<Response>} Response de fetch
     */
    static async patch(endpoint, data = null, options = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : null,
            ...options
        });
    }

    /**
     * Procesar respuesta de la API y extraer datos
     * @param {Response} response - Response de fetch
     * @returns {Promise<Object>} Datos procesados
     */
    static async processResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        // Si la API devuelve un formato estándar con success/data
        if (data.hasOwnProperty('success') && data.hasOwnProperty('data')) {
            if (!data.success) {
                throw new Error(data.message || 'Error en la operación');
            }
            return data.data;
        }

        // Si la API devuelve directamente los datos
        return data;
    }
}

export default ApiService;
