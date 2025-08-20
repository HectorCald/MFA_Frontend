import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Fondo from "../../components/common/Fondo";
import styles from "./agregar-cliente-empresa.module.css";
import logo from "../../assets/logo-MFA.png";
import Boton from "../../components/common/Boton";
import ModalExito from "../../components/ui/ModalExito";
import ClienteEmpresaForm from "../../components/ui/ClienteEmpresaForm";
import GerenteGeneralForm from "../../components/ui/GerenteGeneralForm";
import { useFormData } from "../../hooks/useFormData";
import { useFormState } from "../../hooks/useFormState";
import BusinessClientRegistrationService from "../../services/businessClientRegistrationService";
import { FaCheck, FaArrowRight, FaTimes, FaSave } from "react-icons/fa";
import Nav from "../../components/ui/nav";

function EditarClienteEmpresa() {
    const navigate = useNavigate();
    const { id } = useParams();

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
    const [pagoSeleccionado, setPagoSeleccionado] = useState("centralizado");
    console.log('=== ESTADO INICIAL PAGO ===');
    console.log('pagoSeleccionado inicial:', "centralizado");
    const [loading, setLoading] = useState(true);
    const [clientData, setClientData] = useState(null);

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

        // Opciones formateadas
        countryOptions,
        businessClientTypeOptions,

        // Funciones
        clearAllCities
    } = useFormData(formValues);

    const steps = [
        { id: 0, title: "Cliente Empresa", icon: "1" },
        { id: 1, title: "Gerente general", icon: "2" }
    ];

    // Cargar datos del cliente al montar el componente
    useEffect(() => {
        console.log('=== USE EFFECT EJECUTADO ===');
        console.log('ID del cliente:', id);
        loadClientData();
    }, [id]);

    const loadClientData = async () => {
        try {
            setLoading(true);
            // Obtener datos del cliente usando el servicio
            const response = await BusinessClientRegistrationService.getBusinessClientById(id);
            
            if (response.success) {
                const clientData = response.data;
                setClientData(clientData);
                
                // Llenar el formulario con los datos existentes
                setFormValues({
                    // Datos del cliente empresa
                    nombreEmpresa: clientData.name || '',
                    ciNitEmpresa: clientData.document_number || '',
                    paisEmpresa: clientData.country_id || '',
                    numeroIataEmpresa: clientData.iata_number || '',
                    tipoClienteEmpresa: clientData.business_client_type_id || '',
                    
                    // Datos del gerente general (asumiendo que viene en la respuesta)
                    nombreGerente: clientData.gerente?.first_name || '',
                    apellidoGerente: clientData.gerente?.last_name || '',
                    fechaNacimientoGerente: formatDateForInput(clientData.gerente?.birthdate) || '',
                    generoGerente: clientData.gerente?.gender === 'M' ? 'masculino' : 'femenino',
                    dniCiGerente: clientData.gerente?.dni || '',
                    paisEmisionGerente: clientData.gerente?.dni_country_id || '',
                    paisResidenciaGerente: clientData.gerente?.country_id || '',
                    ciudadGerente: clientData.gerente?.city_id || '',
                    direccionGerente: clientData.gerente?.address || '',
                    codigoPostalGerente: clientData.gerente?.postal_code || '',
                    telefonoGerente: clientData.gerente?.cellphone || '',
                    correoElectronicoGerente: clientData.gerente?.email || ''
                });

                // Configurar el tipo de pago
                console.log('=== CONFIGURANDO TIPO DE PAGO ===');
                console.log('centralized_payment:', clientData.centralized_payment);
                console.log('Tipo de pago a establecer:', clientData.centralized_payment ? 'centralizado' : 'descentralizado');
                setPagoSeleccionado(clientData.centralized_payment ? 'centralizado' : 'descentralizado');
                console.log('Estado pagoSeleccionado después de setPagoSeleccionado:', clientData.centralized_payment ? 'centralizado' : 'descentralizado');

                // Marcar ambos pasos como completados
                markStepAsCompleted(0);
                markStepAsCompleted(1);

            } else {
                throw new Error('No se pudieron obtener los datos del cliente');
            }

        } catch (error) {
            console.error('Error cargando datos del cliente:', error);
            setModalConfig({
                type: "error",
                title: "Error",
                message: "No se pudieron cargar los datos del cliente",
                showButtons: true
            });
            openModal();
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
            // Buscar todos los inputs required
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
                    if (input.type !== 'hidden') {
                        input.style.borderColor = 'red';
                    }
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

                    // En editar, NO permitir continuar con duplicados - solo mostrar error
                    const duplicateMessages = duplicates.map(d => `• ${d.field}: ${d.message}`).join('\n');
                    setModalConfig({
                        type: "error",
                        title: "Datos Duplicados Detectados",
                        message: `Se encontraron los siguientes datos que ya existen en el sistema:\n\n${duplicateMessages}\n\nDebes corregir estos datos antes de continuar.`,
                        showButtons: true,
                        errorDetails: null
                    });
                    openModal();

                    return; // No continuar al siguiente paso
                }

                // Marcar el paso actual como completado
                markStepAsCompleted(currentStep);
                setCurrentStep(currentStep + 1);
                clearErrors(); // Limpiar errores al avanzar

            } else if (isValid && currentStep === steps.length - 1) {
                // Último paso - guardar cambios
                await saveChanges();
            }
        }
    };

    const saveChanges = async () => {
        try {
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
                }
            };

            console.log('=== GUARDANDO CAMBIOS ===');
            console.log('Datos a enviar:', allFormData);

            // Llamar al servicio de editar
            const response = await BusinessClientRegistrationService.updateBusinessClient(id, allFormData);

            if (response.success) {
                console.log('=== CAMBIOS GUARDADOS EXITOSAMENTE ===');

                // Mostrar modal de éxito
                setModalConfig({
                    type: "success-generico",
                    title: "¡Cambios Guardados!",
                    message: "Los datos del cliente empresa y gerente general han sido actualizados correctamente.",
                    showButtons: true,
                    errorDetails: null
                });
                openModal();
            } else {
                throw new Error(response.message || 'Error al guardar los cambios');
            }

        } catch (error) {
            console.error('=== ERROR AL GUARDAR CAMBIOS ===');
            console.error('Error:', error);

            // Mostrar modal de error
            setModalConfig({
                type: "error",
                title: "Error al Guardar",
                message: error.message || "No se pudieron guardar los cambios. Por favor, inténtalo de nuevo.",
                showButtons: true,
                errorDetails: null
            });
            openModal();
        }
    };

    const handleCancel = () => {
        // Resetear el formulario usando la función del hook
        resetForm();

        // Resetear estados específicos
        setPagoSeleccionado("centralizado");

        // Limpiar todos los estados de ciudades usando la función del hook
        clearAllCities();

        console.log('=== EDICIÓN CANCELADA - REDIRIGIENDO A GESTIONAR ===');

        // Redirigir a la página de gestionar
        navigate('/gestionar-cliente-empresa');
    };

    // Funciones para manejar el modal de éxito
    const handleCloseModal = () => {
        closeModal();
    };

    const handleFinalizar = () => {
        closeModal();
        console.log('=== FINALIZAR MODAL - REDIRIGIENDO A GESTIONAR ===');

        // Resetear el formulario
        resetForm();

        // Resetear estados específicos
        setPagoSeleccionado("centralizado");

        // Limpiar todos los estados de ciudades
        clearAllCities();

        // Redirigir a la página de gestionar
        navigate('/gestionar-cliente-empresa');
    };

    const handlePagoChange = (e) => {
        setPagoSeleccionado(e.target.value);
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
                const ciNitResponse = await BusinessClientRegistrationService.validateDuplicate('document_number', currentStepData.ciNitEmpresa, id);
                if (ciNitResponse.isDuplicate) {
                    duplicates.push({
                        field: 'ciNitEmpresa',
                        message: ciNitResponse.message || 'El CI/NIT ya está registrado en el sistema'
                    });
                }
            }

            // Validar DNI del gerente (solo en paso 1)
            if (currentStep === 1 && currentStepData.dniCiGerente) {
                const dniResponse = await BusinessClientRegistrationService.validateDuplicate('dni', currentStepData.dniCiGerente, id);
                if (dniResponse.isDuplicate) {
                    duplicates.push({
                        field: 'dniCiGerente',
                        message: dniResponse.message || 'El DNI/CI ya está registrado en el sistema'
                    });
                }
            }

            // Validar email del gerente (solo en paso 1)
            if (currentStep === 1 && currentStepData.correoElectronicoGerente) {
                const emailResponse = await BusinessClientRegistrationService.validateDuplicate('email', currentStepData.correoElectronicoGerente, id);
                if (emailResponse.isDuplicate) {
                    duplicates.push({
                        field: 'correoElectronicoGerente',
                        message: emailResponse.message || 'El email ya está registrado en el sistema'
                    });
                }
            }

            // Validar teléfono del gerente (solo en paso 1)
            if (currentStep === 1 && currentStepData.telefonoGerente) {
                const phoneResponse = await BusinessClientRegistrationService.validateDuplicate('cellphone', currentStepData.telefonoGerente, id);
                if (phoneResponse.isDuplicate) {
                    duplicates.push({
                        field: 'telefonoGerente',
                        message: phoneResponse.message || 'El teléfono ya está registrado en el sistema'
                    });
                }
            }

        } catch (error) {
            console.error('Error validando duplicados:', error);
            // Si hay error en la validación, permitir continuar pero mostrar advertencia
            setModalConfig({
                type: "warning",
                title: "Advertencia",
                message: "No se pudo validar duplicados. Se continuará con la edición.",
                showButtons: true
            });
            openModal();
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
        }

        return stepData;
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <Nav />
                <Fondo />
                <div className={styles.content}>
                    <h1 className={styles.title}>Editando Cliente Empresa</h1>
                    <div className={styles.loading}>
                        Cargando datos del cliente...
                    </div>
                </div>
            </div>
        );
    }

    console.log('=== RENDERIZANDO COMPONENTE ===');
    console.log('pagoSeleccionado en render:', pagoSeleccionado);
    
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
                            handleFieldChange={handleFieldChange}
                            loadingCountries={loadingCountries}
                            errorCountries={errorCountries}
                            countryOptions={countryOptions}
                            citiesGerente={citiesGerente}
                            loadingCitiesGerente={loadingCitiesGerente}
                            errorCitiesGerente={errorCitiesGerente}
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
                    clienteEmpresa={formDataCompleto.clienteEmpresa}
                    oficinaPrincipal={formDataCompleto.oficina}
                    tipoGestionPagos={formDataCompleto.clienteEmpresa}
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

export default EditarClienteEmpresa;
