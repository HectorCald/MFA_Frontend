import styles from "./BuscarPersona.module.css";
import { FaSearch, FaTimes } from "react-icons/fa";
import InputSearch from "../common/InputSearch";
import Table from "./Table";
import { useState, useEffect } from "react";
import PersonService from "../../services/personService";

function BuscarPersona({ onClose, onPersonSelect }) {
    const [persons, setPersons] = useState([]);
    const [filteredPersons, setFilteredPersons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchBlocks, setSearchBlocks] = useState([]);

    // Cargar todas las personas al montar el componente
    useEffect(() => {
        loadAllPersons();
    }, []);

    // Filtrar personas cuando cambien los bloques de búsqueda
    useEffect(() => {
        if (searchBlocks.length === 0) {
            setFilteredPersons(persons);
        } else {
            // Realizar búsqueda con todos los bloques
            performSearch(searchBlocks);
        }
    }, [searchBlocks, persons]);

    const loadAllPersons = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await PersonService.getAllPersons();
            if (response.success) {
                setPersons(response.data);
                setFilteredPersons(response.data);
            } else {
                setError('Error al cargar las personas');
            }
        } catch (error) {
            console.error('Error loading persons:', error);
            setError('Error al cargar las personas');
        } finally {
            setLoading(false);
        }
    };

    const performSearch = async (blocks) => {
        if (blocks.length === 0) {
            await loadAllPersons();
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            // Usar el primer bloque como término de búsqueda principal
            const searchTerm = blocks[0];
            const response = await PersonService.searchPersons({ searchTerm });
            
            if (response.success) {
                let results = response.data;
                
                // Aplicar filtros adicionales si hay más bloques
                if (blocks.length > 1) {
                    results = results.filter(person => {
                        return blocks.every(block => 
                            person.first_name?.toLowerCase().includes(block.toLowerCase()) ||
                            person.last_name?.toLowerCase().includes(block.toLowerCase()) ||
                            person.email?.toLowerCase().includes(block.toLowerCase()) ||
                            person.dni?.toLowerCase().includes(block.toLowerCase())
                        );
                    });
                }
                
                setFilteredPersons(results);
            } else {
                setError('Error en la búsqueda');
            }
        } catch (error) {
            console.error('Error searching persons:', error);
            setError('Error en la búsqueda');
        } finally {
            setLoading(false);
        }
    };

    const handlePersonSelect = (person) => {
        if (onPersonSelect) {
            onPersonSelect(person);
        }
        if (onClose) {
            onClose();
        }
    };

    const formatPersonData = (persons) => {
        return persons.map(person => [
            `${person.first_name || ''} ${person.last_name || ''}`.trim(),
            person.email || '',
            person.dni || '',
            person.birthdate ? new Date(person.birthdate).toLocaleDateString() : '',
            // Solo mostrar el nombre de la empresa cliente
            person.business_client_name || 'Sin empresa asignada',
            person.debt || '0',
            person.is_active ? 'Activo' : 'Inactivo',
            person.country_name || '',
            person.city_name || '',
            <button 
                key={person.id}
                onClick={() => handlePersonSelect(person)}
                className={styles.selectButton}
            >
                Seleccionar
            </button>
        ]);
    };

    const headers = ["Nombre", "Email", "DNI/CI", "Nacimiento", "Cliente Empresa", "Deuda", "Estado", "Pais", "Ciudad", "Acciones"];

    return (
        <div className={styles.buscarPersonaContainer}>
            <div className={styles.buscarPersona}>
                <div className={styles.closeButton} onClick={onClose}>
                    <FaTimes />
                </div>
                <h2 className={styles.buscarPersonaTitle}>Buscar persona</h2>
                
                <InputSearch 
                    type="text" 
                    placeholder="Buscar por nombre, email o DNI..." 
                    onSearchBlocks={setSearchBlocks}
                />
                
                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}
                
                <div className={styles.informacionContainer}>
                    {loading ? (
                        <div className={styles.loading}>Cargando personas...</div>
                    ) : (
                        <Table 
                            headers={headers}
                            data={formatPersonData(filteredPersons)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default BuscarPersona;
