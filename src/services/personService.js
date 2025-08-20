import ApiService from './apiService';

class PersonService {
    static async getAllPersons() {
        try {
            const response = await ApiService.get('/persons');
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error fetching persons:', error);
            throw error;
        }
    }

    static async searchPersons(searchParams) {
        try {
            const queryString = new URLSearchParams(searchParams).toString();
            const response = await ApiService.get(`/persons/search?${queryString}`);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error searching persons:', error);
            throw error;
        }
    }

    static async getPersonById(id) {
        try {
            const response = await ApiService.get(`/persons/${id}`);
            return await ApiService.processResponse(response);
        } catch (error) {
            console.error('Error fetching person by ID:', error);
            throw error;
        }
    }

    static async checkDniExists(dni, dniCountryId) {
        try {
            const params = new URLSearchParams();
            params.append('dni', dni);
            if (dniCountryId) {
                params.append('dniCountryId', dniCountryId);
            }
            
            const response = await ApiService.get(`/persons/search?${params.toString()}`);
            const data = await ApiService.processResponse(response);
            return data && data.length > 0;
        } catch (error) {
            console.error('Error checking DNI:', error);
            throw error;
        }
    }

    static async checkEmailExists(email) {
        try {
            const response = await ApiService.get(`/persons/search?email=${email}`);
            const data = await ApiService.processResponse(response);
            return data && data.length > 0;
        } catch (error) {
            console.error('Error checking email:', error);
            throw error;
        }
        }
}

export default PersonService;
