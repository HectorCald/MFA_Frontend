import styles from "./GestionarUsuarios.module.css";
import Fondo from "../../components/common/Fondo";
import Boton from "../../components/common/Boton";
import InputSearch from "../../components/common/InputSearch";
import Table from "../../components/ui/Table";
import MenuPuntos from "../../components/common/MenuPuntos";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaKey, FaSearch, FaToggleOff, FaUnlock, FaTrash, FaUser, FaCheck, FaTimes, FaSave, FaInfo, FaToggleOn } from "react-icons/fa";
import Nav from "../../components/ui/nav";
import ActionButtons from "../../components/ui/ActionButtons";
import ModalExito from "../../components/ui/ModalExito";
import Combobox from "../../components/common/Combobox";
import Lista from "../../components/common/Lista";
import InputContraseña from "../../components/common/InputContraseña";
import FiltroFechas from "../../components/common/FiltroFechas";
import Instruccion from "../../components/common/Instruccion";

import CountryService from '../../services/countryService';
import CityService from '../../services/cityService';
import UserService from "../../services/userService";
import AuditLogService from "../../services/auditLogService";
import InfoBoton from "../../components/common/InfoBoton";


const motivosDesactivar = [
    "Cambio de cargo",
    "Cambio de empresa",
    "Cambio de pais",
    "Cambio de ciudad",
    "Cambio de email",
    "Cambio de telefono",
    "Cambio de direccion",
    "Cambio de nombre",
    "Otro"
]

let tituloExito = "";
let mensajeExito = "";
let tituloInfo = "";
let mensajeInfo = "";

