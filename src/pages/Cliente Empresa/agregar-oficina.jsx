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
import { FaCheck, FaArrowRight, FaTimes } from "react-icons/fa";
import BusinessClientRegistrationService from "../../services/businessClientRegistrationService";
import CountryService from "../../services/countryService";
import Nav from "../../components/ui/nav";

function AgregarOficina() {
    const navigate = useNavigate();
    const { clientId } = useParams();

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
    const [clientInfo, setClientInfo] = useState(null);
    const [countries, setCountries] = useState([]);
    const [officeTypes, setOfficeTypes] = useState([]);
    const [loading, setLoading] = useState(false);

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

    const steps = [
        { id: 0, title: "Oficina", icon: "1" },
        { id: 1, title: "Responsable de Oficina", icon: "2" },
        ...(clientInfo?.centralized_payment === false ? [{ id: 2, title: "Contable", icon: "3" }] : [])
    ];

    useEffect(() => {
        loadInitialData();
    }, [clientId]);

    const loadInitialData = async () => {
        try {
            // Cargar información del cliente
            const clientResponse = await BusinessClientRegistrationService.getBusinessClientById(clientId);
            if (clientResponse.success) {
                setClientInfo(clientResponse.data);
            }

            // Cargar países
            const countriesResponse = await CountryService.getAllCountries();
            if (countriesResponse.success) {
                setCountries(countriesResponse.data);
            }

            // Cargar tipos de oficina desde la base de datos
            try {
                const officeTypesResponse = await OfficeService.getOfficeTypes();
                if (officeTypesResponse.success) {
                    setOfficeTypes(officeTypesResponse.data);
                }
            } catch (error) {
                console.error('Error cargando tipos de oficina:', error);
                // Fallback a tipos hardcodeados si falla la carga
                setOfficeTypes([
                    { id: '1', name: 'Principal' },
                    { id: '2', name: 'Sucursal' },
                    { id: '3', name: 'Agencia' }
                ]);
            }
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            showErrorModal('Error al cargar datos iniciales', error.message);
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
            // Buscar todos los inputs required, incluyendo los de Combobox, InputNumero y Select
            const requiredInputs = currentForm.querySelectorAll('input[required], select[required]');
            let isValid = true;
            const newErrors = {};

            requiredInputs.forEach(input => {
                const fieldId = input.id;
                const fieldValue = input.value.trim();
                
                // Validar el campo usando la función específica
                const isFieldValid = validateField(fieldId, fieldValue);
                
                if (!isFieldValid) {
                    isValid = false;
                    // Solo aplicar borde rojo si no es un input oculto
                    if (input.type !== 'hidden') {
                        input.style.borderColor = 'red';
                    }

                    // Usar el id del input como clave para el error
                    newErrors[fieldId] = true;

                    // Mostrar mensaje de error específico para email
                    if (fieldId.includes('correoElectronico') && fieldValue) {
                        newErrors[fieldId] = 'El email debe contener @ y .com';
                    }

                    // Remover el borde rojo y error después de 2 segundos
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

            // Actualizar estado de errores
            setErrors(prev => ({ ...prev, ...newErrors }));

            // Si es válido, validar duplicados y pasar al siguiente paso
            if (isValid && currentStep < steps.length - 1) {
                // Guardar datos del paso actual
                const currentStepData = saveStepData(currentStep);

                // Validar duplicados para el paso actual
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

                    // Solo mostrar modal de duplicados en pasos de personas (1, 2)
                    if (currentStep === 1 || currentStep === 2) {
                        const duplicateMessages = duplicates.map(d => `• ${d.field}: ${d.message}`).join('\n');
                        setModalConfig({
                            type: "duplicate",
                            title: "Datos Duplicados Detectados",
                            message: `Se encontraron los siguientes datos que ya existen en el sistema:\n\n${duplicateMessages}\n\n¿Deseas continuar con el registro o corregir los datos, si continuas con el registro se desactivara las funciones de este usuario en la empresa anterior?`,
                            showButtons: true,
                            errorDetails: null
                        });
                        openModal();
                    } else {
                        // Para otros pasos (oficina), mostrar error normal
                        const duplicateMessages = duplicates.map(d => d.message).join('\n');
                        showErrorModal(`Se encontraron los siguientes duplicados:\n${duplicateMessages}`);
                    }

                    return; // No continuar al siguiente paso
                }
                
                // Marcar el paso actual como completado
                markStepAsCompleted(currentStep);
                setCurrentStep(currentStep + 1);
                clearErrors(); // Limpiar errores al avanzar

            } else if (isValid && currentStep === steps.length - 1) {
                // Guardar datos del último paso
                const lastStepData = saveStepData(currentStep);

                // Validar duplicados para el último paso
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

                    // Mostrar modal de duplicados para el último paso también
                    const duplicateMessages = duplicates.map(d => `• ${d.field}: ${d.message}`).join('\n');
                    setModalConfig({
                        type: "duplicate",
                        title: "Datos Duplicados Detectados",
                        message: `Se encontraron los siguientes datos que ya existen en el sistema:\n\n${duplicateMessages}\n\n¿Deseas continuar con el registro o corregir los datos, si continuas con el registro se desactivara las funciones de este usuario en la empresa anterior?`,
                        showButtons: true,
                        errorDetails: null
                    });
                    openModal();

                    return; // No registrar
                }
                
                // Último paso - marcar como completado y enviar formulario
                markStepAsCompleted(currentStep);

                // Guardar todos los datos del formulario
                const allFormData = {
                    oficina: {
                        nombreOficina: formValues.nombreOficina || '',
                        direccionOficina: formValues.direccionOficina || '',
                        tipoOficina: formValues.tipoOficina || '',
                        paisOficina: formValues.paisOficina || '',
                        ciudadOficina: formValues.ciudadOficina || '',
                        codigoPostalOficina: formValues.codigoPostalOficina || '',
                        celularOficina: formValues.celularOficina || '',
                        telefonoOficina: formValues.telefonoOficina || '',
                        correoElectronicoOficina: formValues.correoElectronicoOficina || '',
                        fechaAniversarioOficina: formValues.fechaAniversarioOficina || ''
                    },
                    responsable: {
                        nombreResponsable: formValues.nombreResponsable || '',
                        apellidoResponsable: formValues.apellidoResponsable || '',
                        fechaNacimientoResponsable: formValues.fechaNacimientoResponsable || '',
                        generoResponsable: formValues.generoResponsable || '',
                        dniCiResponsable: formValues.dniCiResponsable || '',
                        paisEmisionResponsable: formValues.paisEmisionResponsable || '',
                        paisResidenciaResponsable: formValues.paisResidenciaResponsable || '',
                        ciudadResponsable: formValues.ciudadResponsable || '',
                        direccionResponsable: formValues.direccionResponsable || '',
                        codigoPostalResponsable: formValues.codigoPostalResponsable || '',
                        telefonoResponsable: formValues.telefonoResponsable || '',
                        correoElectronicoResponsable: formValues.correoElectronicoResponsable || '',
                        esGerenteGeneral: isResponsableGerente
                    }
                };

                saveFormData(allFormData);

                // REGISTRAR INMEDIATAMENTE EN EL ÚLTIMO PASO
                try {
                    // Llamar a la función saveOffice que maneja la lógica correcta
                    await saveOffice();

                    // Mostrar modal de éxito
                    setModalConfig({
                        type: "success-generico",
                        title: "",
                        message: "",
                        showButtons: true,
                        errorDetails: null
                    });
                    openModal();

                } catch (error) {
                    console.error('=== ERROR EN EL REGISTRO ===');
                    console.error('Error:', error);

                    // Extraer el mensaje de error específico del backend
                    let errorMessage = 'Error al registrar la oficina';
                    let errorTitle = 'Error en el Registro';
                    let errorDetails = null;

                    if (error.response && error.response.data) {
                        const errorData = error.response.data;
                        errorMessage = errorData.message || errorMessage;
                        errorDetails = {
                            errorCode: errorData.errorCode,
                            errorType: errorData.errorType,
                            errorConstraint: errorData.errorConstraint,
                            errorDetail: errorData.errorDetail
                        };

                        // Personalizar el título según el tipo de error
                        if (errorData.errorType === 'duplicate_document') {
                            errorTitle = 'CI/NIT Duplicado';
                        } else if (errorData.errorType === 'duplicate_dni') {
                            errorTitle = 'DNI/CI Duplicado';
                        } else if (errorData.errorType === 'duplicate_email') {
                            errorTitle = 'Email Duplicado';
                        } else if (errorData.errorType === 'duplicate_cellphone') {
                            errorTitle = 'Celular Duplicado';
                        } else if (errorData.errorType === 'duplicate_code') {
                            errorTitle = 'Código Duplicado';
                        } else if (errorData.errorType === 'missing_field') {
                            errorTitle = 'Campo Requerido';
                        } else if (errorData.errorType === 'foreign_key') {
                            errorTitle = 'Referencia Inválida';
                        } else if (errorData.errorType === 'validation') {
                            errorTitle = 'Dato Inválido';
                        }
                    } else if (error.message) {
                        errorMessage = error.message;
                    }

                    // Mostrar modal de error
                    setModalConfig({
                        type: "error",
                        title: errorTitle,
                        message: errorMessage,
                        showButtons: true,
                        errorDetails: errorDetails
                    });
                    openModal();
                }
            }
        }
    };

    const handleCancel = () => {
        // Resetear el formulario usando la función del hook
        resetForm();

        // Resetear estados específicos
        setIsResponsableGerente(false);
        setIsContableGerente(false);

        // Limpiar todos los estados de ciudades usando la función del hook
        clearAllCities();

        // Redirigir a la ruta de gestionar oficinas
        navigate(`/gestionar-cliente-empresa/gestionar-oficinas/${clientId}`);
    };

    // Funciones para manejar el modal de éxito
    const handleCloseModal = () => {
        closeModal();
    };

    // Funciones de ejemplo para mostrar diferentes tipos de modal
    const showErrorModal = (message, details = null) => {
        setModalConfig({
            type: "error",
            title: "Error",
            message: message,
            showButtons: true,
            errorDetails: details
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

    const showInfoModal = (message) => {
        setModalConfig({
            type: "info",
            title: "Información",
            message: message,
            showButtons: true
        });
        openModal();
    };

    const handleAgregarOficina = () => {
        closeModal();
        // Aquí puedes agregar lógica para ir a un formulario de nueva oficina
        console.log('=== AGREGAR NUEVA OFICINA ===');
        // Por ahora, solo cerramos el modal
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
                // Último paso - continuar con el registro
                console.log('=== CONTINUANDO REGISTRO CON DUPLICADOS ===');
                // Llamar a la función saveOffice para continuar con el registro
                saveOfficeWithDuplicates();
            }
            return;
        }
        
        // Comportamiento normal para otros tipos de modal
        console.log('=== FINALIZAR MODAL - REDIRIGIENDO A GESTIONAR OFICINAS ===');

        // Resetear el formulario
        resetForm();

        // Resetear estados específicos
        setIsResponsableGerente(false);
        setIsContableGerente(false);

        // Limpiar todos los estados de ciudades
        clearAllCities();

        // Redirigir a la ruta de gestionar oficinas
        navigate(`/gestionar-cliente-empresa/gestionar-oficinas/${clientId}`);
    };

    // Función para manejar el checkbox del responsable de oficina
    const handleResponsableGerenteChange = (e) => {
        const isChecked = e.target.checked;
        console.log('=== CHECKBOX RESPONSABLE CAMBIADO ===');
        console.log('Nuevo estado:', isChecked);

        setIsResponsableGerente(isChecked);
        
        if (isChecked) {
            // Autocompletar con datos del gerente general
            console.log('=== ACTIVANDO SINCRONIZACIÓN RESPONSABLE ===');
            syncResponsableWithGerente();
        } else {
            // Limpiar los campos
            const fieldsToClear = [
                'nombreResponsable', 'apellidoResponsable', 'fechaNacimientoResponsable',
                'generoResponsable', 'dniCiResponsable', 'paisEmisionResponsable',
                'paisResidenciaResponsable', 'ciudadResponsable', 'direccionResponsable',
                'codigoPostalResponsable', 'telefonoResponsable', 'correoElectronicoResponsable'
            ];

            clearFields(fieldsToClear);
            console.log('=== LIMPIANDO DATOS DEL RESPONSABLE ===');

            // Forzar re-render de los componentes
            setTimeout(() => {
                setFormValues(prev => ({ ...prev }));
            }, 100);
        }
    };

    // Función para manejar el checkbox del contable
    const handleContableGerenteChange = (e) => {
        const isChecked = e.target.checked;
        console.log('=== CHECKBOX CONTABLE CAMBIADO ===');
        console.log('Nuevo estado:', isChecked);

        setIsContableGerente(isChecked);
        
        if (isChecked) {
            // Autocompletar con datos del gerente general
            console.log('=== ACTIVANDO SINCRONIZACIÓN CONTABLE ===');
            syncContableWithGerente();
        } else {
            // Limpiar los campos
            const fieldsToClear = [
                'nombreContable', 'apellidoContable', 'fechaNacimientoContable',
                'generoContable', 'dniCiContable', 'paisEmisionContable',
                'paisResidenciaContable', 'ciudadContable', 'direccionContable',
                'codigoPostalContable', 'telefonoContable', 'correoElectronicoContable'
            ];

            clearFields(fieldsToClear);
            console.log('=== LIMPIANDO DATOS DEL CONTABLE ===');

            // Forzar re-render de los componentes
            setTimeout(() => {
                setFormValues(prev => ({ ...prev }));
            }, 100);
        }
    };

    // Función para sincronizar responsable con gerente
    const syncResponsableWithGerente = async () => {
        try {
            // Obtener la información del gerente del cliente empresa
            const clientResponse = await BusinessClientRegistrationService.getBusinessClientById(clientId);
            
            if (clientResponse.success && clientResponse.data.gerente) {
                const gerente = clientResponse.data.gerente;
                
                // Mapear los campos del gerente al responsable
                const responsableData = {
                    nombreResponsable: gerente.first_name || '',
                    apellidoResponsable: gerente.last_name || '',
                    fechaNacimientoResponsable: gerente.birthdate ? formatDateForInput(gerente.birthdate) : '',
                    generoResponsable: gerente.gender === 'M' ? 'masculino' : 'femenino',
                    dniCiResponsable: gerente.dni || '',
                    paisEmisionResponsable: gerente.dni_country_id || '',
                    paisResidenciaResponsable: gerente.country_id || '',
                    ciudadResponsable: gerente.city_id || '',
                    direccionResponsable: gerente.address || '',
                    codigoPostalResponsable: gerente.postal_code || '',
                    telefonoResponsable: gerente.cellphone || '', // Usar cellphone para el celular
                    correoElectronicoResponsable: gerente.email || ''
                };

                // Aplicar los cambios usando handleMultipleFieldChanges
                handleMultipleFieldChanges(responsableData);
                
                console.log('=== SINCRONIZANDO RESPONSABLE CON GERENTE ===');
                console.log('Datos del gerente:', gerente);
                console.log('Datos sincronizados:', responsableData);
            } else {
                console.log('=== NO SE ENCONTRÓ INFORMACIÓN DEL GERENTE ===');
                showWarningModal('No se encontró información del gerente para este cliente empresa');
            }
        } catch (error) {
            console.error('Error obteniendo información del gerente:', error);
            showErrorModal('Error al obtener la información del gerente');
        }
    };

    // Función para sincronizar contable con gerente
    const syncContableWithGerente = async () => {
        try {
            // Obtener la información del gerente del cliente empresa
            const clientResponse = await BusinessClientRegistrationService.getBusinessClientById(clientId);
            
            if (clientResponse.success && clientResponse.data.gerente) {
                const gerente = clientResponse.data.gerente;
                
                // Mapear los campos del gerente al contable
                const contableData = {
                    nombreContable: gerente.first_name || '',
                    apellidoContable: gerente.last_name || '',
                    fechaNacimientoContable: gerente.birthdate ? formatDateForInput(gerente.birthdate) : '',
                    generoContable: gerente.gender === 'M' ? 'masculino' : 'femenino',
                    dniCiContable: gerente.dni || '',
                    paisEmisionContable: gerente.dni_country_id || '',
                    paisResidenciaContable: gerente.country_id || '',
                    ciudadContable: gerente.city_id || '',
                    direccionContable: gerente.address || '',
                    codigoPostalContable: gerente.postal_code || '',
                    telefonoContable: gerente.cellphone || '', // Usar cellphone para el celular
                    correoElectronicoContable: gerente.email || ''
                };

                // Aplicar los cambios usando handleMultipleFieldChanges
                handleMultipleFieldChanges(contableData);
                
                console.log('=== SINCRONIZANDO CONTABLE CON GERENTE ===');
                console.log('Datos del gerente:', gerente);
                console.log('Datos sincronizados:', contableData);
            } else {
                console.log('=== NO SE ENCONTRÓ INFORMACIÓN DEL GERENTE ===');
                showWarningModal('No se encontró información del gerente para este cliente empresa');
            }
        } catch (error) {
            console.error('Error obteniendo información del gerente:', error);
            showErrorModal('Error al obtener la información del gerente');
        }
    };

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

    // Función para manejar cambios en campos de responsable
    const handleResponsableFieldChange = (fieldName, value) => {
        handleFieldChange(fieldName, value);
    };

    // Función para manejar cambios en campos de contable
    const handleContableFieldChange = (fieldName, value) => {
        handleFieldChange(fieldName, value);
    };

    // Función para validar si un país es válido
    const validateCountry = (countryValue) => {
        if (!countryValue) return false;
        
        // Buscar si el valor existe en las opciones
        const isValidCountry = countryOptions.some(option => 
            option.value.toLowerCase() === countryValue.toLowerCase() || option.label.toLowerCase() === countryValue.toLowerCase()
        );
        
        return isValidCountry;
    };

    // Función para validar email
    const validateEmail = (emailValue) => {
        if (!emailValue) return false;

        // Verificar que contenga @ y .com
        const hasAtSymbol = emailValue.includes('@');
        const hasDotCom = emailValue.includes('.com');

        return hasAtSymbol && hasDotCom;
    };

    // Función para validar campos específicos
    const validateField = (fieldId, value) => {
        // Validar campos de país
        if (fieldId.includes('pais') && value) {
            return validateCountry(value);
        }

        // Validar campos de email
        if (fieldId.includes('correoElectronico') && value) {
            return validateEmail(value);
        }
        
        // Para otros campos, solo verificar que no esté vacío
        return value && value.trim() !== '';
    };

    // Función para validar duplicados en cada paso
    const validateDuplicates = async (currentStepData) => {
        const duplicates = [];

        try {
            // Solo validar nombre de oficina duplicado (paso 0)
            if (currentStep === 0 && currentStepData.nombreOficina) {
                console.log('=== VALIDANDO NOMBRE DE OFICINA ===');
                console.log('Nombre de oficina:', currentStepData.nombreOficina);
                console.log('Cliente ID:', clientId);
                
                // Validar que no exista otra oficina con el mismo nombre para este cliente
                try {
                    // Llamar al servicio para verificar si ya existe una oficina con ese nombre
                    const response = await OfficeService.getOfficesByBusinessClientId(clientId);
                    
                    if (response.success && response.data && response.data.length > 0) {
                        console.log('=== OFICINAS EXISTENTES ===');
                        console.log(response.data);
                        
                        const existingOffice = response.data.find(office => 
                            office.name && office.name.toLowerCase().trim() === currentStepData.nombreOficina.toLowerCase().trim()
                        );
                        
                        console.log('=== COMPARACIÓN ===');
                        console.log('Nombre a buscar:', currentStepData.nombreOficina.toLowerCase().trim());
                        console.log('Oficina encontrada:', existingOffice);
                        
                        if (existingOffice) {
                            duplicates.push({
                                field: 'nombreOficina',
                                message: 'Ya existe una oficina con este nombre para este cliente empresa'
                            });
                            console.log('=== DUPLICADO ENCONTRADO ===');
                        } else {
                            console.log('=== NO HAY DUPLICADOS ===');
                        }
                    } else {
                        console.log('=== NO HAY OFICINAS EXISTENTES ===');
                    }
                } catch (error) {
                    console.error('Error verificando oficinas existentes:', error);
                    // Si hay error en la verificación, permitir continuar pero mostrar advertencia
                    showWarningModal('No se pudo verificar oficinas existentes. Se continuará con el registro.');
                }
            }

            // Validar DNI del responsable (solo en paso 1, si no es el mismo que el gerente)
            if (currentStep === 1 && currentStepData.dniCiResponsable && !isResponsableGerente) {
                try {
                    const dniResponse = await BusinessClientRegistrationService.validateDuplicate('dni', currentStepData.dniCiResponsable);
                    if (dniResponse.isDuplicate) {
                        duplicates.push({
                            field: 'dniCiResponsable',
                            message: dniResponse.message || 'El DNI/CI ya está registrado en el sistema'
                        });
                    }
                } catch (error) {
                    console.error('Error validando DNI del responsable:', error);
                    showWarningModal('No se pudo validar DNI del responsable. Se continuará con el registro.');
                }
            }

            // Validar email del responsable (solo en paso 1, si no es el mismo que el gerente)
            if (currentStep === 1 && currentStepData.correoElectronicoResponsable && !isResponsableGerente) {
                try {
                    const emailResponse = await BusinessClientRegistrationService.validateDuplicate('email', currentStepData.correoElectronicoResponsable);
                    if (emailResponse.isDuplicate) {
                        duplicates.push({
                            field: 'correoElectronicoResponsable',
                            message: emailResponse.message || 'El email ya está registrado en el sistema'
                        });
                    }
                } catch (error) {
                    console.error('Error validando email del responsable:', error);
                    showWarningModal('No se pudo validar email del responsable. Se continuará con el registro.');
                }
            }

            // Validar teléfono del responsable (solo en paso 1, si no es el mismo que el gerente)
            if (currentStep === 1 && currentStepData.telefonoResponsable && !isResponsableGerente) {
                try {
                    const phoneResponse = await BusinessClientRegistrationService.validateDuplicate('cellphone', currentStepData.telefonoResponsable);
                    if (phoneResponse.isDuplicate) {
                        duplicates.push({
                            field: 'telefonoResponsable',
                            message: phoneResponse.message || 'El teléfono ya está registrado en el sistema'
                        });
                    }
                } catch (error) {
                    console.error('Error validando teléfono del responsable:', error);
                    showWarningModal('No se pudo validar teléfono del responsable. Se continuará con el registro.');
                }
            }

            // Validar DNI del contable (solo en paso 2, si no es el mismo que el gerente)
            if (currentStep === 2 && currentStepData.dniCiContable && !isContableGerente) {
                try {
                    const dniResponse = await BusinessClientRegistrationService.validateDuplicate('dni', currentStepData.dniCiContable);
                    if (dniResponse.isDuplicate) {
                        duplicates.push({
                            field: 'dniCiContable',
                            message: dniResponse.message || 'El DNI/CI ya está registrado en el sistema'
                        });
                    }
                } catch (error) {
                    console.error('Error validando DNI del contable:', error);
                    showWarningModal('No se pudo validar DNI del contable. Se continuará con el registro.');
                }
            }

            // Validar email del contable (solo en paso 2, si no es el mismo que el gerente)
            if (currentStep === 2 && currentStepData.correoElectronicoContable && !isContableGerente) {
                try {
                    const emailResponse = await BusinessClientRegistrationService.validateDuplicate('email', currentStepData.correoElectronicoContable);
                    if (emailResponse.isDuplicate) {
                        duplicates.push({
                            field: 'correoElectronicoContable',
                            message: emailResponse.message || 'El email ya está registrado en el sistema'
                        });
                    }
                } catch (error) {
                    console.error('Error validando email del contable:', error);
                    showWarningModal('No se pudo validar email del contable. Se continuará con el registro.');
                }
            }

            // Validar teléfono del contable (solo en paso 2, si no es el mismo que el gerente)
            if (currentStep === 2 && currentStepData.telefonoContable && !isContableGerente) {
                try {
                    const phoneResponse = await BusinessClientRegistrationService.validateDuplicate('cellphone', currentStepData.telefonoContable);
                    if (phoneResponse.isDuplicate) {
                        duplicates.push({
                            field: 'telefonoContable',
                            message: phoneResponse.message || 'El teléfono ya está registrado en el sistema'
                        });
                    }
                } catch (error) {
                    console.error('Error validando teléfono del contable:', error);
                    showWarningModal('No se pudo validar teléfono del contable. Se continuará con el registro.');
                }
            }

        } catch (error) {
            console.error('Error validando duplicados:', error);
            // Si hay error en la validación, permitir continuar pero mostrar advertencia
            showWarningModal('No se pudo validar duplicados. Se continuará con el registro.');
        }

        return duplicates;
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
                stepData.fechaAniversarioOficina = formValues.fechaAniversarioOficina || '';
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

            case 2: // Contable (solo si centralized_payment = false)
                if (clientInfo?.centralized_payment === false) {
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

    const saveOffice = async () => {
        try {
            setLoading(true);
            
            // Obtener el usuario logueado desde localStorage
            const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
            const currentUserId = userInfo.id || userInfo.user_id;
            
            if (!currentUserId) {
                throw new Error('No se pudo obtener el ID del usuario logueado');
            }
            
            console.log('=== INICIANDO CREACIÓN DE OFICINA ===');
            console.log('Usar gerente como responsable:', isResponsableGerente);
            console.log('Usuario logueado ID:', currentUserId);
            
            // PASO 1: VALIDAR DUPLICADOS ANTES DE CREAR NADA
            
            // Validar nombre de oficina duplicado
            const officeNameDuplicates = await validateOfficeNameDuplicate();
            if (officeNameDuplicates.length > 0) {
                throw new Error(`Ya existe una oficina con el nombre "${formValues.nombreOficina}" para este cliente empresa`);
            }
            
            // Validar persona duplicada (si no es gerente)
            if (!isResponsableGerente) {
                const personDuplicates = await validatePersonDuplicates();
                if (personDuplicates.length > 0) {
                    const duplicateMessages = personDuplicates.map(d => d.message).join('\n');
                    throw new Error(`Se encontraron los siguientes duplicados:\n${duplicateMessages}`);
                }
            }
            
            // PASO 2: CREAR PERSONA RESPONSABLE (si no es gerente)
            let responsablePersonId = null;
            if (isResponsableGerente) {
                // Usar al gerente existente
                const clientResponse = await BusinessClientRegistrationService.getBusinessClientById(clientId);
                if (clientResponse.success && clientResponse.data.gerente) {
                    responsablePersonId = clientResponse.data.gerente.id;
                    console.log('=== USANDO GERENTE EXISTENTE ===');
                    console.log('ID del gerente:', responsablePersonId);
                } else {
                    throw new Error('No se encontró información del gerente');
                }
            } else {
                // Crear nueva persona responsable
                console.log('=== CREANDO NUEVA PERSONA RESPONSABLE ===');
                const personData = {
                    first_name: formValues.nombreResponsable,
                    last_name: formValues.apellidoResponsable,
                    birthdate: formValues.fechaNacimientoResponsable,
                    gender: formValues.generoResponsable === 'masculino' ? 'M' : 'F',
                    dni: formValues.dniCiResponsable,
                    dni_country_id: formValues.paisEmisionResponsable,
                    country_id: formValues.paisResidenciaResponsable,
                    city_id: formValues.ciudadResponsable,
                    address: formValues.direccionResponsable,
                    postal_code: formValues.codigoPostalResponsable || '0000',
                    cellphone: formValues.telefonoResponsable || null,
                    email: formValues.correoElectronicoResponsable,
                    created_by: currentUserId
                };

                console.log('Datos de la persona:', personData);
                const personResponse = await BusinessClientRegistrationService.createPerson(personData);
                
                if (!personResponse.success) {
                    throw new Error(personResponse.message || 'Error al crear la persona responsable');
                }

                responsablePersonId = personResponse.data.id || personResponse.data.person_id;
                console.log('=== PERSONA RESPONSABLE CREADA EXITOSAMENTE ===');
                console.log('ID de la persona:', responsablePersonId);
            }
            
            // PASO 3: CREAR LA OFICINA
            const officeData = {
                business_client_id: clientId,
                office_type_id: formValues.tipoOficina,
                name: formValues.nombreOficina,
                address: formValues.direccionOficina,
                postal_code: formValues.codigoPostalOficina || '0000',
                phone: formValues.telefonoOficina || null,
                email: formValues.correoElectronicoOficina || null,
                cellphone: formValues.celularOficina || null,
                country_id: formValues.paisOficina,
                city_id: formValues.ciudadOficina || null,
                created_by: currentUserId
            };

            console.log('=== CREANDO OFICINA ===');
            console.log('Datos de la oficina:', officeData);

            const officeResponse = await OfficeService.createOffice(officeData);
            
            if (!officeResponse.success) {
                throw new Error(officeResponse.message || 'Error al crear la oficina');
            }

            console.log('=== OFICINA CREADA EXITOSAMENTE ===');
            const officeId = officeResponse.data.id || officeResponse.data.office_id;
            console.log('ID de la oficina:', officeId);
            
            // PASO 4: ASIGNAR ROL DE RESPONSABLE
            console.log('=== ASIGNANDO ROL DE RESPONSABLE ===');
            await assignResponsableRole(officeId, responsablePersonId, currentUserId);

            // PASO 5: MANEJAR CONTABLE (solo si centralized_payment = false)
            if (clientInfo?.centralized_payment === false) {
                if (isContableGerente) {
                    // Usar al gerente existente
                    console.log('=== ASIGNANDO ROL DE CONTABLE AL GERENTE ===');
                    await assignContableRole(officeId, responsablePersonId, currentUserId);
                } else {
                    // Crear nueva persona contable
                    console.log('=== CREANDO NUEVA PERSONA CONTABLE ===');
                    await createNewContablePerson(officeId, currentUserId);
                }
            }
            
            // Mostrar modal de éxito
            setModalConfig({
                type: "success",
                title: "Oficina Creada Exitosamente",
                message: "La oficina ha sido creada y configurada correctamente",
                showButtons: true,
                errorDetails: null
            });
            openModal();

        } catch (error) {
            console.error('Error creando oficina:', error);
            showErrorModal('Error al crear la oficina', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Función para validar nombre de oficina duplicado
    const validateOfficeNameDuplicate = async () => {
        const duplicates = [];
        try {
            const response = await OfficeService.getOfficesByBusinessClientId(clientId);
            if (response.success && response.data && response.data.length > 0) {
                const existingOffice = response.data.find(office => 
                    office.name && office.name.toLowerCase().trim() === formValues.nombreOficina.toLowerCase().trim()
                );
                if (existingOffice) {
                    duplicates.push({
                        field: 'nombreOficina',
                        message: 'Ya existe una oficina con este nombre para este cliente empresa'
                    });
                }
            }
        } catch (error) {
            console.error('Error validando nombre de oficina duplicado:', error);
            showWarningModal('No se pudo validar nombre de oficina duplicado. Se continuará con el registro.');
        }
        return duplicates;
    };

    // Función para validar persona duplicada (si no es gerente)
    const validatePersonDuplicates = async () => {
        const duplicates = [];
        try {
            const personResponse = await BusinessClientRegistrationService.getPersonsByBusinessClientId(clientId);
            if (personResponse.success && personResponse.data && personResponse.data.length > 0) {
                const existingPerson = personResponse.data.find(person => 
                    person.first_name && person.last_name &&
                    person.first_name.toLowerCase().trim() === formValues.nombreResponsable.toLowerCase().trim() &&
                    person.last_name.toLowerCase().trim() === formValues.apellidoResponsable.toLowerCase().trim()
                );
                if (existingPerson) {
                    duplicates.push({
                        field: 'nombreResponsable',
                        message: 'Ya existe una persona con este nombre para este cliente empresa'
                    });
                }
            }
        } catch (error) {
            console.error('Error validando persona duplicada:', error);
            showWarningModal('No se pudo validar persona duplicada. Se continuará con el registro.');
        }
        return duplicates;
    };

    // Función para asignar al gerente el rol de responsable de la oficina
    const assignResponsableRole = async (officeId, personId, currentUserId) => {
        try {
            console.log('=== INICIANDO ASIGNACIÓN DE ROL RESPONSABLE ===');
            console.log('officeId:', officeId);
            console.log('personId:', personId);
            console.log('currentUserId:', currentUserId);
            
            // Obtener el ID real del rol "Responsable de Oficina"
            const roleTypeId = await BusinessClientRegistrationService.getRoleTypeIdByName('Responsable de Oficina');
            console.log('roleTypeId obtenido:', roleTypeId);
                
                // Preparar datos para asignar el rol
                const roleData = {
                    business_client_id: clientId,
                person_id: personId,
                    office_id: officeId,
                role_type_id: roleTypeId,
                    is_active: true,
                created_by: currentUserId
                };

            console.log('=== ASIGNANDO ROL DE RESPONSABLE ===');
                console.log('Datos del rol:', roleData);

                // Llamar al servicio para asignar el rol
            console.log('=== LLAMANDO A OfficeService.assignPersonRole ===');
                const roleResponse = await OfficeService.assignPersonRole(roleData);
            console.log('=== RESPUESTA DE assignPersonRole ===');
            console.log('roleResponse:', roleResponse);
                
                if (roleResponse.success) {
                console.log('=== ROL DE RESPONSABLE ASIGNADO EXITOSAMENTE ===');
                } else {
                console.error('=== ERROR EN LA RESPUESTA ===');
                console.error('roleResponse.success:', roleResponse.success);
                console.error('roleResponse.message:', roleResponse.message);
                throw new Error(roleResponse.message || 'Error al asignar el rol de responsable');
            }
        } catch (error) {
            console.error('=== ERROR EN assignResponsableRole ===');
            console.error('Error completo:', error);
            throw error;
        }
    };

    // Función para crear nueva persona contable y asignar rol
    const createNewContablePerson = async (officeId, currentUserId) => {
        try {
            // Paso 1: Crear la nueva persona en la tabla person
            const personData = {
                first_name: formValues.nombreContable,
                last_name: formValues.apellidoContable,
                birthdate: formValues.fechaNacimientoContable,
                gender: formValues.generoContable === 'masculino' ? 'M' : 'F',
                dni: formValues.dniCiContable,
                dni_country_id: formValues.paisEmisionContable,
                country_id: formValues.paisResidenciaContable,
                city_id: formValues.ciudadContable,
                address: formValues.direccionContable,
                postal_code: formValues.codigoPostalContable || '0000',
                cellphone: formValues.telefonoContable || null,
                email: formValues.correoElectronicoContable,
                created_by: currentUserId
            };

            console.log('=== CREANDO NUEVA PERSONA CONTABLE ===');
            console.log('Datos de la persona:', personData);

            // Crear persona usando el servicio existente
            const personResponse = await BusinessClientRegistrationService.createPerson(personData);
            
            if (!personResponse.success) {
                throw new Error(personResponse.message || 'Error al crear la persona contable');
            }

            console.log('=== PERSONA CONTABLE CREADA EXITOSAMENTE ===');
            const personId = personResponse.data.id || personResponse.data.person_id;

            // Paso 2: Asignar rol de contable en business_person_role
            const roleTypeId = await BusinessClientRegistrationService.getRoleTypeIdByName('Contacto Contable');
            
            const roleData = {
                business_client_id: clientId,
                person_id: personId,
                office_id: officeId,
                role_type_id: roleTypeId,
                is_active: true,
                created_by: currentUserId
            };

            console.log('=== ASIGNANDO ROL DE CONTABLE A NUEVA PERSONA ===');
            console.log('Datos del rol:', roleData);

            const roleResponse = await OfficeService.assignPersonRole(roleData);
            
            if (roleResponse.success) {
                console.log('=== ROL DE CONTABLE ASIGNADO EXITOSAMENTE ===');
            } else {
                throw new Error(roleResponse.message || 'Error al asignar el rol de contable');
            }

        } catch (error) {
            console.error('Error en createNewContablePerson:', error);
            throw error;
        }
    };

    // Función para asignar al gerente el rol de contable de la oficina
    const assignContableRole = async (officeId, personId, currentUserId) => {
        try {
            // Obtener el ID real del rol "Contacto Contable"
            const roleTypeId = await BusinessClientRegistrationService.getRoleTypeIdByName('Contacto Contable');
            
            // Preparar datos para asignar el rol
            const roleData = {
                business_client_id: clientId,
                person_id: personId,
                office_id: officeId,
                role_type_id: roleTypeId,
                is_active: true,
                created_by: currentUserId // ID del usuario logueado desde localStorage
            };

            console.log('=== ASIGNANDO ROL DE CONTABLE AL GERENTE ===');
            console.log('Datos del rol:', roleData);

            // Llamar al servicio para asignar el rol
            const roleResponse = await OfficeService.assignPersonRole(roleData);
            
            if (roleResponse.success) {
                console.log('=== ROL DE CONTABLE ASIGNADO EXITOSAMENTE ===');
            } else {
                throw new Error(roleResponse.message || 'Error al asignar el rol de contable');
            }
        } catch (error) {
            console.error('Error en assignContableRole:', error);
            throw error;
        }
    };

    // Función para guardar oficina cuando hay duplicados (continuar con el registro)
    const saveOfficeWithDuplicates = async () => {
        try {
            setLoading(true);
            
            // Obtener el usuario logueado desde localStorage
            const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
            const currentUserId = userInfo.id || userInfo.user_id;
            
            if (!currentUserId) {
                throw new Error('No se pudo obtener el ID del usuario logueado');
            }
            
            console.log('=== INICIANDO CREACIÓN DE OFICINA CON DUPLICADOS ===');
            console.log('Usar gerente como responsable:', isResponsableGerente);
            console.log('Usuario logueado ID:', currentUserId);
            
            // PASO 1: CREAR PERSONA RESPONSABLE (si no es gerente)
            let responsablePersonId = null;
            if (isResponsableGerente) {
                // Usar al gerente existente
                const clientResponse = await BusinessClientRegistrationService.getBusinessClientById(clientId);
                if (clientResponse.success && clientResponse.data.gerente) {
                    responsablePersonId = clientResponse.data.gerente.id;
                    console.log('=== USANDO GERENTE EXISTENTE ===');
                    console.log('ID del gerente:', responsablePersonId);
                } else {
                    throw new Error('No se encontró información del gerente');
                }
            } else {
                // Crear nueva persona responsable (con duplicados)
                console.log('=== CREANDO NUEVA PERSONA RESPONSABLE (CON DUPLICADOS) ===');
                const personData = {
                    first_name: formValues.nombreResponsable,
                    last_name: formValues.apellidoResponsable,
                    birthdate: formValues.fechaNacimientoResponsable,
                    gender: formValues.generoResponsable === 'masculino' ? 'M' : 'F',
                    dni: formValues.dniCiResponsable,
                    dni_country_id: formValues.paisEmisionResponsable,
                    country_id: formValues.paisResidenciaResponsable,
                    city_id: formValues.ciudadResponsable,
                    address: formValues.direccionResponsable,
                    postal_code: formValues.codigoPostalResponsable || '0000',
                    cellphone: formValues.telefonoResponsable || null,
                    email: formValues.correoElectronicoResponsable,
                    created_by: currentUserId
                };

                console.log('Datos de la persona:', personData);
                const personResponse = await BusinessClientRegistrationService.createPerson(personData);
                
                if (!personResponse.success) {
                    throw new Error(personResponse.message || 'Error al crear la persona responsable');
                }

                responsablePersonId = personResponse.data.id || personResponse.data.person_id;
                console.log('=== PERSONA RESPONSABLE CREADA EXITOSAMENTE ===');
                console.log('ID de la persona:', responsablePersonId);
            }
            
            // PASO 2: CREAR LA OFICINA
            const officeData = {
                business_client_id: clientId,
                office_type_id: formValues.tipoOficina,
                name: formValues.nombreOficina,
                address: formValues.direccionOficina,
                postal_code: formValues.codigoPostalOficina || '0000',
                phone: formValues.telefonoOficina || null,
                email: formValues.correoElectronicoOficina || null,
                cellphone: formValues.celularOficina || null,
                country_id: formValues.paisOficina,
                city_id: formValues.ciudadOficina || null,
                created_by: currentUserId
            };

            console.log('=== CREANDO OFICINA ===');
            console.log('Datos de la oficina:', officeData);

            const officeResponse = await OfficeService.createOffice(officeData);
            
            if (!officeResponse.success) {
                throw new Error(officeResponse.message || 'Error al crear la oficina');
            }

            console.log('=== OFICINA CREADA EXITOSAMENTE ===');
            const officeId = officeResponse.data.id || officeResponse.data.office_id;
            console.log('ID de la oficina:', officeId);
            
            // PASO 3: ASIGNAR ROL DE RESPONSABLE
            console.log('=== ASIGNANDO ROL DE RESPONSABLE ===');
            await assignResponsableRole(officeId, responsablePersonId, currentUserId);

            // PASO 4: MANEJAR CONTABLE (solo si centralized_payment = false)
            if (clientInfo?.centralized_payment === false) {
                if (isContableGerente) {
                    // Usar al gerente existente
                    console.log('=== ASIGNANDO ROL DE CONTABLE AL GERENTE ===');
                    await assignContableRole(officeId, responsablePersonId, currentUserId);
                } else {
                    // Crear nueva persona contable (con duplicados)
                    console.log('=== CREANDO NUEVA PERSONA CONTABLE (CON DUPLICADOS) ===');
                    await createNewContablePerson(officeId, currentUserId);
                }
            }
            
            // Mostrar modal de éxito
            setModalConfig({
                type: "success",
                title: "Oficina Creada Exitosamente",
                message: "La oficina ha sido creada y configurada correctamente",
                showButtons: true,
                errorDetails: null
            });
            openModal();

        } catch (error) {
            console.error('Error creando oficina con duplicados:', error);
            showErrorModal('Error al crear la oficina', error.message);
        } finally {
            setLoading(false);
        }
    };

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
                            officeTypes={officeTypes.filter(type => type.name !== 'Principal')}
                            isTipoOficinaEditable={true}
                        />
                    </div>
                    <div className={styles.formContainer} style={{ display: currentStep === 1 ? "flex" : "none" }} data-step="1">
                        <ResponsableOficinaForm
                            formValues={formValues}
                            errors={errors}
                            handleFieldChange={handleResponsableFieldChange}
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
                    {clientInfo?.centralized_payment === false && (
                        <div className={styles.formContainer} style={{ display: currentStep === 2 ? "flex" : "none" }} data-step="2">
                            <ContactoContableForm
                                formValues={formValues}
                                errors={errors}
                                handleFieldChange={handleContableFieldChange}
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
                            label={currentStep === steps.length - 1 ? "Finalizar" : "Continuar"}
                            onClick={handleContinue}
                            type="button"
                            disabled={false}
                            tipo={currentStep === steps.length - 1 ? "greenButton" : "blueButton"}
                            icon={currentStep === steps.length - 1 ? <FaCheck /> : <FaArrowRight />}
                        />
                    </div>
                </div>
            </div>
            {showModalExito && (
                <ModalExito
                    onClose={handleCloseModal}
                    onAgregarOficina={handleAgregarOficina}
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

export default AgregarOficina;
