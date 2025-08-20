import ApiService from './apiService';

class EventTypeService {
    /**
     * Obtener todos los tipos de eventos activos
     */
    static async getAllEventTypes() {
        try {
            const response = await ApiService.get('/event-types');
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en EventTypeService.getAllEventTypes:', error);
            throw error;
        }
    }

    /**
     * Obtener un tipo de evento por su código
     */
    static async getEventTypeByCode(code) {
        try {
            const response = await ApiService.get(`/event-types/code/${code}`);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en EventTypeService.getEventTypeByCode:', error);
            throw error;
        }
    }

    /**
     * Obtener un tipo de evento por su ID
     */
    static async getEventTypeById(id) {
        try {
            const response = await ApiService.get(`/event-types/${id}`);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en EventTypeService.getEventTypeById:', error);
            throw error;
        }
    }

    /**
     * Crear un nuevo tipo de evento
     */
    static async createEventType(eventTypeData) {
        try {
            const response = await ApiService.post('/event-types', eventTypeData);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en EventTypeService.createEventType:', error);
            throw error;
        }
    }

    /**
     * Actualizar un tipo de evento
     */
    static async updateEventType(id, eventTypeData) {
        try {
            const response = await ApiService.put(`/event-types/${id}`, eventTypeData);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en EventTypeService.updateEventType:', error);
            throw error;
        }
    }

    /**
     * Desactivar un tipo de evento
     */
    static async deactivateEventType(id) {
        try {
            const response = await ApiService.delete(`/event-types/${id}`);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error en EventTypeService.deactivateEventType:', error);
            throw error;
        }
    }
}

export default EventTypeService;