function GestionarUsuarios() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [searchBlocks, setSearchBlocks] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [tableDataAuditoria, setTableDataAuditoria] = useState([]);


    //------------------------------------------------------------------------------------
    // Función para cargar los países
    const [countries, setCountries] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [errorCountries, setErrorCountries] = useState(null);
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

    //------------------------------------------------------------------------------------
    // Función para cargar las ciudades
    const [cities, setCities] = useState([]);
    const [loadingCities, setLoadingCities] = useState(false);
    const [errorCities, setErrorCities] = useState(null);

    useEffect(() => {
        const loadCities = async () => {
            const citiesData = await CityService.getAllCities();
            setCities(citiesData || []);
        };
        loadCities();
    }, []);


    //------------------------------------------------------------------------------------
    // Función para cargar los usuarios
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [errorUsers, setErrorUsers] = useState(null);

    // Cargar usuarios al montar el componente
    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoadingUsers(true);
                setErrorUsers(null);

                const usersData = await UserService.getAllUsers();
                setUsers(usersData || []);

            } catch (error) {
                console.error('❌ Error al cargar usuarios:', error);
                setErrorUsers(error.message);
                setUsers([]);
            } finally {
                setLoadingUsers(false);
            }
        };

        loadUsers();
    }, []);



    //------------------------------------------------------------------------------------
    // Función para filtrar usuarios basada en bloques de búsqueda
    const filterUsersByBlocks = (users, blocks) => {
        if (blocks.length === 0) return users;

        return users.filter(user => {
            // Buscar el país y ciudad del usuario para la búsqueda
            const userCountry = countries.find(country =>
                country.id === user.country_id ||
                country.country_id === user.country_id ||
                country.code === user.country_id ||
                country.iso_code === user.country_id
            );
            const userCity = cities.find(city =>
                city.id === user.city_id ||
                city.city_id === user.city_id ||
                city.name === user.city_id ||
                city.city_name === user.city_id
            );

            const userData = {
                name: `${user.first_name} ${user.last_name}`.toLowerCase(),
                email: user.email?.toLowerCase() || '',
                roles: user.roles && user.roles.length > 0 ? user.roles.map(role => role.role_name).join(', ').toLowerCase() : 'sin roles',
                status: (user.user_is_active ? 'activo' : 'inactivo').toLowerCase(),
                country: userCountry ? (userCountry.name || userCountry.country_name || userCountry.nombre || userCountry.name_common || '').toLowerCase() : '',
                city: userCity ? (userCity.name || userCity.city_name || userCity.nombre || userCity.name_common || '').toLowerCase() : ''
            };

            return blocks.every(block => {
                const blockLower = block.toLowerCase();
                return Object.values(userData).some(value =>
                    value.includes(blockLower)
                );
            });
        });
    };

    // Filtrar usuarios basado en searchBlocks
    const filteredUsers = filterUsersByBlocks(users, searchBlocks);

    useEffect(() => {
        // Cargar usuarios reales en lugar de mock data
        if (users && users.length > 0 && countries.length > 0) {
            const formattedUsers = filteredUsers.map(user => {
                // Buscar el país del usuario
                const userCountry = countries.find(country =>
                    country.id === user.country_id ||
                    country.country_id === user.country_id ||
                    country.code === user.country_id ||
                    country.iso_code === user.country_id
                );
                const userCity = cities.find(city =>
                    city.id === user.city_id ||
                    city.city_id === user.city_id ||
                    city.name === user.city_id ||
                    city.city_name === user.city_id
                );

                return {
                    id: user.user_id,
                    nombre: `${user.first_name} ${user.last_name}`,
                    email: user.email,
                    dni: user.dni,
                    rol: user.roles && user.roles.length > 0 ? user.roles.map(role => role.role_name).join(', ') : 'Sin roles',
                    estado: user.user_is_active ? 'Activo' : 'Inactivo',
                    bloqueado: user.blocked_until ? new Date(user.blocked_until).toLocaleDateString('es-ES') : '--',
                    pais: userCountry ? (userCountry.name || userCountry.country_name || userCountry.nombre || userCountry.name_common) : 'N/A',
                    ciudad: userCity ? (userCity.name || userCity.city_name || userCity.nombre || userCity.name_common) : 'N/A',
                    acciones: ["editar", "eliminar"],
                    // Mantener los roles completos para poder acceder a ellos en handleDelete
                    roles: user.roles || []
                };
            });

            setTableData(formattedUsers);
        }
    }, [filteredUsers, countries, cities]); // Se ejecuta cuando 'filteredUsers', 'countries' o 'cities' cambien

    //------------------------------------------------------------------------------------

    // Modal de desactivar usuario
    const [showModalDesactivar, setShowModalDesactivar] = useState(false);
    const [userToDesactivar, setUserToDesactivar] = useState(null);
    const [errors, setErrors] = useState({
        desactivarUsuario: ""
    });
    const [formValues, setFormValues] = useState({
        desactivarUsuario: ""
    });
    // Función para desactivar usuario
    const handleDesactivar = async () => {
        if (!userToDesactivar) return;
        if (!formValues.desactivarUsuario || formValues.desactivarUsuario.trim() === '') {
            setErrors({
                desactivarUsuario: "El motivo es requerido"
            });
            const inputElement = document.getElementById("desactivarUsuario");
            if (inputElement) {
                inputElement.style.borderColor = 'red';
                inputElement.style.borderWidth = '2px';
            }

            // Limpiar el error después de 3 segundos
            setTimeout(() => {
                const inputElement = document.getElementById("desactivarUsuario");
                if (inputElement) {
                    inputElement.style.borderColor = '';
                    inputElement.style.borderWidth = '';
                }
                setErrors({
                    desactivarUsuario: ""
                });

            }, 3000);
        } else {
            if(userToDesactivar.roles.some(role => role.role_name === 'Super Administrador')) {
                tituloInfo = "Información";
                mensajeInfo = "El usuario Super Administrador no puede ser desactivado";
                setShowModalInfo(true);
                setShowModalDesactivar(false);
                setUserToDesactivar(null);
                return;
            }
            setErrors({
                desactivarUsuario: ""
            });
            await UserService.deactivateUser(userToDesactivar.id);

            setTableData(prevData =>
                prevData.map(user =>
                    user.id === userToDesactivar.id
                        ? { ...user, estado: 'Inactivo' }  // Cambiar estado a Inactivo
                        : user
                )
            );
            tituloExito = "Exito";
            mensajeExito = "El usuario ha sido desactivado correctamente";
            setShowModalExito(true);
            setShowModalDesactivar(false);
            setUserToDesactivar(null);

        }
    }




    //------------------------------------------------------------------------------------
    // Función para activar usuario

    const [showModalActivar, setShowModalActivar] = useState(false);
    const [userToActivar, setUserToActivar] = useState(null);

    const handleActivar = async () => {
        if (!userToActivar) return;
        
        await UserService.activateUser(userToActivar.id);        // ✅ UNA SOLA LLAMADA
        setTableData(prevData =>
            prevData.map(user =>
                user.id === userToActivar.id
                    ? { ...user, estado: 'Activo' }
                    : user
            )
        );
        tituloExito = "Exito";
        mensajeExito = "El usuario ha sido activado correctamente";
        setShowModalExito(true);
        // ❌ ELIMINAR: await UserService.activateUser(userToActivar.id); ← DUPLICADA
        setShowModalActivar(false);
        setUserToActivar(null);                                 // ✅ Corregir: userToActivar, no userToDelete
        setFormValues({ activarUsuario: "" });
        setErrors({ activarUsuario: "" });
    }




    //------------------------------------------------------------------------------------
    // Modal de cambiar contraseña
    const [showModalContraseña, setShowModalContraseña] = useState(false);
    const [userToChangePassword, setUserToChangePassword] = useState(null);
    const [formValuesContraseña, setFormValuesContraseña] = useState({
        nuevaContraseña: "",
        confirmarContraseña: ""
    });
    const [errorsContraseña, setErrorsContraseña] = useState({
        nuevaContraseña: "",
        confirmarContraseña: ""
    });
    // Función para cambiar contraseña
    const handlePassword = async () => {
        if (!userToChangePassword) return;
        const inputElement = document.getElementById("nuevaContraseña");
        const inputElement2 = document.getElementById("confirmarContraseña");

        if (!formValuesContraseña.nuevaContraseña || !formValuesContraseña.confirmarContraseña) {
            setErrorsContraseña({
                nuevaContraseña: "Este campo es requerido",
                confirmarContraseña: "Este campo es requerido"
            });

            if (inputElement) {
                inputElement.style.borderColor = 'red';
                inputElement.style.borderWidth = '2px';
                inputElement2.style.borderColor = 'red';
                inputElement2.style.borderWidth = '2px';
            }
            setTimeout(() => {
                if (inputElement) {
                    inputElement.style.borderColor = '';
                    inputElement.style.borderWidth = '';
                    inputElement2.style.borderColor = '';
                    inputElement2.style.borderWidth = '';
                }
                setErrorsContraseña({
                    nuevaContraseña: "",
                    confirmarContraseña: ""
                });
            }, 3000);
            return;
        }


        // Aquí puedes implementar la lógica para cambiar contraseña
        if (formValuesContraseña.nuevaContraseña !== formValuesContraseña.confirmarContraseña) {
            setErrorsContraseña({
                nuevaContraseña: "Las contraseñas no coinciden",
                confirmarContraseña: "Las contraseñas no coinciden"
            });
            if (inputElement) {
                inputElement.style.borderColor = 'red';
                inputElement.style.borderWidth = '2px';
                inputElement2.style.borderColor = 'red';
                inputElement2.style.borderWidth = '2px';
            }
            setTimeout(() => {
                if (inputElement) {
                    inputElement.style.borderColor = '';
                    inputElement.style.borderWidth = '';
                    inputElement2.style.borderColor = '';
                    inputElement2.style.borderWidth = '';
                }
                setErrorsContraseña({
                    nuevaContraseña: "",
                    confirmarContraseña: ""
                });
            }, 3000);
            return;
        }
        if (formValuesContraseña.nuevaContraseña.length < 8) {
            setErrorsContraseña({
                nuevaContraseña: "La contraseña debe tener al menos 8 caracteres",
                confirmarContraseña: "La contraseña debe tener al menos 8 caracteres"
            });
            return;
        }
        
        if (formValuesContraseña.nuevaContraseña === formValuesContraseña.confirmarContraseña) {
            try {
                await UserService.updateUserPassword(userToChangePassword.id, formValuesContraseña.nuevaContraseña);
                setShowModalContraseña(false);
                setFormValuesContraseña({ nuevaContraseña: "", confirmarContraseña: "" });
                setErrorsContraseña({ nuevaContraseña: "", confirmarContraseña: "" });
                tituloExito = "Exito";
                mensajeExito = "La contraseña ha sido actualizada correctamente";
                setShowModalExito(true);
            } catch (error) {
                console.error('Error updating user password:', error);
                alert('Error al actualizar la contraseña');
            }

            setShowModalContraseña(false);
            // Limpiar el formulario y errores al finalizar
            setFormValuesContraseña({ nuevaContraseña: "", confirmarContraseña: "" });
            setErrorsContraseña({ nuevaContraseña: "", confirmarContraseña: "" });
        }
    };

    //------------------------------------------------------------------------------------

    // Modal de auditoría
    const [showModalAuditoria, setShowModalAuditoria] = useState(false);
    const [userForAudit, setUserForAudit] = useState(null);
    const [loadingAudit, setLoadingAudit] = useState(false);
    const [originalAuditData, setOriginalAuditData] = useState([]); // Datos originales para restaurar
    
    const handleSearchAuditoria = (value) => {
        setSearchTerm(value);
        if (value.trim() === "") {
            // Restaurar todos los logs originales del usuario
            setTableDataAuditoria(originalAuditData);
            return;
        }
        // Filtrar los logs existentes
        const filteredData = originalAuditData.filter(item =>
            item.fecha.toLowerCase().includes(value.toLowerCase()) ||
            item.evento.toLowerCase().includes(value.toLowerCase()) ||
            item.hechoPor.toLowerCase().includes(value.toLowerCase()) ||
            item.tabla.toLowerCase().includes(value.toLowerCase()) ||
            item.detalleCambios.toLowerCase().includes(value.toLowerCase())
        );
        setTableDataAuditoria(filteredData);
    };
    
    const handleSearchBlocksAuditoria = (searchBlocks) => {
        if (searchBlocks.length === 0) {
            // Restaurar todos los logs originales del usuario
            setTableDataAuditoria(originalAuditData);
            return;
        }

        const filteredData = originalAuditData.filter(item => {
            return searchBlocks.every(block => {
                const searchValue = block.toLowerCase();
                return (
                    item.fecha.toLowerCase().includes(searchValue) ||
                    item.evento.toLowerCase().includes(searchValue) ||
                    item.hechoPor.toLowerCase().includes(searchValue) ||
                    item.tabla.toLowerCase().includes(searchValue) ||
                    item.detalleCambios.toLowerCase().includes(searchValue)
                );
            });
        });
        setTableDataAuditoria(filteredData);
    };

    // Función para abrir auditoría de un usuario específico
    const handleOpenAuditoria = async (user) => {
        try {
            setLoadingAudit(true);
            setUserForAudit(user);
            setSearchTerm(""); // Limpiar búsqueda anterior
            
            // Cargar audit logs reales del usuario
            const auditLogsResponse = await AuditLogService.getAuditLogsByPersonId(user.id);
            
            if (auditLogsResponse.success && auditLogsResponse.data) {
                // Formatear los datos para la tabla
                const formattedAuditLogs = auditLogsResponse.data.map((log, index) => {
                    // Determinar si el evento fue hecho por el mismo usuario que está viendo la auditoría
                    const isSameUser = log.app_user_id === user.id || log.performed_by_id === user.id;
                    const isOwnAudit = log.app_user_id === user.id && log.performed_by_id === user.id;
                    
                    let hechoPor;
                    if (isOwnAudit) {
                        hechoPor = "Mismo usuario";
                    } else if (isSameUser) {
                        // Usar el nombre de quien ejecutó la acción
                        hechoPor = `${log.performer_first_name || ''} ${log.performer_last_name || ''}`.trim() || 'Usuario del sistema';
                    } else {
                        hechoPor = `${log.performer_first_name || ''} ${log.performer_last_name || ''}`.trim() || 'Usuario del sistema';
                    }
                    
                    return {
                        numero: index + 1,
                        fecha: new Date(log.event_date_id).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }),
                        evento: log.event_type_name || 'Sin tipo',
                        hechoPor: hechoPor,
                        tabla: log.table_name || 'Sin tabla',
                        detalleCambios: (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span>{log.event_details?.comment || 'Sin detalles'}</span>
                                <InfoBoton 
                                    info="hola"
                                    setShowInfo={setShowInfo}
                                    showInfo={showInfo}
                                    direction="right"
                                />
                            </div>
                        ),
                        userRole: log.user_role || 'desconocido'
                    };
                });
                
                setTableDataAuditoria(formattedAuditLogs);
                setOriginalAuditData(formattedAuditLogs); // Guardar copia original
            } else {
                setTableDataAuditoria([]);
                setOriginalAuditData([]);
            }
            
            setShowModalAuditoria(true);
        } catch (error) {
            console.error('Error al cargar audit logs:', error);
            setTableDataAuditoria([]);
            setOriginalAuditData([]);
            setShowModalAuditoria(true);
        } finally {
            setLoadingAudit(false);
        }
    };


    //------------------------------------------------------------------------------------
    // Modal de eliminar usuario
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const handleDelete = async () => {
        if (!userToDelete) return;

        if(userToDelete.roles.some(role => role.role_name === 'Super Administrador')) {
            tituloInfo = "Información";
            mensajeInfo = "El usuario Super Administrador no puede ser eliminado";
            setShowModalInfo(true);
            setShowModalDelete(false);
            setUserToDelete(null);
            return;
        }

        try {
            await UserService.deleteUser(userToDelete.id);

            // Actualizar la tabla removiendo el usuario eliminado
            setTableData(prevData => prevData.filter(user => user.id !== userToDelete.id));

            tituloExito = "Exito";
            mensajeExito = "El usuario ha sido eliminado correctamente";
            setShowModalExito(true);
            // Cerrar modal y limpiar estado
            setShowModalDelete(false);
            setUserToDelete(null);

        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const confirmDelete = (user) => {
        setUserToDelete(user);
        setShowModalDelete(true);
    };



    //------------------------------------------------------------------------------------
    // Función de búsqueda simplificada como en GestionarClienteEmpresa
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchBlocks = (searchBlocks) => {
        setSearchBlocks(searchBlocks);
    };



    //------------------------------------------------------------------------------------
    // Función de información del usuario
    const [showModalPerfilUsuario, setShowModalPerfilUsuario] = useState(false);
    const [userToShow, setUserToShow] = useState(null);
    const handleShowPerfilUsuario = async (user) => {
        try {
            console.log("Obteniendo información del usuario:", user.id);

            // Obtener información completa del usuario desde la BD
            const userInfo = await UserService.getUserById(user.id);

            if (userInfo) {
                setUserToShow(userInfo);
                setShowModalPerfilUsuario(true);
                console.log("Información del usuario obtenida:", userInfo);
            } else {
                alert("No se pudo obtener la información del usuario");
            }
        } catch (error) {
            console.error("Error al obtener información del usuario:", error);
            alert("Error al obtener la información del usuario: " + error.message);
        }
    };


    //------------------------------------------------------------------------------------
    // Modal de desactivar usuario
    const [showModalInfoDesactivo, setShowModalInfoDesactivo] = useState(false);



    //------------------------------------------------------------------------------------
    // Modal de información del usuario
    const [showModalInfo, setShowModalInfo] = useState(false);
    const [showModalExito, setShowModalExito] = useState(false);

    const [showInfo, setShowInfo] = useState(false); // Estado para cada InfoBoton individual





    const handleToggleStatus = (userId) => {
        console.log("Cambiar estado del usuario:", userId);
        setTableData(updatedData);
    };

    const tableRows = useMemo(() => {
        return tableData.map((item, index) => [
            index + 1, // Numeración secuencial 1, 2, 3...
            item.nombre,
            item.email,
            item.rol,
            <div
                className={`${styles.statusColumn} ${styles[`status${item.estado}`]}`}
                onClick={() => {
                    if(item.estado === 'Inactivo'){
                        setShowModalInfoDesactivo(true);
                    }
                }}
            >
                <span className={styles.statusDot}></span>
                <span className={styles.statusText}>{item.estado}</span>
            </div>,
            item.bloqueado,
            item.pais,
            item.ciudad,
            <div className={styles.actionsContainer}>
                <span className={styles.defaultText}>...</span>
                <div className={styles.actionButtons}>
                    <ActionButtons
                        tipo="gestionUsuarios"
                        onInfo={() => handleShowPerfilUsuario(item)}
                        onEdit={() => navigate(`/gestionar-usuarios/editar-usuario/${item.id}`)}
                        onDelete={() => confirmDelete(item)}
                    />
                </div>
                <div className={styles.menuPuntos}>
                    <MenuPuntos
                        opciones={[
                            {
                                label: 'Auditoria',
                                icono: <FaSearch />,
                                onClick: () => handleOpenAuditoria(item)
                            },
                            {
                                label: 'Cambiar contraseña',
                                icono: <FaKey />,
                                onClick: () => {
                                    setUserToChangePassword(item);
                                    setShowModalContraseña(true);
                                }
                            },
                            {
                                label: item.estado === 'Activo' ? 'Desactivar' : 'Activar',
                                icono: item.estado === 'Activo' ? <FaToggleOff /> : <FaToggleOn />,
                                onClick: () => {
                                    if (item.estado === 'Activo') {
                                        setUserToDesactivar(item);
                                        setShowModalDesactivar(true);
                                    } else {
                                        setUserToActivar(item);
                                        setShowModalActivar(true);
                                    }
                                }
                            },
                            {
                                label: 'Desbloquear',
                                icono: <FaUnlock />,
                                onClick: () => handleToggleStatus(item.id)
                            }
                        ]}
                    />
                </div>
            </div>
        ]);
    }, [tableData]);

    const tableRowsAuditoria = useMemo(() => {
        return tableDataAuditoria.map(item => [
            item.numero,
            item.fecha,
            item.evento,
            item.hechoPor,
            item.tabla,
            item.detalleCambios,
        ]);
    }, [tableDataAuditoria]);

    return (
        <div className={styles.container}>
            <Nav />
            <Fondo />
            <div className={styles.content}>
                <p className={styles.rutaScreen}>Panel Administrativo - <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>Usuarios</span></p>
                <h1 className={styles.title}>Usuarios</h1>
                <div className={styles.searchContainer}>
                    <InputSearch
                        placeholder="Buscar"
                        value={searchTerm}
                        onChange={handleSearch}
                        onSearchBlocks={handleSearchBlocks}
                    />
                    <Boton
                        label="Agregar usuario"
                        onClick={() => {
                            navigate('/gestionar-usuarios/agregar-usuario');
                        }}
                        type="button"
                        disabled={false}
                        tipo="blueButton"
                        icon={<FaPlus />}
                    />
                </div>
                <Instruccion texto="Use el buscador para filtrar por nombre, email, rol, estado, pais, ciudad (presione doble espacio para agregar más filtros)" />
                <div className={styles.tableContainer}>
                    <Table
                        headers={["Nº", "Nombre completo", "Email", "Rol", "Estado", "Bloqueado", "Pais", "Ciudad", "Acciones"]}
                        data={tableRows}
                        columnAlignments={[
                            'center',    // Nº - Centrado
                            'left',      // Nombre - Izquierda
                            'left',      // Email - Izquierda  
                            'center',    // Rol - Centrado
                            'center',    // Estado - Centrado
                            'center',    // Bloqueado - Centrado
                            'center',      // Pais - Izquierda
                            'center',      // Ciudad - Izquierda
                            'center'     // Acciones - Centrado
                        ]}
                    />
                </div>
            </div>
            {showModalDesactivar && (
                <ModalExito
                    type="personalizar"
                    icon={FaToggleOff}
                    title="Desactivar usuario"
                    message=""
                    extraContent={
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                            <Lista titulo="" opciones={[
                                <div>
                                    <p style={{ fontWeight: '600' }}>DNI/CI: <span style={{ fontWeight: '400' }}>{userToDesactivar.dni}</span></p>
                                </div>,
                                <div>
                                    <p style={{ fontWeight: '600' }}>Nombre: <span style={{ fontWeight: '400' }}>{userToDesactivar.nombre}</span></p>
                                </div>,
                                <div>
                                    <p style={{ fontWeight: '600' }}>Email: <span style={{ fontWeight: '400' }}>{userToDesactivar.email}</span></p>
                                </div>
                            ]} />
                            <p style={{ fontSize: '13px', fontWeight: '400', color: 'red', textAlign: 'left', marginTop: 'auto', whiteSpace: 'wrap' }}>¿Estás seguro de que quieres desactivar este usuario? <span style={{ fontSize: '13px', fontWeight: '200' }}>Esta Accion impedira que acceda al sistema.</span></p>
                            <Combobox
                                label="Motivo"
                                id="desactivarUsuario"
                                options={motivosDesactivar.map(motivo => ({ label: motivo, value: motivo }))}
                                required
                                errorMessage={errors.desactivarUsuario}
                                value={formValues.desactivarUsuario}
                                onChange={(e) => {
                                    setFormValues({
                                        ...formValues,
                                        desactivarUsuario: e.target.value
                                    });
                                    // Limpiar el error cuando el usuario empiece a escribir
                                    if (errors.desactivarUsuario) {
                                        setErrors({
                                            desactivarUsuario: ""
                                        });
                                    }
                                }}
                            />
                        </div>
                    }
                    customButtonConfig={[
                        {
                            label: "Cancelar",
                            onClick: () => {
                                setShowModalDesactivar(false);
                                // Limpiar el formulario y errores al cancelar
                                setFormValues({ desactivarUsuario: "" });
                                setErrors({ desactivarUsuario: "" });
                            },
                            tipo: "grayButton",
                            icon: <FaTimes />
                        },
                        {
                            label: "Si, Desactivar",
                            onClick: () => {
                                handleDesactivar();
                            },
                            tipo: "greenButton",
                            icon: <FaCheck />
                        }
                    ]}
                    onClose={() => {
                        setShowModalDesactivar(false);
                        // Limpiar el formulario y errores al cerrar
                        setFormValues({ desactivarUsuario: "" });
                        setErrors({ desactivarUsuario: "" });
                    }}
                    onFinalizar={() => {
                        setShowModalDesactivar(false);
                        // Limpiar el formulario y errores al finalizar
                        setFormValues({ desactivarUsuario: "" });
                        setErrors({ desactivarUsuario: "" });
                    }}
                    showCloseButton={true}
                />
            )}
            {showModalActivar && (
                <ModalExito
                    type="personalizar"
                    icon={FaToggleOn}
                    title="Activar usuario"
                    message=""
                    extraContent={
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                            <Lista titulo="" opciones={[
                                <div>
                                    <p style={{ fontWeight: '600' }}>DNI/CI: <span style={{ fontWeight: '400' }}>{userToActivar.dni}</span></p>
                                </div>,
                                <div>
                                    <p style={{ fontWeight: '600' }}>Nombre: <span style={{ fontWeight: '400' }}>{userToActivar.nombre}</span></p>
                                </div>,
                                <div>
                                    <p style={{ fontWeight: '600' }}>Email: <span style={{ fontWeight: '400' }}>{userToActivar.email}</span></p>
                                </div>
                            ]} />
                            <p style={{ fontSize: '13px', fontWeight: '400', color: 'green', textAlign: 'left', marginTop: 'auto', whiteSpace: 'wrap' }}>¿Estás seguro de que quieres activar este usuario? <span style={{ fontSize: '13px', fontWeight: '200' }}>Esta Accion permitira que acceda al sistema.</span></p>
                        </div>
                    }
                    customButtonConfig={[
                        {
                            label: "Cancelar",
                            onClick: () => {
                                setShowModalActivar(false);
                                // Limpiar el formulario y errores al cancelar
                                setFormValues({ activarUsuario: "" });
                                setErrors({ activarUsuario: "" });
                            },
                            tipo: "grayButton",
                            icon: <FaTimes />
                        },
                        {
                            label: "Si, Activar",
                            onClick: () => {
                                handleActivar();
                            },
                            tipo: "greenButton",
                            icon: <FaCheck />
                        }
                    ]}
                    onClose={() => {
                        setShowModalActivar(false);
                        // Limpiar el formulario y errores al cerrar
                        setFormValues({ activarUsuario: "" });
                        setErrors({ activarUsuario: "" });
                    }}
                    onFinalizar={() => {
                        setShowModalActivar(false);
                        // Limpiar el formulario y errores al finalizar
                        setFormValues({ activarUsuario: "" });
                        setErrors({ activarUsuario: "" });
                    }}
                    showCloseButton={true}
                />
            )}
            {showModalContraseña && userToChangePassword && (
                <ModalExito
                    type="personalizar"
                    icon={FaKey}
                    title="Cambiar contraseña"
                    message=""
                    extraContent={
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                            <Lista titulo="" opciones={[
                                <div>
                                    <p style={{ fontWeight: '600' }}>Email: <span style={{ fontWeight: '400' }}>{userToChangePassword.email}</span></p>
                                </div>
                            ]} />
                            <InputContraseña
                                label="Nueva contraseña"
                                id="nuevaContraseña"
                                value={formValuesContraseña.nuevaContraseña}
                                onChange={(e) => {
                                    setFormValuesContraseña({
                                        ...formValuesContraseña,
                                        nuevaContraseña: e.target.value
                                    });
                                    if (errorsContraseña.nuevaContraseña) {
                                        setErrorsContraseña({
                                            nuevaContraseña: ""
                                        });
                                    }
                                }}
                                required
                                generarContraseña={true}
                                longitudContraseña={16}
                                errorMessage={errorsContraseña.nuevaContraseña}
                                info="La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial"
                            />
                            <InputContraseña
                                label="Confirmar contraseña"
                                id="confirmarContraseña"
                                value={formValuesContraseña.confirmarContraseña}
                                onChange={(e) => {
                                    setFormValuesContraseña({
                                        ...formValuesContraseña,
                                        confirmarContraseña: e.target.value
                                    });
                                    if (errorsContraseña.confirmarContraseña) {
                                        setErrorsContraseña({
                                            confirmarContraseña: ""
                                        });
                                    }
                                }}
                                required
                                errorMessage={errorsContraseña.confirmarContraseña}
                            />
                        </div>
                    }
                    customButtonConfig={[
                        {
                            label: "Cancelar",
                            onClick: () => {
                                setShowModalContraseña(false);
                                // Limpiar el formulario y errores al cancelar
                                setFormValuesContraseña({ nuevaContraseña: "", confirmarContraseña: "" });
                                setErrorsContraseña({ nuevaContraseña: "", confirmarContraseña: "" });
                            },
                            tipo: "grayButton",
                            icon: <FaTimes />
                        },
                        {
                            label: "Guardar",
                            onClick: () => {
                                handlePassword();
                            },
                            tipo: "greenButton",
                            icon: <FaSave />
                        }
                    ]}
                    onClose={() => {
                        setShowModalContraseña(false);
                        setUserToChangePassword(null);
                        setFormValuesContraseña({ nuevaContraseña: "", confirmarContraseña: "" });
                        setErrorsContraseña({ nuevaContraseña: "", confirmarContraseña: "" });
                    }}
                    showCloseButton={true}
                />
            )}
            {showModalAuditoria && (
                <ModalExito
                    type="personalizar"
                    icon={FaSearch}
                    title="Auditoria de Usuario"
                    message=""
                    styleCustom={{ minHeight: '600px', maxWidth: '1200px' }}

                    extraContent={
                        <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
                            <Lista titulo="" styleCustom={{ display: 'flex', flexWrap: 'nowrap', flexDirection: 'row', gap: '5px', justifyContent: 'space-between' }} opciones={[
                                <div>
                                    <p style={{ fontWeight: '600' }}>Nombre: <span style={{ fontWeight: '400' }}>{userForAudit ? (userForAudit.first_name || '') + ' ' + (userForAudit.last_name || '') : ''}</span></p>
                                    <p style={{ fontWeight: '600' }}>Rol: <span style={{ fontWeight: '400' }}>{userForAudit ? userForAudit.email : ''}</span></p>
                                    <p style={{ fontWeight: '600' }}>Creado: <span style={{ fontWeight: '400' }}>{userForAudit ? new Date(userForAudit.user_created_at).toLocaleDateString('es-ES') : ''}</span></p>
                                </div>,
                                <div>
                                    <p style={{ fontWeight: '600' }}>Email: <span style={{ fontWeight: '400' }}>{userForAudit ? userForAudit.email : ''}</span></p>
                                    <p style={{ fontWeight: '600' }}>Estado: <span style={{ fontWeight: '400' }}>{userForAudit ? (userForAudit.user_is_active ? 'Activo' : 'Inactivo') : ''}</span></p>
                                    <p style={{ fontWeight: '600' }}>Ultima sesión: <span style={{ fontWeight: '400' }}>{userForAudit ? (userForAudit.last_login_at ? new Date(userForAudit.last_login_at).toLocaleDateString('es-ES') : 'Nunca') : ''}</span></p>
                                </div>,
                            ]} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <InputSearch
                                    placeholder="Buscar"
                                    value={searchTerm}
                                    onChange={handleSearchAuditoria}
                                    onSearchBlocks={handleSearchBlocksAuditoria}
                                />
                                <FiltroFechas
                                    placeholder="Filtrar por período"
                                    onFiltroChange={(fechas) => {
                                        if (fechas.desde && fechas.hasta) {
                                            // Filtrar datos entre estas fechas
                                            const datosFiltrados = tableDataAuditoria.filter(item => {
                                                const fechaItem = new Date(item.fecha);
                                                return fechaItem >= fechas.desde && fechaItem <= fechas.hasta;
                                            });
                                            setTableDataAuditoria(datosFiltrados);
                                        }
                                    }}
                                />
                            </div>

                            {loadingAudit ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <p>Cargando historial de auditoría...</p>
                                </div>
                            ) : (
                                <Table
                                    headers={["Nº", "Fecha", "Evento", "Hecho Por", "Tabla", "Detalle Cambios"]}
                                    data={tableDataAuditoria.length > 0 ? tableRowsAuditoria : []}
                                    styleCustom={{ width: '100%', minWidth: '1000px' }}
                                />
                            )}
                        </div>
                    }
                    customButtonConfig={[
                    ]}
                    onClose={() => {
                        setShowModalAuditoria(false);
                        setUserForAudit(null);
                        setTableDataAuditoria([]);
                        setOriginalAuditData([]);
                        setSearchTerm(""); // Limpiar búsqueda
                    }}
                    showCloseButton={true}
                />
            )}
            {showModalDelete && userToDelete && (
                <ModalExito
                    type="delete"
                    icon={FaTrash}
                    title="Eliminar usuario"
                    message={`¿Estás seguro de que quieres eliminar al usuario "${userToDelete.nombre}"? Esta acción no se puede deshacer.`}
                    onClose={() => {
                        setShowModalDelete(false);
                        setUserToDelete(null);
                    }}
                    onCancel={() => {
                        setShowModalDelete(false);
                        setUserToDelete(null);
                    }}
                    onFinalizar={handleDelete}
                />
            )}
            {showModalInfoDesactivo && (
                <ModalExito
                    type="personalizar"
                    icon={FaInfo}
                    title="Información"
                    message="El usuario: Juan Pérez con email: juan.perez@gmail.com esta desactivado desde el 10/08/2025 15:30 por:"
                    extraContent={
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                            <p style={{ fontSize: '13px', fontWeight: '400', color: 'red', textAlign: 'left', marginTop: 'auto', whiteSpace: 'wrap' }}>Falta de Pagos</p>
                        </div>
                    }
                    customButtonConfig={[
                        {
                            label: "Aceptar",
                            onClick: () => {
                                setShowModalInfoDesactivo(false);
                            },
                            tipo: "blueButton",
                            icon: <FaCheck />
                        }
                    ]}
                    showCloseButton={true}
                    onClose={() => {
                        setShowModalInfoDesactivo(false);
                    }}
                />
            )}
            {showModalPerfilUsuario && (
                <ModalExito
                    type="personalizar"
                    icon={FaUser}
                    title="Información del Usuario"
                    styleCustom={{ maxWidth: '1200px' }}
                    extraContent={
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                            <Lista titulo="" styleCustom={{ display: 'flex', flexWrap: 'nowrap', flexDirection: 'row', gap: '30px', justifyContent: 'space-between' }} opciones={[
                                <div style={{ borderRight: '1px solid #e0e0e0', height: '100%', paddingRight: '30px' }}>
                                    <Lista titulo="Datos del Usuario" opciones={[
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <p style={{ fontWeight: '600' }}>Nombre: <span style={{ fontWeight: '400' }}>{userToShow.first_name} {userToShow.last_name}</span></p>
                                            <p style={{ fontWeight: '600' }}>DNI/CI: <span style={{ fontWeight: '400' }}>{userToShow.dni || 'N/A'}</span></p>
                                            <p style={{ fontWeight: '600' }}>Genero: <span style={{ fontWeight: '400' }}>{userToShow.gender === 'M' ? 'Masculino' : userToShow.gender === 'F' ? 'Femenino' : userToShow.gender || 'N/A'}</span></p>
                                            <p style={{ fontWeight: '600' }}>Fecha de Nacimiento: <span style={{ fontWeight: '400' }}>{userToShow.birthdate ? new Date(userToShow.birthdate).toLocaleDateString('es-ES') : 'N/A'}</span></p>
                                            <p style={{ fontWeight: '600' }}>Lugar de Residencia: <span style={{ fontWeight: '400' }}>{(() => {
                                                const userCountry = countries.find(country =>
                                                    country.id === userToShow.country_id ||
                                                    country.country_id === userToShow.country_id ||
                                                    country.code === userToShow.country_id ||
                                                    country.iso_code === userToShow.country_id
                                                );
                                                return userCountry ? (userCountry.name || userCountry.country_name || userCountry.nombre || userCountry.name_common) : 'N/A';
                                            })()}</span></p>
                                            <p style={{ fontWeight: '600' }}>Ciudad: <span style={{ fontWeight: '400' }}>{(() => {
                                                const userCity = cities.find(city =>
                                                    city.id === userToShow.city_id ||
                                                    city.city_id === userToShow.city_id ||
                                                    city.name === userToShow.city_id ||
                                                    city.city_name === userToShow.city_id
                                                );
                                                return userCity ? (userCity.name || userCity.city_name || userCity.nombre || userCity.name_common) : 'N/A';
                                            })()}</span></p>
                                            <p style={{ fontWeight: '600' }}>Dirección: <span style={{ fontWeight: '400' }}>{userToShow.address || 'N/A'}</span></p>
                                            <p style={{ fontWeight: '600' }}>Celular: <span style={{ fontWeight: '400' }}>{userToShow.cellphone || 'N/A'}</span></p>
                                            <p style={{ fontWeight: '600' }}>Email(Usuario): <span style={{ fontWeight: '400' }}>{userToShow.email || 'N/A'}</span></p>
                                        </div>,
                                    ]} />

                                </div>,
                                <div>
                                    <Lista titulo="Roles y Permisos" opciones={[
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <p style={{ fontWeight: '600' }}>Roles: <span style={{ fontWeight: '400' }}>{userToShow.roles && userToShow.roles.length > 0 ? userToShow.roles.map(role => role.role_name).join(', ') : 'Sin roles asignados'}</span></p>
                                            <p style={{ fontWeight: '600' }}>Tipo de Usuario: <span style={{ fontWeight: '400' }}>{userToShow.user_type || 'N/A'}</span></p>
                                        </div>,
                                    ]} />
                                    <Lista titulo="Estado del Usuario" opciones={[
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <p style={{ fontWeight: '600' }}><span style={{ fontWeight: '400', color: userToShow.user_is_active ? 'green' : 'red' }}>{userToShow.user_is_active ? 'Activo' : 'Inactivo'}</span></p>
                                        </div>,
                                    ]} />
                                    <Lista titulo="Información de Seguridad" opciones={[
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <p style={{ fontWeight: '600' }}>Último Login: <span style={{ fontWeight: '400' }}>{userToShow.last_login_at ? new Date(userToShow.last_login_at).toLocaleDateString('es-ES') : 'Nunca'}</span></p>
                                            <p style={{ fontWeight: '600' }}>Intentos Fallidos: <span style={{ fontWeight: '400' }}>{userToShow.failed_login_attempts || 0}</span></p>
                                            <p style={{ fontWeight: '600' }}>Bloqueado Hasta: <span style={{ fontWeight: '400' }}>{userToShow.blocked_until ? new Date(userToShow.blocked_until).toLocaleDateString('es-ES') : 'No bloqueado'}</span></p>
                                            <p style={{ fontWeight: '600' }}>Creado: <span style={{ fontWeight: '400' }}>{userToShow.user_created_at ? new Date(userToShow.user_created_at).toLocaleDateString('es-ES') : 'N/A'}</span></p>
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
            {showModalExito && (
                <ModalExito
                    title={tituloExito}
                    type="success-generico"
                    message={mensajeExito}
                    onClose={() => setShowModalExito(false)}
                    onFinalizar={() => setShowModalExito(false)}
                />
            )}
            {showModalInfo && (
                <ModalExito
                    title={tituloInfo}
                    type="info"
                    message={mensajeInfo}
                    onClose={() => setShowModalInfo(false)}
                    onFinalizar={() => setShowModalInfo(false)}
                />
            )}
        </div>
    )
}

export default GestionarUsuarios;