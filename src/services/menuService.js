import ApiService from './apiService';

class MenuService {
    /**
     * Obtener menú del usuario autenticado (según sus permisos)
     * @returns {Promise<Array>} Estructura del menú jerárquico
     */
    static async getUserMenu() {
        try {
            console.log('🔍 Obteniendo menú del usuario...');
            
            const response = await ApiService.get('/menus/user');
            const menu = await ApiService.processResponse(response);
            
            console.log('✅ Menú obtenido:', menu);
            return menu;
        } catch (error) {
            console.error('❌ Error obteniendo menú del usuario:', error);
            throw new Error('Error al obtener el menú del usuario');
        }
    }

  
}

export default MenuService;
