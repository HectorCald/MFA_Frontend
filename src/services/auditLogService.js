import apiService from './apiService';

class AuditLogService {
    // Obtener audit logs por ID de persona
    static async getAuditLogsByPersonId(personId) {
        try {
            
            const response = await apiService.get(`/audit-logs/person/${personId}`);
            
            // Si response.data es undefined, intentar con response.json()
            if (response.data === undefined) {
                const jsonData = await response.json();
                return jsonData;
            }
            
            return response.data;
        } catch (error) {
            console.error('❌ Error al obtener audit logs por persona:', error);
            console.error('❌ Error completo:', error);
            throw error;
        }
    }

    // Crear nuevo registro de auditoría
    static async create(auditData) {
        try {
            const response = await apiService.post('/audit-logs', auditData);
            return response.data;
        } catch (error) {
            console.error('Error al crear audit log:', error);
            throw error;
        }
    }
}

export default AuditLogService;
