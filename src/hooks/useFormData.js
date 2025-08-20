import { useState, useEffect } from 'react';
import BusinessClientTypeService from '../services/businessClientTypeService';
import CountryService from '../services/countryService';
import CityService from '../services/cityService';

export const useFormData = (formValues) => {
    // Estados para tipos de clientes empresariales
    const [businessClientTypes, setBusinessClientTypes] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(true);
    const [errorTypes, setErrorTypes] = useState(null);

    // Estados para países
    const [countries, setCountries] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [errorCountries, setErrorCountries] = useState(null);

    // Estados separados para ciudades de cada sección
    const [citiesGerente, setCitiesGerente] = useState([]);
    const [loadingCitiesGerente, setLoadingCitiesGerente] = useState(false);
    const [errorCitiesGerente, setErrorCitiesGerente] = useState(null);

    const [citiesOficina, setCitiesOficina] = useState([]);
    const [loadingCitiesOficina, setLoadingCitiesOficina] = useState(false);
    const [errorCitiesOficina, setErrorCitiesOficina] = useState(null);

    const [citiesResponsable, setCitiesResponsable] = useState([]);
    const [loadingCitiesResponsable, setLoadingCitiesResponsable] = useState(false);
    const [errorCitiesResponsable, setErrorCitiesResponsable] = useState(null);

    const [citiesContable, setCitiesContable] = useState([]);
    const [loadingCitiesContable, setLoadingCitiesContable] = useState(false);
    const [errorCitiesContable, setErrorCitiesContable] = useState(null);

    // Cargar tipos de clientes empresariales al montar el componente
    useEffect(() => {
        const loadBusinessClientTypes = async () => {
            try {
                setLoadingTypes(true);
                setErrorTypes(null);

                const types = await BusinessClientTypeService.getAllTypes();

                setBusinessClientTypes(types);

            } catch (error) {
                console.error('❌ Error al cargar tipos de clientes:', error);
                setErrorTypes(error.message);
            } finally {
                setLoadingTypes(false);
            }
        };

        loadBusinessClientTypes();
    }, []);

    // Cargar países al montar el componente
    useEffect(() => {
        const loadCountries = async () => {
            try {
                setLoadingCountries(true);
                setErrorCountries(null);

                const countriesData = await CountryService.getAllCountries();

                setCountries(countriesData);

            } catch (error) {
                console.error('❌ Error al cargar países:', error);
                setErrorCountries(error.message);
            } finally {
                setLoadingCountries(false);
            }
        };

        loadCountries();
    }, []);

    // Cargar ciudades para Gerente cuando cambie su país
    useEffect(() => {
        const loadCitiesGerente = async () => {
            if (!formValues.paisResidenciaGerente) {
                setCitiesGerente([]);
                return;
            }

            try {
                setLoadingCitiesGerente(true);
                setErrorCitiesGerente(null);

                const citiesData = await CityService.getCityByCountryId(formValues.paisResidenciaGerente);

                setCitiesGerente(citiesData);
            } catch (error) {
                console.error('❌ Error al cargar ciudades para Gerente:', error);
                setErrorCitiesGerente(error.message);
            } finally {
                setLoadingCitiesGerente(false);
            }
        };

        loadCitiesGerente();
    }, [formValues.paisResidenciaGerente]);

    // Cargar ciudades para Oficina cuando cambie su país
    useEffect(() => {
        const loadCitiesOficina = async () => {
            if (!formValues.paisOficina) {
                setCitiesOficina([]);
                return;
            }

            try {
                setLoadingCitiesOficina(true);
                setErrorCitiesOficina(null);

                const citiesData = await CityService.getCityByCountryId(formValues.paisOficina);

                setCitiesOficina(citiesData);
            } catch (error) {
                console.error('❌ Error al cargar ciudades para Oficina:', error);
                setErrorCitiesOficina(error.message);
            } finally {
                setLoadingCitiesOficina(false);
            }
        };

        loadCitiesOficina();
    }, [formValues.paisOficina]);

    // Cargar ciudades para Responsable cuando cambie su país
    useEffect(() => {
        const loadCitiesResponsable = async () => {
            if (!formValues.paisResidenciaResponsable) {
                setCitiesResponsable([]);
                return;
            }

            try {
                setLoadingCitiesResponsable(true);
                setErrorCitiesResponsable(null);

                const citiesData = await CityService.getCityByCountryId(formValues.paisResidenciaResponsable);

                setCitiesResponsable(citiesData);
            } catch (error) {
                console.error('❌ Error al cargar ciudades para Responsable:', error);
                setErrorCitiesResponsable(error.message);
            } finally {
                setLoadingCitiesResponsable(false);
            }
        };

        loadCitiesResponsable();
    }, [formValues.paisResidenciaResponsable]);

    // Cargar ciudades para Contable cuando cambie su país
    useEffect(() => {
        const loadCitiesContable = async () => {
            if (!formValues.paisResidenciaContable) {
                setCitiesContable([]);
                return;
            }

            try {
                setLoadingCitiesContable(true);
                setErrorCitiesContable(null);
                
                const citiesData = await CityService.getCityByCountryId(formValues.paisResidenciaContable);

                setCitiesContable(citiesData);
            } catch (error) {
                console.error('❌ Error al cargar ciudades para Contable:', error);
                setErrorCitiesContable(error.message);
            } finally {
                setLoadingCitiesContable(false);
            }
        };

        loadCitiesContable();
    }, [formValues.paisResidenciaContable]);

    // Función para limpiar todos los estados de ciudades
    const clearAllCities = () => {
        setCitiesGerente([]);
        setCitiesOficina([]);
        setCitiesResponsable([]);
        setCitiesContable([]);
        setErrorCitiesGerente(null);
        setErrorCitiesOficina(null);
        setErrorCitiesResponsable(null);
        setErrorCitiesContable(null);
    };

    // Convertir países a formato para el combobox
    const countryOptions = countries.map(country => ({
        label: country.name,
        value: country.id
    })).sort((a, b) => a.label.localeCompare(b.label));

    // Convertir tipos de clientes a formato para el select
    const businessClientTypeOptions = businessClientTypes.map(type => ({
        label: type.name,
        value: type.id
    }));

    return {
        // Estados de tipos de clientes
        businessClientTypes,
        loadingTypes,
        errorTypes,
        
        // Estados de países
        countries,
        loadingCountries,
        errorCountries,
        
        // Estados de ciudades - Gerente
        citiesGerente,
        loadingCitiesGerente,
        errorCitiesGerente,
        
        // Estados de ciudades - Oficina
        citiesOficina,
        loadingCitiesOficina,
        errorCitiesOficina,
        
        // Estados de ciudades - Responsable
        citiesResponsable,
        loadingCitiesResponsable,
        errorCitiesResponsable,
        
        // Estados de ciudades - Contable
        citiesContable,
        loadingCitiesContable,
        errorCitiesContable,
        
        // Opciones formateadas
        countryOptions,
        businessClientTypeOptions,
        
        // Funciones
        clearAllCities
    };
}; 