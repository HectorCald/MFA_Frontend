import styles from "./EditarUsuario.module.css";
import Nav from "../../components/ui/nav";
import Fondo from "../../components/common/Fondo";
import { useState, useEffect } from "react";
import Boton from "../../components/common/Boton";
import { FaTimes, FaCheck, FaArrowRight, FaUser, FaInfoCircle } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../../components/common/Input";
import InputNumero from "../../components/common/InputNumero";
import Combobox from "../../components/common/Combobox";
import Select from "../../components/common/Select";
import CountryService from '../../services/countryService';
import CityService from '../../services/cityService';
import CheckBox from "../../components/common/CheckBox";
import SingleCheckBox from "../../components/common/SingleCheckBox";
import ModalExito from "../../components/ui/ModalExito";
import Lista from "../../components/common/Lista";
import Loader from "../../components/common/Loader";


import PersonService from '../../services/personService';
import RoleService from '../../services/roleService';
import UserService from '../../services/userService';


let showLoaderText = "";

function EditarUsuario() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [formValues, setFormValues] = useState({});
    const [errors, setErrors] = useState({});
    const [originalUserInfo, setOriginalUserInfo] = useState(null); // Para almacenar la información original del usuario
    const [showLoader, setShowLoader] = useState(false);


    //----------------------------------------------------------------------------
    // Estados de modales de exito y perfil de usuario
    const [showModalError, setShowModalError] = useState(false);
    const [showModalExito, setShowModalExito] = useState(false);
    const [showModalPerfilUsuario, setShowModalPerfilUsuario] = useState(false);

    //----------------------------------------------------------------------------
    // Obtener información del usuario al montar el componente
    useEffect(() => {
        const loadUserInfo = async () => {
            if (id) {
                try {
                    showLoaderText = "Cargando información del usuario...";
                    setShowLoader(true);
                    // Obtener información completa del usuario desde la BD
                    const userInfo = await UserService.getUserById(id);
                    
                    if (userInfo) {
                        // Guardar la información original del usuario para comparaciones
                        setOriginalUserInfo(userInfo);
                        
                        // Mapear los datos del usuario a los campos del formulario
                        const mappedFormValues = {
                            // Paso 1: Datos del usuario
                            nombreUsuario: userInfo.first_name || '',
                            apellidoUsuario: userInfo.last_name || '',
                            dniCiUsuario: userInfo.dni || '',
                            paisEmisionUsuario: userInfo.country_id || '', // País de emisión del DNI
                            generoUsuario: userInfo.gender === 'M' ? 'masculino' : userInfo.gender === 'F' ? 'femenino' : '',
                            fechaNacimientoUsuario: userInfo.birthdate ? userInfo.birthdate.split('T')[0] : '', // Convertir fecha ISO a formato date
                            
                            // Paso 2: Contacto
                            paisResidenciaUsuario: userInfo.country_id || '', // País de residencia
                            ciudadUsuario: userInfo.city_id || '',
                            direccionUsuario: userInfo.address || '',
                            codigoPostalUsuario: userInfo.postal_code || '0000',
                            telefonoUsuario: userInfo.cellphone || '',
                            correoElectronicoUsuario: userInfo.email || '',
                            
                            // Roles (se mapearán en el paso 3)
                        };
                        
                        // Mapear los roles del usuario
                        if (userInfo.roles && Array.isArray(userInfo.roles)) {
                            userInfo.roles.forEach(role => {
                                if (role.role_code) {
                                    mappedFormValues[role.role_code] = true;
                                } else if (role.code) {
                                    mappedFormValues[role.code] = true;
                                } else if (role.id) {
                                    mappedFormValues[role.id] = true;
                                }
                            });
                        }
                        // También verificar si hay roles en formato string
                        if (userInfo.roles && typeof userInfo.roles === 'string') {
                            const rolesArray = userInfo.roles.split(',').map(r => r.trim());
                            rolesArray.forEach(roleCode => {
                                if (roleCode) {
                                    mappedFormValues[roleCode] = true;
                                }
                            });
                        }

                        // Establecer los valores del formulario
                        setFormValues(mappedFormValues);
                        
                        // Cargar las ciudades del país de residencia si existe
                        if (userInfo.country_id) {
                            handleCountryChange(userInfo.country_id);
                            // Esperar a que se carguen las ciudades y luego establecer la ciudad
                            setTimeout(() => {
                                if (userInfo.city_id) {
                                    setFormValues(prev => ({
                                        ...prev,
                                        ciudadUsuario: userInfo.city_id
                                    }));
                                }
                            }, 500);
                        }
                        
                        // Marcar todos los pasos como completados para permitir navegación libre
                        setCompletedSteps([0, 1, 2]);

                        
                    } else {
                        console.log('❌ No se pudo obtener la información del usuario');
                    }
                } catch (error) {
                    console.error('❌ Error al obtener información del usuario para editar:', error);
                } finally {
                    setShowLoader(false);
                }
            } else {
                console.log('❌ No hay ID de usuario en la URL');
            }
        };

        loadUserInfo();
    }, [id]);


    //----------------------------------------------------------------------------
    // Países
    function country() {
        // Estados para países
        const [countries, setCountries] = useState([]);
        const [loadingCountries, setLoadingCountries] = useState(true);
        const [errorCountries, setErrorCountries] = useState(null);

        // Opciones formateadas
        const [countryOptions, setCountryOptions] = useState([]);

        // Cargar países al montar el componente
        useEffect(() => {
            const loadCountries = async () => {
                try {
                    setLoadingCountries(true);
                    setErrorCountries(null);

                    const countriesData = await CountryService.getAllCountries();

                    setCountries(countriesData);

                    // Formatear los países para el Combobox
                    const formattedOptions = countriesData.map(country => ({
                        label: country.name || country.country_name || country.nombre || country.name_common,
                        value: country.id || country.country_id || country.code || country.iso_code
                    }));

                    // Agregar opción por defecto
                    const optionsWithDefault = [
                        ...formattedOptions
                    ];

                    setCountryOptions(optionsWithDefault);

                } catch (error) {
                    console.error('❌ Error al cargar países:', error);
                    setErrorCountries(error.message);

                    // Opciones por defecto en caso de error
                    setCountryOptions([
                        { label: "Error al cargar países", value: "" },
                    ]);
                } finally {
                    setLoadingCountries(false);
                }
            };

            loadCountries();
        }, []);

        return {
            countries,
            loadingCountries,
            errorCountries,
            countryOptions,

        }
    }
    const { countries, loadingCountries, errorCountries, countryOptions } = country();


    //----------------------------------------------------------------------------
    // Ciudades
    function city() {
        const [cities, setCities] = useState([]);
        const [loadingCities, setLoadingCities] = useState(false);
        const [errorCities, setErrorCities] = useState(null);

        // Función para cargar las ciudades por país
        const loadCitiesByCountry = async (countryId) => {
            if (!countryId) {
                setCities([]);
                return;
            }

            try {
                setLoadingCities(true);
                setErrorCities(null);

                const citiesData = await CityService.getCityByCountryId(countryId);
                setCities(citiesData || []);
            }
            catch (error) {
                console.error('❌ Error al cargar ciudades:', error);
                setErrorCities(error.message);
                setCities([]);
            }
            finally {
                setLoadingCities(false);
            }
        };

        // Función para manejar el cambio de país y cargar ciudades
        const handleCountryChange = (countryId) => {
            // Limpiar la ciudad seleccionada cuando cambie el país
            setFormValues(prev => ({
                ...prev,
                ciudadUsuario: ''
            }));

            // Cargar las ciudades del país seleccionado
            loadCitiesByCountry(countryId);
        };

        return {
            cities,
            loadingCities,
            errorCities,
            loadCitiesByCountry,
            handleCountryChange,
        }
    }
    const { cities, loadingCities, errorCities, loadCitiesByCountry, handleCountryChange } = city();


    //----------------------------------------------------------------------------
    // Roles
    function role() {
        const [roles, setRoles] = useState([]);
        const [loadingRoles, setLoadingRoles] = useState(true);
        const [errorRoles, setErrorRoles] = useState(null);

        // Cargar roles al montar el componente
        useEffect(() => {
            const loadRoles = async () => {
                try {
                    setLoadingRoles(true);
                    setErrorRoles(null);

                    const rolesData = await RoleService.getAllRoles();
                    // Filtrar solo roles activos
                    const activeRoles = rolesData.filter(role => role.is_active === true);
                    setRoles(activeRoles || []);
                } catch (error) {
                    console.error('❌ Error al cargar roles:', error);
                    setErrorRoles(error.message);
                    setRoles([]);
                } finally {
                    setLoadingRoles(false);
                }
            };

            loadRoles();
        }, []);

        return {
            roles,
            loadingRoles,
            errorRoles,
        }
    }
    const { roles, loadingRoles, errorRoles } = role();


    //----------------------------------------------------------------------------
    // Pasos del formulario
    const steps = [
        { id: 0, title: "Datos de usuario", icon: "1" },
        { id: 1, title: "Contacto", icon: "2" },
        { id: 2, title: "Asignar roles", icon: "3" },
    ];


    //----------------------------------------------------------------------------
    // Validar campos requeridos del paso actual
    const validateCurrentStep = async () => {
        const newErrors = {};

        // Validar campos del paso actual según el step
        switch (currentStep) {
            case 0: // Datos de usuario
                if (!formValues.nombreUsuario || formValues.nombreUsuario.trim() === '') {
                    newErrors.nombreUsuario = true;
                }
                if (!formValues.apellidoUsuario || formValues.apellidoUsuario.trim() === '') {
                    newErrors.apellidoUsuario = true;
                }
                if (!formValues.fechaNacimientoUsuario) {
                    newErrors.fechaNacimientoUsuario = true;
                }
                if (!formValues.generoUsuario) {
                    newErrors.generoUsuario = true;
                }
                if (!formValues.dniCiUsuario || formValues.dniCiUsuario.toString().trim() === '') {
                    newErrors.dniCiUsuario = true;
                }
                if (!formValues.paisEmisionUsuario) {
                    newErrors.paisEmisionUsuario = true;
                }
                // Verificar si el DNI ya existe en el sistema con el mismo país de emisión
                if (formValues.dniCiUsuario && formValues.paisEmisionUsuario) {
                    // Solo validar si el DNI realmente cambió
                    if (formValues.dniCiUsuario !== originalUserInfo?.dni || formValues.paisEmisionUsuario !== originalUserInfo?.country_id) {
                    try {
                        showLoaderText = "Validando información...";
                        setShowLoader(true);
                        const dniExists = await PersonService.checkDniExists(formValues.dniCiUsuario, formValues.paisEmisionUsuario);
                        if (dniExists) {
                            console.log('❌ El DNI/CI ya existe en el sistema con el mismo país de emisión:', formValues.dniCiUsuario, 'País:', formValues.paisEmisionUsuario);
                            newErrors.dniCiUsuario = "El DNI/CI ya existe en el sistema.";
                        } else {
                            console.log('✅ El DNI/CI está disponible para este país:', formValues.dniCiUsuario, 'País:', formValues.paisEmisionUsuario);
                        }
                    } catch (error) {
                        console.error('❌ Error al verificar DNI:', error);
                        } finally {
                            setShowLoader(false);
                        }
                    } else {
                        console.log('✅ El DNI/CI no cambió, no es necesario validar duplicados');
                    }
                }

                break;

            case 1: // Contacto
                if (!formValues.telefonoUsuario || formValues.telefonoUsuario.toString().trim() === '') {
                    newErrors.telefonoUsuario = true;
                }
                if (!formValues.correoElectronicoUsuario || formValues.correoElectronicoUsuario.toString().trim() === '') {
                    newErrors.correoElectronicoUsuario = true;
                }
                if (!formValues.direccionUsuario || formValues.direccionUsuario.toString().trim() === '') {
                    newErrors.direccionUsuario = true;
                }

                if (!formValues.ciudadUsuario || formValues.ciudadUsuario.toString().trim() === '') {
                    newErrors.ciudadUsuario = true;
                }
                if (!formValues.paisResidenciaUsuario) {
                    newErrors.paisResidenciaUsuario = true;
                }
                if (formValues.correoElectronicoUsuario) {
                    // Validar formato del email
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(formValues.correoElectronicoUsuario)) {
                        newErrors.correoElectronicoUsuario = "El correo electrónico no es válido.";
                    } else {
                        // Solo validar duplicados si el email realmente cambió
                        if (formValues.correoElectronicoUsuario !== originalUserInfo?.email) {
                        try {
                            showLoaderText = "Validando información...";
                            setShowLoader(true);
                            const emailExists = await PersonService.checkEmailExists(formValues.correoElectronicoUsuario);
                            if (emailExists) {
                                newErrors.correoElectronicoUsuario = "El Usuario(Correo Electrónico) ya existe en el sistema.";
                            } else {
                            }
                        } catch (error) {
                            } finally {
                                setShowLoader(false);
                            }
                        } else {
                            console.log('✅ El email no cambió, no es necesario validar duplicados');
                        }
                    }
                }

                break;

            case 2: // Asignar roles al menos uno
                // Verificar que al menos un rol esté seleccionado
                const hasAnyRole = roles.some(role => formValues[role.code]);
                if (!hasAnyRole) {
                    setShowModalError(true);
                    newErrors.rol = "Debe asignar al menos un rol para el usuario.";
                }
                break;
        }

        setErrors(newErrors);

        // Aplicar bordes rojos a los campos con error
        Object.keys(newErrors).forEach(fieldId => {
            const inputElement = document.getElementById(fieldId);
            if (inputElement) {
                inputElement.style.borderColor = 'red';
                inputElement.style.borderWidth = '2px';
            }
        });

        // Limpiar errores después de 3 segundos
        setTimeout(() => {
            setErrors({});
            // Restaurar bordes normales
            Object.keys(newErrors).forEach(fieldId => {
                const inputElement = document.getElementById(fieldId);
                if (inputElement) {
                    inputElement.style.borderColor = '';
                    inputElement.style.borderWidth = '';
                }
            });
            setShowModalError(false);
        }, 3000);



        return Object.keys(newErrors).length === 0; // Retorna true si no hay errores
    };


    //----------------------------------------------------------------------------
    // Cambios en los campos
    const handleFieldChange = (fieldName, value) => {
        setFormValues(prev => ({
            ...prev,
            [fieldName]: value
        }));

        // Si el paso actual está completado y se cambia un valor, marcarlo como incompleto
        if (completedSteps.includes(currentStep)) {
            setCompletedSteps(prev => prev.filter(step => step !== currentStep));
        }

        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[fieldName]) {
            setErrors(prev => ({
                ...prev,
                [fieldName]: false
            }));

            // Restaurar borde normal del campo
            const inputElement = document.getElementById(fieldName);
            if (inputElement) {
                inputElement.style.borderColor = '';
                inputElement.style.borderWidth = '';
            }
        }
    };


    //----------------------------------------------------------------------------
    // Click en los pasos
    const handleStepClick = async (stepId) => {
        // Solo permitir navegar a pasos completados
        if (completedSteps.includes(stepId)) {
            // Si el paso actual NO está completado, validar antes de cambiar
            if (!completedSteps.includes(currentStep)) {
                const isValid = await validateCurrentStep();
                if (isValid) {
                    // Marcar como completado y navegar
                    setCompletedSteps(prev => [...prev, currentStep]);
                    setCurrentStep(stepId);
                    setErrors({});
                } else {
                    console.log('No se puede navegar al paso', stepId, 'porque el paso actual tiene errores');
                    return;
                }
            } else {
                // Si el paso actual YA está completado, navegar libremente
                setCurrentStep(stepId);
            }
        }
    };


    //----------------------------------------------------------------------------
    // Click en el botón de cancelar
    const handleCancel = () => {
        navigate('/gestionar-usuarios');
    };


    //----------------------------------------------------------------------------
    // Click en el botón de continuar
    const handleContinue = async () => {
        // Validar campos del paso actual
        const isValid = await validateCurrentStep();

        if (!isValid) {
            console.log('Hay errores de validación en el paso actual');
            return;
        }

        // Si no hay errores, marcar el paso como completado y continuar
        if (currentStep < steps.length - 1) {
            setCompletedSteps(prev => [...prev, currentStep]);
            setCurrentStep(currentStep + 1);
            // Limpiar errores al cambiar de paso
            setErrors({});
        } else {
            // Crear objeto con roles asignados dinámicamente
            const rolesAsignados = {};
            roles.forEach(role => {
                rolesAsignados[role.name] = formValues[role.code] || false;
            });

        
            try {
                const loggedInUserId = localStorage.getItem('user').id; // fallback a UUID por defecto
                const userDataForUpdate = {
                    nombreUsuario: formValues.nombreUsuario,
                    apellidoUsuario: formValues.apellidoUsuario,
                    dniCiUsuario: formValues.dniCiUsuario,
                    paisEmisionUsuario: formValues.paisEmisionUsuario,
                    generoUsuario: formValues.generoUsuario,
                    fechaNacimientoUsuario: formValues.fechaNacimientoUsuario,
                    paisResidenciaUsuario: formValues.paisResidenciaUsuario,
                    ciudadUsuario: formValues.ciudadUsuario,
                    direccionUsuario: formValues.direccionUsuario,
                    codigoPostalUsuario: formValues.codigoPostalUsuario || '0000',
                    telefonoUsuario: formValues.telefonoUsuario,
                    correoElectronicoUsuario: formValues.correoElectronicoUsuario,
                    updated_by: loggedInUserId,
                    // Agregar los roles seleccionados
                    ...Object.fromEntries(
                        roles.map(role => [`role_${role.code}`, formValues[role.code] || false])
                    )
                };
                showLoaderText = "Actualizando usuario...";
                setShowLoader(true);
                // Actualizar usuario en el backend
                const response = await UserService.updateUser(id, userDataForUpdate);
                setShowModalExito(true);
            } catch (error) {
                // Aquí podrías mostrar un modal de error
            } finally {
                setShowLoader(false);
            }
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
                        <h1 className={styles.formTitle}>Datos del Usuario</h1>
                        <div className={styles.form}>

                            <div className={styles.formItem}>
                                <Input
                                    label="Nombre"
                                    type="text"
                                    id="nombreUsuario"
                                    required
                                    errorMessage={errors.nombreUsuario ? "Este campo es requerido" : ""}
                                    value={formValues.nombreUsuario || ''}
                                    onChange={(e) => handleFieldChange('nombreUsuario', e.target.value)}
                                />
                                <Input
                                    label="Apellido"
                                    type="text"
                                    id="apellidoUsuario"
                                    required
                                    errorMessage={errors.apellidoUsuario ? "Este campo es requerido" : ""}
                                    value={formValues.apellidoUsuario || ''}
                                    onChange={(e) => handleFieldChange('apellidoUsuario', e.target.value)}
                                />
                            </div>
                            <div className={styles.formItem}>
                                <Input
                                    label="DNI/CI"
                                    type="number"
                                    id="dniCiUsuario"
                                    required
                                    info={"En el caso que el DNI/CI tenga complemento poner un guion (-) Ejemplo: 12345678-12"}
                                    errorMessage={errors.dniCiUsuario ? errors.dniCiUsuario : ""}
                                    value={formValues.dniCiUsuario || ''}
                                    onChange={(e) => handleFieldChange('dniCiUsuario', e.target.value)}
                                />
                                <Combobox
                                    label="Pais de Emisión DNI/CI"
                                    id="paisEmisionUsuario"
                                    options={loadingCountries ? [{ label: "", value: "" }] : countryOptions}
                                    required
                                    errorMessage={errors.paisEmisionUsuario ? "Este campo es requerido" : ""}
                                    value={formValues.paisEmisionUsuario || ''}
                                    onChange={(e) => handleFieldChange('paisEmisionUsuario', e.target.value)}
                                />

                            </div>
                            <div className={styles.formItem}>
                                <Select
                                    id="generoUsuario"
                                    value={formValues.generoUsuario || ''}
                                    onChange={(e) => handleFieldChange('generoUsuario', e.target.value)}
                                    required
                                    label="Genero"
                                    errorMessage={errors.generoUsuario ? "Este campo es requerido" : ""}
                                    options={[{ label: "Selecciona", value: "" }, { label: "Masculino", value: "masculino" }, { label: "Femenino", value: "femenino" }]}
                                />
                                <Input
                                    label="Fecha de Nacimiento"
                                    type="date"
                                    id="fechaNacimientoUsuario"
                                    required
                                    errorMessage={errors.fechaNacimientoUsuario ? "Este campo es requerido" : ""}
                                    value={formValues.fechaNacimientoUsuario || ''}
                                    onChange={(e) => handleFieldChange('fechaNacimientoUsuario', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.formContainer} style={{ display: currentStep === 1 ? "flex" : "none" }} data-step="1">
                        <h1 className={styles.formTitle}>Contacto</h1>
                        <div className={styles.form}>
                            <div className={styles.formItem}>
                                <Combobox
                                    label="Pais de Residencia"
                                    id="paisResidenciaUsuario"
                                    options={loadingCountries ? [{ label: "", value: "" }] : countryOptions}
                                    required
                                    errorMessage={errors.paisResidenciaUsuario}
                                    value={formValues.paisResidenciaUsuario || ''}
                                    onChange={(e) => {
                                        handleFieldChange('paisResidenciaUsuario', e.target.value);
                                        handleCountryChange(e.target.value);
                                    }}
                                />
                                <Combobox
                                    label="Ciudad"
                                    id="ciudadUsuario"
                                    options={
                                        !formValues.paisResidenciaUsuario
                                            ? []
                                            : loadingCities
                                                ? []
                                                : cities.length === 0
                                                    ? []
                                                    : cities.map(city => ({ label: city.name, value: city.id }))
                                    }
                                    required
                                    errorMessage={errors.ciudadUsuario}
                                    value={formValues.ciudadUsuario || ''}
                                    onChange={(e) => handleFieldChange('ciudadUsuario', e.target.value)}
                                    disabled={loadingCities || !formValues.paisResidenciaUsuario}
                                />
                            </div>
                            <div className={styles.formItem}>
                                <Input
                                    label="Dirección"
                                    type="text"
                                    id="direccionUsuario"
                                    required
                                    errorMessage={errors.direccionUsuario}
                                    value={formValues.direccionUsuario || ''}
                                    onChange={(e) => handleFieldChange('direccionUsuario', e.target.value)}
                                />
                                <Input
                                    label="Código Postal"
                                    type="number"
                                    id="codigoPostalUsuario"
                                    value={formValues.codigoPostalUsuario || '0000'}
                                    onChange={(e) => handleFieldChange('codigoPostalUsuario', e.target.value)}
                                />
                            </div>
                            <div className={styles.formItem}>
                                <InputNumero
                                    label="Celular"
                                    id="telefonoUsuario"
                                    required
                                    errorMessage={errors.telefonoUsuario}
                                    value={formValues.telefonoUsuario || ''}
                                    onChange={(e) => handleFieldChange('telefonoUsuario', e.target.value)}
                                />
                                <Input
                                    label="Usuario (Correo Electrónico)"
                                    type="email"
                                    id="correoElectronicoUsuario"
                                    required
                                    info={"El usuario recibira un correo con un enlace para activar su cuenta. Este enlace tiene validez por 24 horas."}
                                    errorMessage={errors.correoElectronicoUsuario === true ? "Este campo es requerido" : errors.correoElectronicoUsuario}
                                    value={formValues.correoElectronicoUsuario || ''}
                                    onChange={(e) => handleFieldChange('correoElectronicoUsuario', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.formContainer} style={{ display: currentStep === 2 ? "flex" : "none" }} data-step="2">
                        <h1 className={styles.formTitle}>Asignar roles</h1>
                        <div className={styles.form}>
                            <div className={styles.formItem} style={{ justifyContent: 'space-between' }}>
                                <p className={styles.formSubtitle}>Selecciona los roles que desea asignar al usuario</p>
                            </div>
                            {loadingRoles ? (
                                <div className={styles.formItem}>
                                    <p>Cargando roles...</p>
                                </div>
                            ) : errorRoles ? (
                                <div className={styles.formItem}>
                                    <p>Error al cargar roles: {errorRoles}</p>
                                </div>
                            ) : (
                                <div className={styles.formItem}>
                                    {roles.map((role, index) => {
                                        const isChecked = formValues[role.code] || false;
                                        return (
                                        <SingleCheckBox
                                            key={role.code}
                                            label={role.name}
                                            id={role.code}
                                            color="primary"
                                            variant="rounded"
                                                checked={isChecked}
                                            onChange={(checked) => handleFieldChange(role.code, checked)}
                                        />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
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
                            label={currentStep === steps.length - 1 ? "Guardar" : "Continuar"}
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
                    type="personalizar"
                    icon={FaCheck}
                    title="Usuario actualizado"
                    customColor="#27ae60"
                    message="¡Se actualizó el usuario correctamente!"
                    extraContent={
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                            <Lista titulo="" opciones={[
                                <div>
                                    <p style={{ fontWeight: '600' }}>DNI/CI: <span style={{ fontWeight: '400' }}>{formValues.dniCiUsuario}</span></p>
                                </div>,
                                <div>
                                    <p style={{ fontWeight: '600' }}>Nombre: <span style={{ fontWeight: '400' }}>{formValues.nombreUsuario} {formValues.apellidoUsuario}</span></p>
                                </div>,
                                <div>
                                    <p style={{ fontWeight: '600' }}>Correo enviado a: <span style={{ fontWeight: '400' }}>{formValues.correoElectronicoUsuario}</span></p>
                                </div>
                            ]} />
                        </div>
                    }
                    customButtonConfig={[
                        {
                            label: "Aceptar",
                            onClick: () => {
                                setShowModalExito(false);
                                setShowModalPerfilUsuario(true);
                            },
                            tipo: "blueButton",
                            icon: <FaCheck />
                        }
                    ]}
                    showCloseButton={true}
                    onClose={() => {
                        setShowModalExito(false);
                        setShowModalPerfilUsuario(true);
                    }}

                />
            )}
            {showModalPerfilUsuario && (
                <ModalExito
                    type="personalizar"
                    icon={FaUser}
                    title="Perfil de Usuario Completo"
                    styleCustom={{ maxWidth: '1200px' }}
                    extraContent={
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                            <Lista titulo="" styleCustom={{ display: 'flex', flexWrap: 'nowrap', flexDirection: 'row', gap: '30px', justifyContent: 'space-between' }} opciones={[
                                <div style={{ borderRight: '1px solid #e0e0e0', height: '100%', paddingRight: '30px' }}>
                                    <Lista titulo="Datos del Usuario" opciones={[
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <p style={{ fontWeight: '600' }}>Nombre: <span style={{ fontWeight: '400' }}>{formValues.nombreUsuario} {formValues.apellidoUsuario}</span></p>
                                            <p style={{ fontWeight: '600' }}>DNI/CI: <span style={{ fontWeight: '400' }}>{formValues.dniCiUsuario}</span></p>
                                            <p style={{ fontWeight: '600' }}>Genero: <span style={{ fontWeight: '400' }}>{formValues.generoUsuario}</span></p>
                                            <p style={{ fontWeight: '600' }}>Fecha de Nacimiento: <span style={{ fontWeight: '400' }}>{formValues.fechaNacimientoUsuario}</span></p>
                                            <p style={{ fontWeight: '600' }}>Lugar de Residencia: <span style={{ fontWeight: '400' }}>{(() => {
                                                const userCountry = countries.find(country =>
                                                    country.id === formValues.paisResidenciaUsuario ||
                                                    country.country_id === formValues.paisResidenciaUsuario ||
                                                    country.code === formValues.paisResidenciaUsuario ||
                                                    country.iso_code === formValues.paisResidenciaUsuario
                                                );
                                                return userCountry ? (userCountry.name || userCountry.country_name || userCountry.nombre || userCountry.name_common) : formValues.paisResidenciaUsuario || 'N/A';
                                            })()}</span></p>
                                            <p style={{ fontWeight: '600' }}>Dirección: <span style={{ fontWeight: '400' }}>{formValues.direccionUsuario}</span></p>
                                            <p style={{ fontWeight: '600' }}>Celular: <span style={{ fontWeight: '400' }}>{formValues.telefonoUsuario}</span></p>
                                            <p style={{ fontWeight: '600' }}>Email(Usuario): <span style={{ fontWeight: '400' }}>{formValues.correoElectronicoUsuario}</span></p>
                                        </div>,
                                    ]} />

                                </div>,
                                <div>
                                    <Lista titulo="Roles y Permisos" opciones={[
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <p style={{ fontWeight: '600' }}>Roles: <span style={{ fontWeight: '400' }}>{roles.filter(role => formValues[role.code]).map(role => role.name).join(', ')}</span></p>
                                            <p style={{ fontWeight: '600' }}>Permisos: <span style={{ fontWeight: '400' }}>--</span></p>
                                        </div>,
                                    ]} />
                                    <Lista titulo="Estado" opciones={[
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <p style={{ fontWeight: '600' }}><span style={{ fontWeight: '400' }}>Activo</span></p>
                                        </div>,
                                    ]} />
                                    <Lista titulo="Bloqueo" opciones={[
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <p style={{ fontWeight: '600' }}><span style={{ fontWeight: '400' }}>--</span></p>
                                        </div>,
                                    ]} />
                                </div>,
                            ]} />
                        </div>
                    }
                    customButtonConfig={[
                        {
                            label: "Aceptar",
                            onClick: () => {
                                setShowModalPerfilUsuario(false);
                                navigate('/gestionar-usuarios');
                            },
                            tipo: "blueButton",
                            icon: <FaCheck />
                        }
                    ]}
                    showCloseButton={true}
                    onClose={() => {
                        setShowModalPerfilUsuario(false);
                        navigate('/gestionar-usuarios');
                    }}
                />
            )}
            {showModalError && (
                <ModalExito
                    type="info"
                    icon={FaInfoCircle}
                    message={errors.rol}
                    onCloseButton={true}
                    onClose={() => {
                        setShowModalError(false);
                    }}
                    onFinalizar={() => {
                        setShowModalError(false);
                    }}
                />
            )}
            <Loader text={showLoaderText} show={showLoader} />
        </div>
    )
}

export default EditarUsuario