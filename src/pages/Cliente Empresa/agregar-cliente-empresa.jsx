import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Fondo from "../../components/common/Fondo";
import styles from "./agregar-cliente-empresa.module.css";
import logo from "../../assets/logo-MFA.png";
import Boton from "../../components/common/Boton";
import ModalExito from "../../components/ui/ModalExito";
import ClienteEmpresaForm from "../../components/ui/ClienteEmpresaForm";
import GerenteGeneralForm from "../../components/ui/GerenteGeneralForm";
import OficinaForm from "../../components/ui/OficinaForm";
import ResponsableOficinaForm from "../../components/ui/ResponsableOficinaForm";
import ContactoContableForm from "../../components/ui/ContactoContableForm";
import { useFormData } from "../../hooks/useFormData";
import { useFormState } from "../../hooks/useFormState";
import BusinessClientRegistrationService from "../../services/businessClientRegistrationService";
import { FaCheck, FaArrowRight, FaTimes } from "react-icons/fa";
import Nav from "../../components/ui/nav";



function AgregarClienteEmpresa() {
    const navigate = useNavigate();

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
        setCurrentStep
    } = useFormState({});

    // Estados específicos que no están en el hook general
    const [pagoSeleccionado, setPagoSeleccionado] = useState("centralizado");
    const [isResponsableGerente, setIsResponsableGerente] = useState(false);
    const [isContableGerente, setIsContableGerente] = useState(false);

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
    } = useFormData(formValues);


    const steps = [
        { id: 0, title: "Cliente Empresa", icon: "1" },
        { id: 1, title: "Gerente general", icon: "2" },
        { id: 2, title: "Oficina", icon: "3" },
        { id: 3, title: "Responsable de Oficina", icon: "4" },
        { id: 4, title: "Contacto contable", icon: "5" }
    ];

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

                    // Solo mostrar modal de duplicados en pasos de personas (1, 3, 4)
                    if (currentStep === 1 || currentStep === 3 || currentStep === 4) {
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
                        // Para otros pasos (cliente empresa, oficina), mostrar error normal
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

                    // Mostrar modal de error con duplicados
                    const duplicateMessages = duplicates.map(d => d.message).join('\n');
                    showErrorModal(`Se encontraron los siguientes duplicados:\n${duplicateMessages}`);

                    return; // No registrar
                }
                
                // Último paso - marcar como completado y enviar formulario
                markStepAsCompleted(currentStep);

                // Guardar todos los datos del formulario
                const allFormData = {
                    clienteEmpresa: {
                        nombreEmpresa: formValues.nombreEmpresa || '',
                        ciNitEmpresa: formValues.ciNitEmpresa || '',
                        paisEmpresa: formValues.paisEmpresa || '',
                        numeroIataEmpresa: formValues.numeroIataEmpresa || '',
                        tipoClienteEmpresa: formValues.tipoClienteEmpresa || '',
                        pagoSeleccionado: pagoSeleccionado
                    },
                    gerenteGeneral: {
                        nombreGerente: formValues.nombreGerente || '',
                        apellidoGerente: formValues.apellidoGerente || '',
                        fechaNacimientoGerente: formValues.fechaNacimientoGerente || '',
                        generoGerente: formValues.generoGerente || '',
                        dniCiGerente: formValues.dniCiGerente || '',
                        paisEmisionGerente: formValues.paisEmisionGerente || '',
                        paisResidenciaGerente: formValues.paisResidenciaGerente || '',
                        ciudadGerente: formValues.ciudadGerente || '',
                        direccionGerente: formValues.direccionGerente || '',
                        codigoPostalGerente: formValues.codigoPostalGerente || '',
                        telefonoGerente: formValues.telefonoGerente || '',
                        correoElectronicoGerente: formValues.correoElectronicoGerente || ''
                    },
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
                    },
                    contable: {
                        nombreContable: formValues.nombreContable || '',
                        apellidoContable: formValues.apellidoContable || '',
                        fechaNacimientoContable: formValues.fechaNacimientoContable || '',
                        generoContable: formValues.generoContable || '',
                        dniCiContable: formValues.dniCiContable || '',
                        paisEmisionContable: formValues.paisEmisionContable || '',
                        paisResidenciaContable: formValues.paisResidenciaContable || '',
                        ciudadContable: formValues.ciudadContable || '',
                        direccionContable: formValues.direccionContable || '',
                        codigoPostalContable: formValues.codigoPostalContable || '',
                        telefonoContable: formValues.telefonoContable || '',
                        correoElectronicoContable: formValues.correoElectronicoContable || '',
                        esGerenteGeneral: isContableGerente
                    }
                };

                saveFormData(allFormData);

                // REGISTRAR INMEDIATAMENTE EN EL ÚLTIMO PASO
                try {

                    // Enviar datos al backend
                    const response = await BusinessClientRegistrationService.registerBusinessClient(allFormData);

                    // Mostrar modal de éxito
                    setModalConfig({
                        type: "success",
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
                    let errorMessage = 'Error al registrar el cliente';
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
        setPagoSeleccionado("centralizado");

        // Limpiar todos los estados de ciudades usando la función del hook
        clearAllCities();

        // Redirigir a la ruta principal
        navigate('/');
    };

    // Funciones para manejar el modal de éxito
    const handleCloseModal = () => {
        closeModal();
    };

    // Funciones de ejemplo para mostrar diferentes tipos de modal
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
                // Aquí puedes agregar la lógica para continuar con el registro
                // Por ahora solo cerramos el modal
            }
            return;
        }
        
        // Comportamiento normal para otros tipos de modal
        console.log('=== FINALIZAR MODAL - REDIRIGIENDO A INICIO ===');

        // Resetear el formulario
        resetForm();

        // Resetear estados específicos
        setIsResponsableGerente(false);
        setIsContableGerente(false);
        setPagoSeleccionado("centralizado");

        // Limpiar todos los estados de ciudades
        clearAllCities();

        // Redirigir a la ruta principal
        navigate('/');
    };

    const handlePagoChange = (e) => {
        setPagoSeleccionado(e.target.value);
    };

    // Función para manejar el checkbox del responsable de oficina
    const handleResponsableGerenteChange = (e) => {
        const isChecked = e.target.checked;
        console.log('=== CHECKBOX RESPONSABLE CAMBIADO ===');
        console.log('Nuevo estado:', isChecked);
        console.log('Datos actuales del gerente:', {
            nombreGerente: formValues.nombreGerente,
            apellidoGerente: formValues.apellidoGerente,
            telefonoGerente: formValues.telefonoGerente,
            correoElectronicoGerente: formValues.correoElectronicoGerente
        });

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

    // Función para sincronizar responsable con gerente
    const syncResponsableWithGerente = () => {
        const responsableData = {
            nombreResponsable: formValues.nombreGerente || '',
            apellidoResponsable: formValues.apellidoGerente || '',
            fechaNacimientoResponsable: formValues.fechaNacimientoGerente || '',
            generoResponsable: formValues.generoGerente || '',
            dniCiResponsable: formValues.dniCiGerente || '',
            paisEmisionResponsable: formValues.paisEmisionGerente || '',
            paisResidenciaResponsable: formValues.paisResidenciaGerente || '',
            ciudadResponsable: formValues.ciudadGerente || '',
            direccionResponsable: formValues.direccionGerente || '',
            codigoPostalResponsable: formValues.codigoPostalGerente || '',
            telefonoResponsable: formValues.telefonoGerente || '',
            correoElectronicoResponsable: formValues.correoElectronicoGerente || ''
        };

        handleMultipleFieldChanges(responsableData);
        console.log('=== SINCRONIZANDO RESPONSABLE CON GERENTE ===');
        console.log('Datos sincronizados:', responsableData);
    };

    // Función para sincronizar automáticamente cuando cambien datos del gerente
    const syncWithGerenteChanges = (fieldName, value) => {
        // Primero actualizar el campo del gerente
        handleFieldChange(fieldName, value);

        // Luego sincronizar con responsable si está activo
        if (isResponsableGerente) {
            const responsableFieldMap = {
                'nombreGerente': 'nombreResponsable',
                'apellidoGerente': 'apellidoResponsable',
                'fechaNacimientoGerente': 'fechaNacimientoResponsable',
                'generoGerente': 'generoResponsable',
                'dniCiGerente': 'dniCiResponsable',
                'paisEmisionGerente': 'paisEmisionResponsable',
                'paisResidenciaGerente': 'paisResidenciaResponsable',
                'ciudadGerente': 'ciudadResponsable',
                'direccionGerente': 'direccionResponsable',
                'codigoPostalGerente': 'codigoPostalResponsable',
                'telefonoGerente': 'telefonoResponsable',
                'correoElectronicoGerente': 'correoElectronicoResponsable'
            };

            const responsableField = responsableFieldMap[fieldName];
            if (responsableField) {
                handleFieldChange(responsableField, value);
                console.log(`=== SINCRONIZANDO ${fieldName} → ${responsableField} ===`);
            }
        }

        // Sincronizar con contable si está activo
        if (isContableGerente) {
            const contableFieldMap = {
                'nombreGerente': 'nombreContable',
                'apellidoGerente': 'apellidoContable',
                'fechaNacimientoGerente': 'fechaNacimientoContable',
                'generoGerente': 'generoContable',
                'dniCiGerente': 'dniCiContable',
                'paisEmisionGerente': 'paisEmisionContable',
                'paisResidenciaGerente': 'paisResidenciaContable',
                'ciudadGerente': 'ciudadContable',
                'direccionGerente': 'direccionContable',
                'codigoPostalGerente': 'codigoPostalContable',
                'telefonoGerente': 'telefonoContable',
                'correoElectronicoGerente': 'correoElectronicoContable'
            };

            const contableField = contableFieldMap[fieldName];
            if (contableField) {
                handleFieldChange(contableField, value);
                console.log(`=== SINCRONIZANDO ${fieldName} → ${contableField} ===`);
            }
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

    // Función para manejar el checkbox del contacto contable
    const handleContableGerenteChange = (e) => {
        const isChecked = e.target.checked;
        console.log('=== CHECKBOX CONTABLE CAMBIADO ===');
        console.log('Nuevo estado:', isChecked);
        console.log('Datos actuales del gerente:', {
            nombreGerente: formValues.nombreGerente,
            apellidoGerente: formValues.apellidoGerente,
            telefonoGerente: formValues.telefonoGerente,
            correoElectronicoGerente: formValues.correoElectronicoGerente
        });

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
        }
    };

    // Función para sincronizar contable con gerente
    const syncContableWithGerente = () => {
        const contableData = {
            nombreContable: formValues.nombreGerente || '',
            apellidoContable: formValues.apellidoGerente || '',
            fechaNacimientoContable: formValues.fechaNacimientoGerente || '',
            generoContable: formValues.generoGerente || '',
            dniCiContable: formValues.dniCiGerente || '',
            paisEmisionContable: formValues.paisEmisionGerente || '',
            paisResidenciaContable: formValues.paisResidenciaGerente || '',
            ciudadContable: formValues.ciudadGerente || '',
            direccionContable: formValues.direccionGerente || '',
            codigoPostalContable: formValues.codigoPostalGerente || '',
            telefonoContable: formValues.telefonoGerente || '',
            correoElectronicoContable: formValues.correoElectronicoGerente || ''
        };

        handleMultipleFieldChanges(contableData);
        console.log('=== SINCRONIZANDO CONTABLE CON GERENTE ===');
        console.log('Datos sincronizados:', contableData);
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
            // Validar CI/NIT del cliente empresa (solo en paso 0)
            if (currentStep === 0 && currentStepData.ciNitEmpresa) {
                const ciNitResponse = await BusinessClientRegistrationService.validateDuplicate('document_number', currentStepData.ciNitEmpresa);
                if (ciNitResponse.isDuplicate) {
                    duplicates.push({
                        field: 'ciNitEmpresa',
                        message: ciNitResponse.message || 'El CI/NIT ya está registrado en el sistema'
                    });
                }
            }

            // Validar DNI del gerente (solo en paso 1)
            if (currentStep === 1 && currentStepData.dniCiGerente) {
                const dniResponse = await BusinessClientRegistrationService.validateDuplicate('dni', currentStepData.dniCiGerente);
                if (dniResponse.isDuplicate) {
                    duplicates.push({
                        field: 'dniCiGerente',
                        message: dniResponse.message || 'El DNI/CI ya está registrado en el sistema'
                    });
                }
            }

            // Validar email del gerente (solo en paso 1)
            if (currentStep === 1 && currentStepData.correoElectronicoGerente) {
                const emailResponse = await BusinessClientRegistrationService.validateDuplicate('email', currentStepData.correoElectronicoGerente);
                if (emailResponse.isDuplicate) {
                    duplicates.push({
                        field: 'correoElectronicoGerente',
                        message: emailResponse.message || 'El email ya está registrado en el sistema'
                    });
                }
            }

            // Validar teléfono del gerente (solo en paso 1)
            if (currentStep === 1 && currentStepData.telefonoGerente) {
                const phoneResponse = await BusinessClientRegistrationService.validateDuplicate('cellphone', currentStepData.telefonoGerente);
                if (phoneResponse.isDuplicate) {
                    duplicates.push({
                        field: 'telefonoGerente',
                        message: phoneResponse.message || 'El teléfono ya está registrado en el sistema'
                    });
                }
            }

            // Validar email de la oficina (solo en paso 2)
            if (currentStep === 2 && currentStepData.correoElectronicoOficina) {
                const emailResponse = await BusinessClientRegistrationService.validateDuplicate('office_email', currentStepData.correoElectronicoOficina);
                if (emailResponse.isDuplicate) {
                    duplicates.push({
                        field: 'correoElectronicoOficina',
                        message: emailResponse.message || 'El email ya está registrado en el sistema'
                    });
                }
            }

            // Validar teléfono de la oficina (solo en paso 2)
            if (currentStep === 2 && currentStepData.telefonoOficina) {
                const phoneResponse = await BusinessClientRegistrationService.validateDuplicate('phone', currentStepData.telefonoOficina);
                if (phoneResponse.isDuplicate) {
                    duplicates.push({
                        field: 'telefonoOficina',
                        message: phoneResponse.message || 'El teléfono ya está registrado en el sistema'
                    });
                }
            }

            // Validar DNI del responsable (solo en paso 3, si no es el mismo que el gerente)
            if (currentStep === 3 && currentStepData.dniCiResponsable && !isResponsableGerente) {
                const dniResponse = await BusinessClientRegistrationService.validateDuplicate('dni', currentStepData.dniCiResponsable);
                if (dniResponse.isDuplicate) {
                    duplicates.push({
                        field: 'dniCiResponsable',
                        message: dniResponse.message || 'El DNI/CI ya está registrado en el sistema'
                    });
                }
            }

            // Validar email del responsable (solo en paso 3, si no es el mismo que el gerente)
            if (currentStep === 3 && currentStepData.correoElectronicoResponsable && !isResponsableGerente) {
                const emailResponse = await BusinessClientRegistrationService.validateDuplicate('email', currentStepData.correoElectronicoResponsable);
                if (emailResponse.isDuplicate) {
                    duplicates.push({
                        field: 'correoElectronicoResponsable',
                        message: emailResponse.message || 'El email ya está registrado en el sistema'
                    });
                }
            }

            // Validar teléfono del responsable (solo en paso 3, si no es el mismo que el gerente)
            if (currentStep === 3 && currentStepData.telefonoResponsable && !isResponsableGerente) {
                const phoneResponse = await BusinessClientRegistrationService.validateDuplicate('cellphone', currentStepData.telefonoResponsable);
                if (phoneResponse.isDuplicate) {
                    duplicates.push({
                        field: 'telefonoResponsable',
                        message: phoneResponse.message || 'El teléfono ya está registrado en el sistema'
                    });
                }
            }

            // Validar DNI del contable (solo en paso 4, si no es el mismo que el gerente)
            if (currentStep === 4 && currentStepData.dniCiContable && !isContableGerente) {
                const dniResponse = await BusinessClientRegistrationService.validateDuplicate('dni', currentStepData.dniCiContable);
                if (dniResponse.isDuplicate) {
                    duplicates.push({
                        field: 'dniCiContable',
                        message: dniResponse.message || 'El DNI/CI ya está registrado en el sistema'
                    });
                }
            }

            // Validar email del contable (solo en paso 4, si no es el mismo que el gerente)
            if (currentStep === 4 && currentStepData.correoElectronicoContable && !isContableGerente) {
                const emailResponse = await BusinessClientRegistrationService.validateDuplicate('email', currentStepData.correoElectronicoContable);
                if (emailResponse.isDuplicate) {
                    duplicates.push({
                        field: 'correoElectronicoContable',
                        message: emailResponse.message || 'El email ya está registrado en el sistema'
                    });
                }
            }

            // Validar teléfono del contable (solo en paso 4, si no es el mismo que el gerente)
            if (currentStep === 4 && currentStepData.telefonoContable && !isContableGerente) {
                const phoneResponse = await BusinessClientRegistrationService.validateDuplicate('cellphone', currentStepData.telefonoContable);
                if (phoneResponse.isDuplicate) {
                    duplicates.push({
                        field: 'telefonoContable',
                        message: phoneResponse.message || 'El teléfono ya está registrado en el sistema'
                    });
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
            case 0: // Cliente Empresa
                stepData.nombreEmpresa = formValues.nombreEmpresa || '';
                stepData.ciNitEmpresa = formValues.ciNitEmpresa || '';
                stepData.paisEmpresa = formValues.paisEmpresa || '';
                stepData.numeroIataEmpresa = formValues.numeroIataEmpresa || '';
                stepData.tipoClienteEmpresa = formValues.tipoClienteEmpresa || '';
                stepData.pagoSeleccionado = pagoSeleccionado;
                console.log('=== DATOS DEL PASO 0 - CLIENTE EMPRESA ===');
                console.log(stepData);
                break;
                
            case 1: // Gerente General
                stepData.nombreGerente = formValues.nombreGerente || '';
                stepData.apellidoGerente = formValues.apellidoGerente || '';
                stepData.fechaNacimientoGerente = formValues.fechaNacimientoGerente || '';
                stepData.generoGerente = formValues.generoGerente || '';
                stepData.dniCiGerente = formValues.dniCiGerente || '';
                stepData.paisEmisionGerente = formValues.paisEmisionGerente || '';
                stepData.paisResidenciaGerente = formValues.paisResidenciaGerente || '';
                stepData.ciudadGerente = formValues.ciudadGerente || '';
                stepData.direccionGerente = formValues.direccionGerente || '';
                stepData.codigoPostalGerente = formValues.codigoPostalGerente || '';
                stepData.telefonoGerente = formValues.telefonoGerente || '';
                stepData.correoElectronicoGerente = formValues.correoElectronicoGerente || '';
                console.log('=== DATOS DEL PASO 1 - GERENTE GENERAL ===');
                console.log(stepData);
                break;
                
            case 2: // Oficina
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
                console.log('=== DATOS DEL PASO 2 - OFICINA ===');
                console.log(stepData);
                break;
                
            case 3: // Responsable de Oficina
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
                console.log('=== DATOS DEL PASO 3 - RESPONSABLE DE OFICINA ===');
                console.log(stepData);
                break;
                
            case 4: // Contacto Contable
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
                console.log('=== DATOS DEL PASO 4 - CONTACTO CONTABLE ===');
                console.log(stepData);
                break;
        }
        
        return stepData;
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
                        <ClienteEmpresaForm
                            formValues={formValues}
                            errors={errors}
                            handleFieldChange={handleFieldChange}
                            handlePagoChange={handlePagoChange}
                            pagoSeleccionado={pagoSeleccionado}
                            loadingCountries={loadingCountries}
                            loadingTypes={loadingTypes}
                            errorCountries={errorCountries}
                            errorTypes={errorTypes}
                            countryOptions={countryOptions}
                            businessClientTypeOptions={businessClientTypeOptions}
                        />
                    </div>
                    <div className={styles.formContainer} style={{ display: currentStep === 1 ? "flex" : "none" }} data-step="1">
                        <GerenteGeneralForm
                            formValues={formValues}
                            errors={errors}
                            handleFieldChange={syncWithGerenteChanges}
                            loadingCountries={loadingCountries}
                            errorCountries={errorCountries}
                            countryOptions={countryOptions}
                            citiesGerente={citiesGerente}
                            loadingCitiesGerente={loadingCitiesGerente}
                            errorCitiesGerente={errorCitiesGerente}
                        />
                    </div>
                    <div className={styles.formContainer} style={{ display: currentStep === 2 ? "flex" : "none" }} data-step="2">
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
                        />
                    </div>
                    <div className={styles.formContainer} style={{ display: currentStep === 3 ? "flex" : "none" }} data-step="3">
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
                    <div className={styles.formContainer} style={{ display: currentStep === 4 ? "flex" : "none" }} data-step="4">
                        <ContactoContableForm
                            formValues={formValues}
                            errors={errors}
                            handleFieldChange={handleContableFieldChange}
                            handleContableGerenteChange={handleContableGerenteChange}
                            isContableGerente={isContableGerente}
                            loadingCountries={loadingCountries}
                            errorCountries={errorCountries}
                            countryOptions={countryOptions}
                            citiesContable={citiesContable}
                            loadingCitiesContable={loadingCitiesContable}
                            errorCitiesContable={errorCitiesContable}
                        />
                    </div>
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
                    clienteEmpresa={formDataCompleto.clienteEmpresa}
                    oficinaPrincipal={formDataCompleto.oficina}
                    tipoGestionPagos={formDataCompleto.clienteEmpresa}
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
export default AgregarClienteEmpresa;