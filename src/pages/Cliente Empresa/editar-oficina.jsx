import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Fondo from "../../components/common/Fondo";
import styles from "./agregar-cliente-empresa.module.css";
import logo from "../../assets/logo-MFA.png";
import Boton from "../../components/common/Boton";
import ModalExito from "../../components/ui/ModalExito";
import OficinaForm from "../../components/ui/OficinaForm";
import ResponsableOficinaForm from "../../components/ui/ResponsableOficinaForm";
import ContactoContableForm from "../../components/ui/ContactoContableForm";
import { useFormData } from "../../hooks/useFormData";
import { useFormState } from "../../hooks/useFormState";
import OfficeService from "../../services/officeService";
import { FaCheck, FaArrowRight, FaTimes, FaSave } from "react-icons/fa";
import BusinessClientRegistrationService from "../../services/businessClientRegistrationService";
import CountryService from "../../services/countryService";
import CityService from "../../services/cityService";
import PersonService from "../../services/personService";
import Nav from "../../components/ui/nav";


function EditarOficina() {
    const navigate = useNavigate();
    const { officeId, clientId } = useParams();

    // Hook personalizado para manejar todos los estados del formulario
    const {
        currentStep,
        errors,
        completedSteps,
        showModalExito,
        formValues,
        formDataCompleto,
        handleFieldChange,
        clearErrors,
        goToStep,
        markStepAsCompleted,
        openModal,
        closeModal,
        saveFormData,
        resetForm,
        handleMultipleFieldChanges,
        clearFields,
        setErrors,
        setCurrentStep,
        setFormValues
    } = useFormState({});

    // Estados específicos que no están en el hook general
    const [isResponsableGerente, setIsResponsableGerente] = useState(false);
    const [isContableGerente, setIsContableGerente] = useState(false);
    const [isResponsableSeleccionado, setIsResponsableSeleccionado] = useState(false);
    const [isContableSeleccionado, setIsContableSeleccionado] = useState(false);
    const [gerenteData, setGerenteData] = useState(null);
    const [responsableData, setResponsableData] = useState(null);
    const [contableData, setContableData] = useState(null);
    const [clientInfo, setClientInfo] = useState(null);
    const [officeInfo, setOfficeInfo] = useState(null);
    const [countries, setCountries] = useState([]);
    const [officeTypes, setOfficeTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estado para configuración del modal
    const [modalConfig, setModalConfig] = useState({
        type: "success",
        title: "",
        message: "",
        showButtons: true,
        errorDetails: null
    });

    // Hook personalizado para manejar todos los datos del formulario
    const {
        // Estados de países
        loadingCountries,
        errorCountries,

        // Estados de ciudades - Oficina
        citiesOficina,
        loadingCitiesOficina,
        errorCitiesOficina,

        // Estados de ciudades - Responsable
        citiesResponsable,
        loadingCitiesResponsable,
        errorCitiesResponsable,

        // Opciones formateadas
        countryOptions,

        // Funciones
        clearAllCities
    } = useFormData(formValues);

    // Determinar los pasos según el tipo de oficina y cliente
    const getSteps = () => {
        if (!clientInfo || !officeInfo) return [];

        const isPrincipal = officeInfo.office_type_name === 'Principal';
        const isCentralized = clientInfo.centralized_payment === true;

        if (isPrincipal && isCentralized) {
            // Oficina principal + cliente centralizado: Oficina, Responsable, Contable
            return [
                { id: 0, title: "Oficina", icon: "1" },
                { id: 1, title: "Responsable de Oficina", icon: "2" },
                { id: 2, title: "Contacto Contable", icon: "3" }
            ];
        } else if (!isPrincipal && isCentralized) {
            // Oficina NO principal + cliente centralizado: Solo Oficina y Responsable
            return [
                { id: 0, title: "Oficina", icon: "1" },
                { id: 1, title: "Responsable de Oficina", icon: "2" }
            ];
        } else {
            // Cliente descentralizado: Siempre Oficina, Responsable, Contable
            return [
                { id: 0, title: "Oficina", icon: "1" },
                { id: 1, title: "Responsable de Oficina", icon: "2" },
                { id: 2, title: "Contacto Contable", icon: "3" }
            ];
        }
    };

    const steps = getSteps();

    // Función para formatear fecha para input type="date"
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        
        try {
            // Si ya es un string en formato YYYY-MM-DD, devolverlo tal como está
            if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                return dateString;
            }
            
            // Si es una fecha válida, convertirla a formato YYYY-MM-DD
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error('Error formateando fecha:', error);
            return '';
        }
    };

    // Función para mapear género
    const mapGender = (gender) => {
        if (!gender) return '';
        return gender === 'M' ? 'masculino' : 'femenino';
    };

    useEffect(() => {
        loadInitialData();
    }, [officeId, clientId]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            
            // Cargar información del cliente
            const clientResponse = await BusinessClientRegistrationService.getBusinessClientById(clientId);
            if (clientResponse.success) {
                setClientInfo(clientResponse.data);
            }

            // Cargar información de la oficina
            const officeResponse = await OfficeService.getOfficeById(officeId);
            if (officeResponse.success) {
                setOfficeInfo(officeResponse.data);
            
                
                // Llenar el formulario con los datos existentes de la oficina
                setFormValues({
                    nombreOficina: officeResponse.data.name || '',
                    direccionOficina: officeResponse.data.address || '',
                    tipoOficina: officeResponse.data.office_type_name || '', // Usar el nombre para el select
                    paisOficina: officeResponse.data.country_id || '',
                    ciudadOficina: officeResponse.data.city_id || '', // Usar el city_id para el combobox
                    codigoPostalOficina: officeResponse.data.postal_code || '',
                    celularOficina: officeResponse.data.cellphone || '',
                    telefonoOficina: officeResponse.data.phone || '',
                    correoElectronicoOficina: officeResponse.data.email || ''
                });

                // Cargar ciudades del país de la oficina para que se muestren en el combobox
                if (officeResponse.data.country_id) {
                    try {
                        const citiesResponse = await CityService.getCityByCountryId(officeResponse.data.country_id);
                        if (citiesResponse) {
                            console.log('Ciudades cargadas para el país:', citiesResponse);
                            
                            // Ya no necesitamos buscar la ciudad por city_id porque ya tenemos city_name
                            // Las ciudades se cargarán automáticamente a través del hook useFormData
                            console.log('Ciudad de la oficina:', officeResponse.data.city_name);
                        }
                    } catch (error) {
                        console.error('Error cargando ciudades del país:', error);
                    }
                }

                // Cargar roles del responsable y contable de la oficina
                try {
                    const rolesResponse = await OfficeService.getOfficeRoles(officeId, clientId);
                    if (rolesResponse.success && rolesResponse.data) {
                        console.log('=== ROLES DE LA OFICINA ===');
                        console.log('Respuesta completa:', rolesResponse);
                        console.log('Datos de roles:', rolesResponse.data);
                        
                        // Procesar los roles obtenidos
                        let responsableDataTemp = null;
                        let contableDataTemp = null;
                        let gerenteDataTemp = null;
                        
                        console.log('=== PROCESANDO ROLES ===');
                        console.log('Total de roles obtenidos:', rolesResponse.data.length);
                        
                        // Primero identificar todos los roles
                        rolesResponse.data.forEach((role, index) => {
                            console.log(`--- ROL ${index + 1} ---`);
                            console.log('role_type_name:', role.role_type_name);
                            console.log('role_type_id:', role.role_type_id);
                            console.log('person_id:', role.person_id);
                            console.log('first_name:', role.first_name);
                            console.log('last_name:', role.last_name);
                            
                            if (role.role_type_name === 'Responsable de Oficina') {
                                responsableDataTemp = {
                                    id: role.person_id,
                                    first_name: role.first_name,
                                    last_name: role.last_name,
                                    birthdate: role.birthdate,
                                    gender: role.gender,
                                    dni: role.dni,
                                    dni_country_id: role.dni_country_id,
                                    country_id: role.country_id,
                                    city_id: role.city_id,
                                    address: role.address,
                                    postal_code: role.postal_code,
                                    email: role.email,
                                    cellphone: role.cellphone
                                };
                                console.log('✅ Responsable encontrado:', responsableDataTemp);
                            } else if (role.role_type_name === 'Contacto Contable') {
                                contableDataTemp = {
                                    id: role.person_id,
                                    first_name: role.first_name,
                                    last_name: role.last_name,
                                    birthdate: role.birthdate,
                                    gender: role.gender,
                                    dni: role.dni,
                                    dni_country_id: role.dni_country_id,
                                    country_id: role.country_id,
                                    city_id: role.city_id,
                                    address: role.address,
                                    postal_code: role.postal_code,
                                    email: role.email,
                                    cellphone: role.cellphone
                                };
                                console.log('✅ Contable encontrado:', contableDataTemp);
                            } else if (role.role_type_name === 'Gerente General') {
                                gerenteDataTemp = {
                                    id: role.person_id,
                                    first_name: role.first_name,
                                    last_name: role.last_name,
                                    birthdate: role.birthdate,
                                    gender: role.gender,
                                    dni: role.dni,
                                    dni_country_id: role.dni_country_id,
                                    country_id: role.country_id,
                                    city_id: role.city_id,
                                    address: role.address,
                                    postal_code: role.postal_code,
                                    email: role.email,
                                    cellphone: role.cellphone
                                };
                                console.log('✅ Gerente General encontrado:', gerenteDataTemp);
                            } else {
                                console.log('❌ Rol no reconocido:', role.role_type_name);
                            }
                        });
                        
                        // Guardar los datos en los estados
                        setGerenteData(gerenteDataTemp);
                        setResponsableData(responsableDataTemp);
                        setContableData(contableDataTemp);
                        
                        // Lógica para asignar gerente cuando no hay responsable o contable
                        if (!responsableDataTemp && gerenteDataTemp) {
                            console.log('🔄 No hay responsable específico, usando Gerente General como Responsable');
                            responsableDataTemp = gerenteDataTemp;
                            setIsResponsableGerente(true); // Marcar checkbox
                        }
                        
                        if (!contableDataTemp && gerenteDataTemp) {
                            console.log('🔄 No hay contable específico, usando Gerente General como Contable');
                            contableDataTemp = gerenteDataTemp;
                            setIsContableGerente(true); // Marcar checkbox
                        }
                        
                        console.log('=== RESUMEN DE ROLES ===');
                        console.log('Responsable encontrado:', !!responsableDataTemp);
                        console.log('Contable encontrado:', !!contableDataTemp);
                        console.log('Gerente encontrado:', !!gerenteDataTemp);
                        console.log('Responsable es Gerente:', isResponsableGerente);
                        console.log('Contable es Gerente:', isContableGerente);
                        if (responsableDataTemp) console.log('Responsable:', responsableDataTemp.first_name, responsableDataTemp.last_name);
                        if (contableDataTemp) console.log('Contable:', contableDataTemp.first_name, contableDataTemp.last_name);
                        if (gerenteDataTemp) console.log('Gerente:', gerenteDataTemp.first_name, gerenteDataTemp.last_name);

                        // Llenar formulario del responsable si existe
                        if (responsableDataTemp) {
                            setFormValues(prev => ({
                                ...prev,
                                nombreResponsable: responsableDataTemp.first_name || '',
                                apellidoResponsable: responsableDataTemp.last_name || '',
                                fechaNacimientoResponsable: formatDateForInput(responsableDataTemp.birthdate) || '',
                                generoResponsable: mapGender(responsableDataTemp.gender) || '',
                                dniCiResponsable: responsableDataTemp.dni || '',
                                paisEmisionResponsable: responsableDataTemp.dni_country_id || '',
                                paisResidenciaResponsable: responsableDataTemp.country_id || '',
                                ciudadResponsable: responsableDataTemp.city_id || '',
                                direccionResponsable: responsableDataTemp.address || '',
                                codigoPostalResponsable: responsableDataTemp.postal_code || '',
                                telefonoResponsable: responsableDataTemp.cellphone || '',
                                correoElectronicoResponsable: responsableDataTemp.email || ''
                            }));
                            console.log('Formulario del responsable llenado con:', responsableDataTemp);

                            // Cargar ciudades del país de residencia del responsable
                            if (responsableDataTemp.country_id) {
                                try {
                                    const responsableCitiesResponse = await CityService.getCityByCountryId(responsableDataTemp.country_id);
                                    if (responsableCitiesResponse) {
                                        console.log('Ciudades cargadas para el país del responsable:', responsableCitiesResponse);
                                    }
                                } catch (error) {
                                    console.error('Error cargando ciudades del país del responsable:', error);
                                }
                            }
                        }

                        // Llenar formulario del contable si existe
                        if (contableDataTemp) {
                            setFormValues(prev => ({
                                ...prev,
                                nombreContable: contableDataTemp.first_name || '',
                                apellidoContable: contableDataTemp.last_name || '',
                                fechaNacimientoContable: formatDateForInput(contableDataTemp.birthdate) || '',
                                generoContable: mapGender(contableDataTemp.gender) || '',
                                dniCiContable: contableDataTemp.dni || '',
                                paisEmisionContable: contableDataTemp.dni_country_id || '',
                                paisResidenciaContable: contableDataTemp.country_id || '',
                                ciudadContable: contableDataTemp.city_id || '',
                                direccionContable: contableDataTemp.address || '',
                                codigoPostalContable: contableDataTemp.postal_code || '',
                                telefonoContable: contableDataTemp.cellphone || '',
                                correoElectronicoContable: contableDataTemp.email || ''
                            }));
                            console.log('Formulario del contable llenado con:', contableDataTemp);

                            // Cargar ciudades del país de residencia del contable
                            if (contableDataTemp.country_id) {
                                try {
                                    const contableCitiesResponse = await CityService.getCityByCountryId(contableDataTemp.country_id);
                                    if (contableCitiesResponse) {
                                        console.log('Ciudades cargadas para el país del contable:', contableCitiesResponse);
                                    }
                                } catch (error) {
                                    console.error('Error cargando ciudades del país del contable:', error);
                                }
                            }
                        }

                        console.log('=== FIN ROLES DE LA OFICINA ===');
                    } else {
                        console.log('No se pudieron obtener roles para la oficina:', rolesResponse);
                    }
                } catch (error) {
                    console.error('Error cargando roles de la oficina:', error);
                }
            }

            // Cargar países
            const countriesResponse = await CountryService.getAllCountries();
            if (countriesResponse.success) {
                setCountries(countriesResponse.data);
            }

            // Cargar tipos de oficina
            try {
                const officeTypesResponse = await OfficeService.getOfficeTypes();
                if (officeTypesResponse.success) {
                    setOfficeTypes(officeTypesResponse.data);
                }
            } catch (error) {
                console.error('Error cargando tipos de oficina:', error);
                setOfficeTypes([
                    { id: '1', name: 'Principal' },
                    { id: '2', name: 'Sucursal' },
                    { id: '3', name: 'Agencia' }
                ]);
            }

            // Marcar pasos como completados DESPUÉS de que todos los datos se hayan cargado
            // Usar directamente los datos de las respuestas en lugar de depender del estado
            if (clientResponse.success && officeResponse.success) {
                const clientData = clientResponse.data;
                const officeData = officeResponse.data;
                
                console.log('=== MARCANDO PASOS COMO COMPLETADOS ===');
                console.log('Tipo de cliente:', clientData.centralized_payment ? 'Centralizado' : 'Descentralizado');
                console.log('Tipo de oficina:', officeData.office_type_name);
                
                if (clientData.centralized_payment) {
                    // Cliente centralizado
                    if (officeData.office_type_name === 'Principal') {
                        // Oficina principal: marcar los 3 pasos
                        markStepAsCompleted(0); // Oficina
                        markStepAsCompleted(1); // Responsable de Oficina
                        markStepAsCompleted(2); // Contacto Contable
                        console.log('Pasos marcados: Oficina, Responsable, Contable (Cliente Centralizado + Oficina Principal)');
                    } else {
                        // Oficina NO principal: marcar solo 2 pasos
                        markStepAsCompleted(0); // Oficina
                        markStepAsCompleted(1); // Responsable de Oficina
                        console.log('Pasos marcados: Oficina, Responsable (Cliente Centralizado + Oficina NO Principal)');
                    }
                } else {
                    // Cliente descentralizado: siempre marcar los 3 pasos
                    markStepAsCompleted(0); // Oficina
                    markStepAsCompleted(1); // Responsable de Oficina
                    markStepAsCompleted(2); // Contacto Contable
                    console.log('Pasos marcados: Oficina, Responsable, Contable (Cliente Descentralizado)');
                }
                console.log('=== FIN MARCAR PASOS ===');
            } else {
                console.log('No se pueden marcar pasos - clientResponse o officeResponse no son exitosos');
                console.log('clientResponse:', clientResponse);
                console.log('officeResponse:', officeResponse);
            }

        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            showErrorModal('Error al cargar datos iniciales', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStepClick = (stepId) => {
        // Solo permitir navegar a pasos completados
        if (completedSteps.includes(stepId)) {
            goToStep(stepId);
        }
    };

    const handleContinue = async () => {
        // Validar inputs required del paso actual
        const currentForm = document.querySelector(`[data-step="${currentStep}"]`);
        if (currentForm) {
            const requiredInputs = currentForm.querySelectorAll('input[required], select[required]');
            let isValid = true;
            const newErrors = {};

            requiredInputs.forEach(input => {
                const fieldId = input.id;
                const fieldValue = input.value.trim();
                
                const isFieldValid = validateField(fieldId, fieldValue);
                
                if (!isFieldValid) {
                    isValid = false;
                    if (input.type !== 'hidden') {
                        input.style.borderColor = 'red';
                    }
                    newErrors[fieldId] = true;

                    if (fieldId.includes('correoElectronico') && fieldValue) {
                        newErrors[fieldId] = 'El email debe contener @ y .com';
                    }

                    setTimeout(() => {
                        if (input.type !== 'hidden') {
                            input.style.borderColor = '';
                        }
                        setErrors(prev => ({ ...prev, [fieldId]: false }));
                    }, 2000);
                } else {
                    if (input.type !== 'hidden') {
                        input.style.borderColor = '';
                    }
                    newErrors[fieldId] = false;
                }
            });

            setErrors(prev => ({ ...prev, ...newErrors }));

            if (isValid && currentStep < steps.length - 1) {
                // Validar duplicados para el paso actual antes de continuar
                const currentStepData = saveStepData(currentStep);
                const duplicates = await validateDuplicates(currentStepData);

                if (duplicates.length > 0) {
                    // Mostrar errores de duplicados
                    duplicates.forEach(duplicate => {
                        const input = document.getElementById(duplicate.field);
                        if (input) {
                            input.style.borderColor = 'red';
                            newErrors[duplicate.field] = duplicate.message;
                        }
                    });

                    // Actualizar errores
                    setErrors(prev => ({ ...prev, ...newErrors }));

                    // Mostrar modal de duplicados
                    const duplicateMessages = duplicates.map(d => `• ${d.field}: ${d.message}`).join('\n');
                    setModalConfig({
                        type: "duplicate",
                        title: "Datos Duplicados Detectados",
                        message: `Se encontraron los siguientes datos que ya existen en el sistema:\n\n${duplicateMessages}\n\n¿Deseas continuar con la edición o corregir los datos?`,
                        showButtons: true,
                        errorDetails: null
                    });
                    openModal();
                    return; // No continuar al siguiente paso
                }

                // Guardar datos del paso actual
                
                // Marcar el paso actual como completado
                markStepAsCompleted(currentStep);
                setCurrentStep(currentStep + 1);
                clearErrors();

            } else if (isValid && currentStep === steps.length - 1) {
                // Último paso - validar duplicados antes de guardar cambios
                const lastStepData = saveStepData(currentStep);
                const duplicates = await validateDuplicates(lastStepData);

                if (duplicates.length > 0) {
                    // Mostrar errores de duplicados
                    duplicates.forEach(duplicate => {
                        const input = document.getElementById(duplicate.field);
                        if (input) {
                            input.style.borderColor = 'red';
                            newErrors[duplicate.field] = duplicate.message;
                        }
                    });

                    // Actualizar errores
                    setErrors(prev => ({ ...prev, ...newErrors }));

                    // Mostrar modal de error con duplicados
                    const duplicateMessages = duplicates.map(d => d.message).join('\n');
                    showErrorModal(`Se encontraron los siguientes duplicados:\n${duplicateMessages}`);
                    return; // No guardar cambios
                }

                // Último paso - guardar cambios
                await saveChanges();
            }
        }
    };

    const saveChanges = async () => {
        try {
            setLoading(true);
            
            // Validación final de duplicados antes de guardar
            console.log('=== VALIDACIÓN FINAL DE DUPLICADOS ===');
            const finalValidationData = {
                nombreOficina: formValues.nombreOficina || '',
                nombreResponsable: formValues.nombreResponsable || '',
                apellidoResponsable: formValues.apellidoResponsable || '',
                dniCiResponsable: formValues.dniCiResponsable || '',
                correoElectronicoResponsable: formValues.correoElectronicoResponsable || '',
                telefonoResponsable: formValues.telefonoResponsable || '',
                nombreContable: formValues.nombreContable || '',
                apellidoContable: formValues.apellidoContable || '',
                dniCiContable: formValues.dniCiContable || '',
                correoElectronicoContable: formValues.correoElectronicoContable || '',
                telefonoContable: formValues.telefonoContable || ''
            };

            // Simular validación del paso actual (oficina)
            const currentStep = 0; // Oficina
            const duplicates = await validateDuplicates(finalValidationData);

            if (duplicates.length > 0) {
                // Mostrar errores de duplicados
                duplicates.forEach(duplicate => {
                    const input = document.getElementById(duplicate.field);
                    if (input) {
                        input.style.borderColor = 'red';
                    }
                });

                // Mostrar modal de error con duplicados
                const duplicateMessages = duplicates.map(d => d.message).join('\n');
                showErrorModal(`Se encontraron los siguientes duplicados:\n${duplicateMessages}`);
                return; // No guardar cambios
            }

            // Obtener el usuario logueado desde localStorage
            const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
            const currentUserId = userInfo.id || userInfo.user_id;
            
            if (!currentUserId) {
                throw new Error('No se pudo obtener el ID del usuario logueado');
            }

            console.log('=== GUARDANDO CAMBIOS DE OFICINA ===');

            // Preparar datos de la oficina
            const officeData = {
                name: formValues.nombreOficina || '',
                address: formValues.direccionOficina || '',
                postal_code: formValues.codigoPostalOficina || '0000',
                phone: formValues.telefonoOficina || null,
                email: formValues.correoElectronicoOficina || null,
                cellphone: formValues.celularOficina || null,
                country_id: formValues.paisOficina,
                city_id: formValues.ciudadOficina || null,
                updated_by: currentUserId
            };

            console.log('Datos de la oficina a actualizar:', officeData);

            // Actualizar oficina
            const officeResponse = await OfficeService.updateOffice(officeId, officeData);
            
            if (!officeResponse.success) {
                throw new Error(officeResponse.message || 'Error al actualizar la oficina');
            }

            console.log('=== OFICINA ACTUALIZADA EXITOSAMENTE ===');

            // Mostrar modal de éxito
            setModalConfig({
                type: "success-generico",
                title: "¡Oficina Actualizada!",
                message: "Los datos de la oficina han sido actualizados correctamente.",
                showButtons: true,
                errorDetails: null
            });
            openModal();

        } catch (error) {
            console.error('=== ERROR AL GUARDAR CAMBIOS ===');
            console.error('Error:', error);

            setModalConfig({
                type: "error",
                title: "Error al Guardar",
                message: error.message || "No se pudieron guardar los cambios. Por favor, inténtalo de nuevo.",
                showButtons: true,
                errorDetails: null
            });
            openModal();
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        resetForm();
        setIsResponsableGerente(false);
        setIsContableGerente(false);
        setIsResponsableSeleccionado(false);
        setIsContableSeleccionado(false);
        clearAllCities();
        navigate(`/gestionar-cliente-empresa/gestionar-oficinas/${clientId}`);
    };

    // Función para manejar cuando se marca "Es Gerente General" en el responsable
    const handleResponsableGerenteChange = (isChecked) => {
        setIsResponsableGerente(isChecked);
        
        if (isChecked && gerenteData) {
            console.log('=== USANDO GERENTE COMO RESPONSABLE ===');
            // Llenar los campos del responsable con la información del gerente
            setFormValues(prev => ({
                ...prev,
                nombreResponsable: gerenteData.first_name || '',
                apellidoResponsable: gerenteData.last_name || '',
                fechaNacimientoResponsable: gerenteData.birthdate ? formatDateForInput(gerenteData.birthdate) : '',
                generoResponsable: gerenteData.gender ? mapGender(gerenteData.gender) : '',
                dniCiResponsable: gerenteData.dni || '',
                paisEmisionResponsable: gerenteData.dni_country_id || '',
                paisResidenciaResponsable: gerenteData.country_id || '',
                ciudadResponsable: gerenteData.city_id || '',
                direccionResponsable: gerenteData.address || '',
                codigoPostalResponsable: gerenteData.postal_code || '',
                telefonoResponsable: gerenteData.cellphone || '',
                correoElectronicoResponsable: gerenteData.email || ''
            }));
        } else if (!isChecked && responsableData) {
            console.log('=== RESTAURANDO RESPONSABLE ORIGINAL ===');
            // Restaurar los datos originales del responsable
            setFormValues(prev => ({
                ...prev,
                nombreResponsable: responsableData.first_name || '',
                apellidoResponsable: responsableData.last_name || '',
                fechaNacimientoResponsable: responsableData.birthdate ? formatDateForInput(responsableData.birthdate) : '',
                generoResponsable: responsableData.gender ? mapGender(responsableData.gender) : '',
                dniCiResponsable: responsableData.dni || '',
                paisEmisionResponsable: responsableData.dni_country_id || '',
                paisResidenciaResponsable: responsableData.country_id || '',
                ciudadResponsable: responsableData.city_id || '',
                direccionResponsable: responsableData.address || '',
                codigoPostalResponsable: responsableData.postal_code || '',
                telefonoResponsable: responsableData.cellphone || '',
                correoElectronicoResponsable: responsableData.email || ''
            }));
        }
    };

    // Función para manejar cuando se marca "Es Gerente General" en el contable
    const handleContableGerenteChange = (isChecked) => {
        setIsContableGerente(isChecked);
        
        if (isChecked && gerenteData) {
            console.log('=== USANDO GERENTE COMO CONTABLE ===');
            // Llenar los campos del contable con la información del gerente
            setFormValues(prev => ({
                ...prev,
                nombreContable: gerenteData.first_name || '',
                apellidoContable: gerenteData.last_name || '',
                fechaNacimientoContable: gerenteData.birthdate ? formatDateForInput(gerenteData.birthdate) : '',
                generoContable: gerenteData.gender ? mapGender(gerenteData.gender) : '',
                dniCiContable: gerenteData.dni || '',
                paisEmisionContable: gerenteData.dni_country_id || '',
                paisResidenciaContable: gerenteData.country_id || '',
                ciudadContable: gerenteData.city_id || '',
                direccionContable: gerenteData.address || '',
                codigoPostalContable: gerenteData.postal_code || '',
                telefonoContable: gerenteData.cellphone || '',
                correoElectronicoContable: gerenteData.email || ''
            }));
        } else if (!isChecked && contableData) {
            console.log('=== RESTAURANDO CONTABLE ORIGINAL ===');
            // Restaurar los datos originales del contable
            setFormValues(prev => ({
                ...prev,
                nombreContable: contableData.first_name || '',
                apellidoContable: contableData.last_name || '',
                fechaNacimientoContable: contableData.birthdate ? formatDateForInput(contableData.birthdate) : '',
                generoContable: contableData.gender ? mapGender(contableData.gender) : '',
                dniCiContable: contableData.dni || '',
                paisEmisionContable: contableData.dni_country_id || '',
                paisResidenciaContable: contableData.country_id || '',
                ciudadContable: contableData.city_id || '',
                direccionContable: contableData.address || '',
                codigoPostalContable: contableData.postal_code || '',
                telefonoContable: contableData.cellphone || '',
                correoElectronicoContable: contableData.email || ''
            }));
        }
    };

    const handleCloseModal = () => {
        closeModal();
    };

    const showErrorModal = (message) => {
        setModalConfig({
            type: "error",
            title: "Error",
            message: message,
            showButtons: true
        });
        openModal();
    };

    const showWarningModal = (message) => {
        setModalConfig({
            type: "warning",
            title: "Advertencia",
            message: message,
            showButtons: true
        });
        openModal();
    };

    const handleFinalizar = () => {
        closeModal();
        
        // Si es modal de duplicados, continuar al siguiente paso
        if (modalConfig.type === "duplicate") {
            console.log('=== CONTINUANDO CON DUPLICADOS ===');
            
            if (currentStep < steps.length - 1) {
                // Marcar el paso actual como completado y continuar
                markStepAsCompleted(currentStep);
                setCurrentStep(currentStep + 1);
                clearErrors();
            } else {
                // Último paso - continuar con la actualización
                console.log('=== CONTINUANDO ACTUALIZACIÓN CON DUPLICADOS ===');
                // Aquí se puede continuar con la actualización
            }
            return;
        }
        
        // Comportamiento normal para otros tipos de modal
        console.log('=== FINALIZAR MODAL - REDIRIGIENDO A GESTIONAR OFICINAS ===');

        resetForm();
        setIsResponsableGerente(false);
        setIsContableGerente(false);
        setIsResponsableSeleccionado(false);
        setIsContableSeleccionado(false);
        clearAllCities();
        navigate(`/gestionar-cliente-empresa/gestionar-oficinas/${clientId}`);
    };

    // Función para validar si un país es válido
    const validateCountry = (countryValue) => {
        if (!countryValue) return false;
        
        const isValidCountry = countryOptions.some(option => 
            option.value.toLowerCase() === countryValue.toLowerCase() || option.label.toLowerCase() === countryValue.toLowerCase()
        );
        
        return isValidCountry;
    };

    // Función para validar email
    const validateEmail = (emailValue) => {
        if (!emailValue) return false;
        const hasAtSymbol = emailValue.includes('@');
        const hasDotCom = emailValue.includes('.com');
        return hasAtSymbol && hasDotCom;
    };

    // Función para validar campos específicos
    const validateField = (fieldId, value) => {
        if (fieldId.includes('pais') && value) {
            return validateCountry(value);
        }
        if (fieldId.includes('correoElectronico') && value) {
            return validateEmail(value);
        }
        return value && value.trim() !== '';
    };

    // Función para validar duplicados en cada paso
    const validateDuplicates = async (currentStepData) => {
        const duplicates = [];

        try {
            // Validar nombre de oficina (solo en paso 0)
            if (currentStep === 0 && currentStepData.nombreOficina) {
                const officeNameResponse = await OfficeService.validateDuplicateOfficeName(
                    currentStepData.nombreOficina, 
                    clientId, 
                    officeId // Excluir la oficina actual
                );
                if (officeNameResponse.isDuplicate) {
                    duplicates.push({
                        field: 'nombreOficina',
                        message: officeNameResponse.message || 'El nombre de la oficina ya existe en este cliente'
                    });
                }
            }

            // Validar DNI del responsable (solo en paso 1, si no es el mismo que el actual)
            if (currentStep === 1 && currentStepData.dniCiResponsable) {
                const dniResponse = await BusinessClientRegistrationService.validateDuplicate('dni', currentStepData.dniCiResponsable);
                if (dniResponse.isDuplicate) {
                    // Verificar si el DNI pertenece al responsable actual
                    const isCurrentResponsable = await validateCurrentPerson('responsable', 'dni', currentStepData.dniCiResponsable);
                    if (!isCurrentResponsable) {
                        duplicates.push({
                            field: 'dniCiResponsable',
                            message: dniResponse.message || 'El DNI/CI ya está registrado en el sistema'
                        });
                    }
                }
            }

            // Validar email del responsable (solo en paso 1, si no es el mismo que el actual)
            if (currentStep === 1 && currentStepData.correoElectronicoResponsable) {
                const emailResponse = await BusinessClientRegistrationService.validateDuplicate('email', currentStepData.correoElectronicoResponsable);
                if (emailResponse.isDuplicate) {
                    // Verificar si el email pertenece al responsable actual
                    const isCurrentResponsable = await validateCurrentPerson('responsable', 'email', currentStepData.correoElectronicoResponsable);
                    if (!isCurrentResponsable) {
                        duplicates.push({
                            field: 'correoElectronicoResponsable',
                            message: emailResponse.message || 'El email ya está registrado en el sistema'
                        });
                    }
                }
            }

            // Validar teléfono del responsable (solo en paso 1, si no es el mismo que el actual)
            if (currentStep === 1 && currentStepData.telefonoResponsable) {
                const phoneResponse = await BusinessClientRegistrationService.validateDuplicate('cellphone', currentStepData.telefonoResponsable);
                if (phoneResponse.isDuplicate) {
                    // Verificar si el teléfono pertenece al responsable actual
                    const isCurrentResponsable = await validateCurrentPerson('responsable', 'cellphone', currentStepData.telefonoResponsable);
                    if (!isCurrentResponsable) {
                        duplicates.push({
                            field: 'telefonoResponsable',
                            message: phoneResponse.message || 'El teléfono ya está registrado en el sistema'
                        });
                    }
                }
            }

            // Validar DNI del contable (solo en paso 2, si no es el mismo que el actual)
            if (currentStep === 2 && currentStepData.dniCiContable) {
                const dniResponse = await BusinessClientRegistrationService.validateDuplicate('dni', currentStepData.dniCiContable);
                if (dniResponse.isDuplicate) {
                    // Verificar si el DNI pertenece al contable actual
                    const isCurrentContable = await validateCurrentPerson('contable', 'dni', currentStepData.dniCiContable);
                    if (!isCurrentContable) {
                        duplicates.push({
                            field: 'dniCiContable',
                            message: dniResponse.message || 'El DNI/CI ya está registrado en el sistema'
                        });
                    }
                }
            }

            // Validar email del contable (solo en paso 2, si no es el mismo que el actual)
            if (currentStep === 2 && currentStepData.correoElectronicoContable) {
                const emailResponse = await BusinessClientRegistrationService.validateDuplicate('email', currentStepData.correoElectronicoContable);
                if (emailResponse.isDuplicate) {
                    // Verificar si el email pertenece al contable actual
                    const isCurrentContable = await validateCurrentPerson('contable', 'email', currentStepData.correoElectronicoContable);
                    if (!isCurrentContable) {
                        duplicates.push({
                            field: 'correoElectronicoContable',
                            message: emailResponse.message || 'El email ya está registrado en el sistema'
                        });
                    }
                }
            }

            // Validar teléfono del contable (solo en paso 2, si no es el mismo que el actual)
            if (currentStep === 2 && currentStepData.telefonoContable) {
                const phoneResponse = await BusinessClientRegistrationService.validateDuplicate('cellphone', currentStepData.telefonoContable);
                if (phoneResponse.isDuplicate) {
                    // Verificar si el teléfono pertenece al contable actual
                    const isCurrentContable = await validateCurrentPerson('contable', 'cellphone', currentStepData.telefonoContable);
                    if (!isCurrentContable) {
                        duplicates.push({
                            field: 'telefonoContable',
                            message: phoneResponse.message || 'El teléfono ya está registrado en el sistema'
                        });
                    }
                }
            }

        } catch (error) {
            console.error('Error validando duplicados:', error);
            // Si hay error en la validación, permitir continuar pero mostrar advertencia
            showWarningModal('No se pudo validar duplicados. Se continuará con la edición.');
        }

        return duplicates;
    };

    // Función para validar si un dato pertenece a la persona actual que se está editando
    const validateCurrentPerson = async (roleType, fieldType, fieldValue) => {
        try {
            // Obtener los roles de la oficina para identificar a la persona actual
            const rolesResponse = await OfficeService.getOfficeRoles(officeId, clientId);
            if (!rolesResponse.success || !rolesResponse.data) {
                return false;
            }

            let currentPersonId = null;

            // Buscar la persona actual según el rol
            if (roleType === 'responsable') {
                // Buscar primero un responsable específico
                let responsableRole = rolesResponse.data.find(role => role.role_type_name === 'Responsable de Oficina');
                if (!responsableRole) {
                    // Si no hay responsable específico, buscar gerente general
                    responsableRole = rolesResponse.data.find(role => role.role_type_name === 'Gerente General');
                }
                if (responsableRole) {
                    currentPersonId = responsableRole.person_id;
                }
            } else if (roleType === 'contable') {
                // Buscar primero un contable específico
                let contableRole = rolesResponse.data.find(role => role.role_type_name === 'Contacto Contable');
                if (!contableRole) {
                    // Si no hay contable específico, buscar gerente general
                    contableRole = rolesResponse.data.find(role => role.role_type_name === 'Gerente General');
                }
                if (contableRole) {
                    currentPersonId = contableRole.person_id;
                }
            }

            if (!currentPersonId) {
                return false;
            }

            // Obtener los datos de la persona actual para comparar
            const personResponse = await PersonService.getPersonById(currentPersonId);
            if (!personResponse.success) {
                return false;
            }

            const currentPerson = personResponse.data;

            // Comparar el campo específico
            switch (fieldType) {
                case 'dni':
                    return currentPerson.dni === fieldValue;
                case 'email':
                    return currentPerson.email === fieldValue;
                case 'cellphone':
                    return currentPerson.cellphone === fieldValue;
                default:
                    return false;
            }

        } catch (error) {
            console.error('Error validando persona actual:', error);
            return false;
        }
    };

    // Función para guardar información de cada paso
    const saveStepData = (stepNumber) => {
        const stepData = {};
        
        switch (stepNumber) {
            case 0: // Oficina
                stepData.nombreOficina = formValues.nombreOficina || '';
                stepData.direccionOficina = formValues.direccionOficina || '';
                stepData.tipoOficina = formValues.tipoOficina || '';
                stepData.paisOficina = formValues.paisOficina || '';
                stepData.ciudadOficina = formValues.ciudadOficina || '';
                stepData.codigoPostalOficina = formValues.codigoPostalOficina || '';
                stepData.celularOficina = formValues.celularOficina || '';
                stepData.telefonoOficina = formValues.telefonoOficina || '';
                stepData.correoElectronicoOficina = formValues.correoElectronicoOficina || '';
                console.log('=== DATOS DEL PASO 0 - OFICINA ===');
                console.log(stepData);
                break;
                
            case 1: // Responsable de Oficina
                stepData.nombreResponsable = formValues.nombreResponsable || '';
                stepData.apellidoResponsable = formValues.apellidoResponsable || '';
                stepData.fechaNacimientoResponsable = formValues.fechaNacimientoResponsable || '';
                stepData.generoResponsable = formValues.generoResponsable || '';
                stepData.dniCiResponsable = formValues.dniCiResponsable || '';
                stepData.paisEmisionResponsable = formValues.paisEmisionResponsable || '';
                stepData.paisResidenciaResponsable = formValues.paisResidenciaResponsable || '';
                stepData.ciudadResponsable = formValues.ciudadResponsable || '';
                stepData.direccionResponsable = formValues.direccionResponsable || '';
                stepData.codigoPostalResponsable = formValues.codigoPostalResponsable || '';
                stepData.telefonoResponsable = formValues.telefonoResponsable || '';
                stepData.correoElectronicoResponsable = formValues.correoElectronicoResponsable || '';
                stepData.esGerenteGeneral = isResponsableGerente;
                console.log('=== DATOS DEL PASO 1 - RESPONSABLE DE OFICINA ===');
                console.log(stepData);
                break;

            case 2: // Contable (solo si aplica)
                if (steps.length > 2) {
                    stepData.nombreContable = formValues.nombreContable || '';
                    stepData.apellidoContable = formValues.apellidoContable || '';
                    stepData.fechaNacimientoContable = formValues.fechaNacimientoContable || '';
                    stepData.generoContable = formValues.generoContable || '';
                    stepData.dniCiContable = formValues.dniCiContable || '';
                    stepData.paisEmisionContable = formValues.paisEmisionContable || '';
                    stepData.paisResidenciaContable = formValues.paisResidenciaContable || '';
                    stepData.ciudadContable = formValues.ciudadContable || '';
                    stepData.direccionContable = formValues.direccionContable || '';
                    stepData.codigoPostalContable = formValues.codigoPostalContable || '';
                    stepData.telefonoContable = formValues.telefonoContable || '';
                    stepData.correoElectronicoContable = formValues.correoElectronicoContable || '';
                    stepData.esGerenteGeneral = isContableGerente;
                    console.log('=== DATOS DEL PASO 2 - CONTABLE ===');
                    console.log(stepData);
                }
                break;
        }
        
        return stepData;
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <Nav />
                <Fondo />
                <div className={styles.content}>
                    <h1 className={styles.title}>Editando Oficina</h1>
                    <div className={styles.loading}>
                        Cargando datos de la oficina...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Nav />
            <Fondo />
            <div className={styles.content}>
                <div className={styles.panelContainer}>
                    <div className={styles.menuProsive}>
                        {steps.map((step) => {
                            const isCompleted = completedSteps.includes(step.id);
                            const isCurrent = currentStep === step.id;

                            return (
                                <div
                                    key={step.id}
                                    className={`${styles.menuItem} ${isCurrent ? styles.active : ''} ${isCompleted ? styles.finished : ''}`}
                                    onClick={() => handleStepClick(step.id)}
                                >
                                    <div className={styles.menuItemIcon}>
                                        {step.icon}
                                    </div>
                                    <h1 className={styles.menuItemTitle}>{step.title}</h1>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className={styles.formContainerContainer}>
                    <div className={styles.formContainer} style={{ display: currentStep === 0 ? "flex" : "none" }} data-step="0">
                        <OficinaForm
                            formValues={formValues}
                            errors={errors}
                            handleFieldChange={handleFieldChange}
                            loadingCountries={loadingCountries}
                            errorCountries={errorCountries}
                            countryOptions={countryOptions}
                            citiesOficina={citiesOficina}
                            loadingCitiesOficina={loadingCitiesOficina}
                            errorCitiesOficina={errorCitiesOficina}
                            officeTypes={officeTypes}
                            isTipoOficinaEditable={officeInfo?.office_type_name !== 'Principal'} // Solo readonly si es Principal
                        />
                    </div>
                    <div className={styles.formContainer} style={{ display: currentStep === 1 ? "flex" : "none" }} data-step="1">
                        <ResponsableOficinaForm
                            formValues={formValues}
                            errors={errors}
                            handleFieldChange={handleFieldChange}
                            handleResponsableGerenteChange={handleResponsableGerenteChange}
                            isResponsableGerente={isResponsableGerente}
                            loadingCountries={loadingCountries}
                            errorCountries={errorCountries}
                            countryOptions={countryOptions}
                            citiesResponsable={citiesResponsable}
                            loadingCitiesResponsable={loadingCitiesResponsable}
                            errorCitiesResponsable={errorCitiesResponsable}
                        />
                    </div>
                    {steps.length > 2 && (
                        <div className={styles.formContainer} style={{ display: currentStep === 2 ? "flex" : "none" }} data-step="2">
                            <ContactoContableForm
                                formValues={formValues}
                                errors={errors}
                                handleFieldChange={handleFieldChange}
                                handleContableGerenteChange={handleContableGerenteChange}
                                isContableGerente={isContableGerente}
                                loadingCountries={loadingCountries}
                                errorCountries={errorCountries}
                                countryOptions={countryOptions}
                                citiesContable={citiesResponsable}
                                loadingCitiesContable={loadingCitiesResponsable}
                                errorCitiesContable={errorCitiesResponsable}
                            />
                        </div>
                    )}
                    <div className={styles.buttonsContainer}>
                        <Boton
                            label="Cancelar"
                            onClick={handleCancel}
                            type="button"
                            disabled={false}
                            tipo="transparentButton"
                            icon={<FaTimes />}
                        />
                        <Boton
                            label={currentStep === steps.length - 1 ? "Guardar Cambios" : "Continuar"}
                            onClick={handleContinue}
                            type="button"
                            disabled={false}
                            tipo={currentStep === steps.length - 1 ? "greenButton" : "blueButton"}
                            icon={currentStep === steps.length - 1 ? <FaSave /> : <FaArrowRight />}
                        />
                    </div>
                </div>
            </div>
            {showModalExito && (
                <ModalExito
                    onClose={handleCloseModal}
                    onAgregarOficina={handleCloseModal}
                    onFinalizar={handleFinalizar}
                    type={modalConfig.type}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    showButtons={modalConfig.showButtons}
                    errorDetails={modalConfig.errorDetails}
                />
            )}
        </div>
    )
}

export default EditarOficina;

