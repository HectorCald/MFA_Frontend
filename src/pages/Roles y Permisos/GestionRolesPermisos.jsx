import styles from "./GestionRolesPermisos.module.css";
import Nav from "../../components/ui/nav";
import Fondo from "../../components/common/Fondo";
import InputSearch from "../../components/common/InputSearch";
import Boton from "../../components/common/Boton";
import { FaPlus, FaToggleOff, FaToggleOn, FaCheck, FaTimes, FaUser } from "react-icons/fa";
import Table from "../../components/ui/Table";
import { useState, useMemo, useEffect } from "react";
import ActionButtons from "../../components/ui/ActionButtons";
import MenuPuntos from "../../components/common/MenuPuntos";
import ModalExito from "../../components/ui/ModalExito";
import Lista from "../../components/common/Lista";
import ListaDesplegable from "../../components/common/ListaDesplegable";
import Combobox from "../../components/common/Combobox";
import Switch from "../../components/common/Switch";
import SingleCheckBox from "../../components/common/SingleCheckBox";
import Input from "../../components/common/Input";
import Instruccion from "../../components/common/Instruccion";
import TableSkeleton from "../../components/ui/TableSkeleton";


import RoleService from "../../services/roleService";
import PermissionService from "../../services/permissionService";


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

let mensajeExito = "";
let tituloExito = "";

let mensajeInfo = "";
let tituloInfo = "";

function GestionRolesPermisos() {
    //------------------------------------------------------------------------------------
    // Estados de modales de exito y info
    const [showModalExito, setShowModalExito] = useState(false);
    const [showModalInfo, setShowModalInfo] = useState(false);
    // Estados de carga y botones
    const [loading, setLoading] = useState(true);

    //------------------------------------------------------------------------------------
    // Búsqueda
    const [searchTerm, setSearchTerm] = useState("");
    const [tableData, setTableData] = useState([]);
    const [openModule, setOpenModule] = useState(null);





    //------------------------------------------------------------------------------------
    // Permisos
    const [permissions, setPermissions] = useState([]);
    const loadPermissions = async () => {
        try {
            const permissionsData = await PermissionService.getAllPermissions();

            // Agrupar permisos por módulo
            const groupedPermissions = permissionsData.reduce((acc, permission) => {
                const module = permission.module;
                if (!acc[module]) {
                    acc[module] = [];
                }

                // Crear el código del permiso: module.action.scope
                let permissionCode = `${permission.module}.${permission.action}`;
                if (permission.scope) {
                    permissionCode += `.${permission.scope}`;
                }

                acc[module].push({
                    id: permission.id,
                    code: permissionCode,
                    action: permission.action,
                    scope: permission.scope,
                    isActive: permission.is_active
                });

                return acc;
            }, {});

            setPermissions(groupedPermissions);
        } catch (error) {
            console.error('Error al cargar permisos:', error);
            setPermissions({});
        }
    };





    //------------------------------------------------------------------------------------
    // Roles
    const loadRoles = async () => {
        try {
            setLoading(true);
            const rolesData = await RoleService.getAllRoles();
            const formattedRoles = rolesData.map(role => ({
                id: role.id,
                rol: role.name || role.role_name,
                codigo: role.code || role.role_code,
                estado: role.is_active ? 'Activo' : 'Inactivo',
                acciones: ["editar", "eliminar"]
            }));
            setTableData(formattedRoles);
        } catch (error) {
            console.error('Error al cargar roles:', error);
            setTableData(mockData); // Fallback a datos mock
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadRoles();
        loadPermissions();
    }, []);






    //------------------------------------------------------------------------------------
    // Búsqueda
    const handleSearch = (value) => {
        setSearchTerm(value);
        if (value.trim() === "") {
            // Recargar roles originales
            loadRoles();
        } else {
            const filteredData = tableData.filter(item =>
                item.rol.toLowerCase().includes(value.toLowerCase()) ||
                item.codigo.toLowerCase().includes(value.toLowerCase()) ||
                item.estado.toLowerCase().includes(value.toLowerCase())
            );
            setTableData(filteredData);
        }
    };
    const handleSearchBlocks = (searchBlocks) => {
        // Evitar llamadas repetidas con el mismo contenido
        const current = JSON.stringify(searchBlocks || []);
        if (window.__lastBlocks === current) {
            return; // No hacer nada si no cambió
        }
        window.__lastBlocks = current;
        if (searchBlocks.length === 0) {
            // Recargar roles originales
            loadRoles();
            return;
        }

        const filteredData = tableData.filter(item => {
            return searchBlocks.every(block => {
                const searchValue = block.toLowerCase();
                return (
                    item.rol.toLowerCase().includes(searchValue) ||
                    item.codigo.toLowerCase().includes(searchValue) ||
                    item.estado.toLowerCase().includes(searchValue)
                );
            });
        });
        setTableData(filteredData);
    };
    const tableRows = useMemo(() => {
        return tableData.map((item, index) => [
            index + 1,
            item.rol,
            item.codigo,
            <div
                className={`${styles.statusColumn} ${styles[`status${item.estado}`]}`}
                onClick={() => {
                    setShowModalInfoDesactivo(true);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', textAlign: 'center', justifyContent: 'center' }}
            >
                <span className={styles.statusDot}></span>
                <span className={styles.statusText}>{item.estado}</span>
            </div>,
            <div className={styles.actionsContainer}>
                <span className={styles.defaultText}>...</span>
                <div className={styles.actionButtons}>
                    <ActionButtons
                        tipo="gestionUsuarios"
                        onInfo={() => handleShowRoleInfo(item)}
                        onEdit={() => {
                            if (item.rol === "Super Administrador" && item.codigo === "super_admin") {
                                mensajeInfo = "No es posible editar el rol super_admin";
                                tituloInfo = "Información";
                                setShowModalInfo(true);
                                return;
                            }
                            handleShowEditarRol(item)
                        }}
                        onDelete={() => {
                            setRoleToDelete(item);
                            setShowModalDelete(true);
                        }}
                    />
                </div>
                <div className={styles.menuPuntos}>
                    <MenuPuntos
                        opciones={[
                            {
                                label: item.estado === 'Activo' ? 'Inactivar' : 'Activar',
                                icono: item.estado === 'Activo' ? <FaToggleOff /> : <FaToggleOn />,
                                onClick: () => {
                                    if (item.estado === 'Activo') {
                                        setRoleToDesactivar(item);
                                        setShowModalDesactivar(true);
                                    } else {
                                        setRoleToActivar(item);
                                        setShowModalActivar(true);
                                    }
                                }
                            },
                        ]}
                    />
                </div>
            </div>
        ]);
    }, [tableData]);






    //------------------------------------------------------------------------------------
    // Eliminar rol
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const handleDelete = async () => {
        if (!roleToDelete) return;

        if (roleToDelete.codigo === "super_admin") {
            tituloInfo = "Información";
            mensajeInfo = "No es posible eliminar el rol super_admin";

            setShowModalInfo(true);
            setShowModalDelete(false);
            return;
        }

        try {
            await RoleService.deleteRole(roleToDelete.id);
            console.log("Rol eliminado exitosamente");

            // Cerrar modal y mostrar éxito
            setShowModalDelete(false);

            mensajeExito = "El rol se eliminó correctamente de los roles y permisos";
            tituloExito = "Exito";

            setShowModalExito(true);

            // Recargar la tabla
            loadRoles();

        } catch (error) {
            console.error('Error al eliminar el rol:', error);
            // Aquí podrías mostrar un mensaje de error
        }
    }





    //------------------------------------------------------------------------------------
    // Desactivar rol
    const [showModalDesactivar, setShowModalDesactivar] = useState(false);
    const [roleToDesactivar, setRoleToDesactivar] = useState(null);
    const [errors, setErrors] = useState({
        desactivarRol: ""
    });
    const [formValues, setFormValues] = useState({
        desactivarRol: ""
    });
    const handleDesactivar = async () => {
        if (!formValues.desactivarRol || formValues.desactivarRol.trim() === '') {
            setErrors({
                desactivarRol: "El motivo es requerido"
            });
            const inputElement = document.getElementById("desactivarRol");
            if (inputElement) {
                inputElement.style.borderColor = 'red';
                inputElement.style.borderWidth = '2px';
            }

            // Limpiar el error después de 3 segundos
            setTimeout(() => {
                const inputElement = document.getElementById("desactivarRol");
                if (inputElement) {
                    inputElement.style.borderColor = '';
                    inputElement.style.borderWidth = '';
                }
                setErrors({
                    desactivarRol: ""
                });

            }, 3000);
            return;
        }
        if (roleToDesactivar.codigo === "super_admin") {
            tituloInfo = "Información";
            mensajeInfo = "No es posible desactivar el rol super_admin";
            setShowModalDesactivar(false);
            setShowModalInfo(true);
            const inputElement = document.getElementById("desactivarRol");
            if (inputElement) {
                inputElement.style.borderColor = '';
                inputElement.style.borderWidth = '';
            }

            return;
        }

        if (!roleToDesactivar) return;

        try {
            // ✅ IMPLEMENTAR LA DESACTIVACIÓN REAL DEL ROL
            const user = JSON.parse(localStorage.getItem('user'));

            // Llamar al servicio para desactivar el rol
            await RoleService.toggleRoleStatus(roleToDesactivar.id, false, user.id);
            console.log("Rol desactivado exitosamente");

            // Mostrar mensaje de éxito
            mensajeExito = `El rol "${roleToDesactivar.rol}" se desactivó correctamente`;
            tituloExito = "Éxito";
            setShowModalExito(true);

            // Recargar la tabla
            loadRoles();

            // Limpiar formulario y cerrar modal
            setFormValues({ desactivarRol: "" });
            setErrors({ desactivarRol: "" });
            setRoleToDesactivar(null);
            setShowModalDesactivar(false);

        } catch (error) {
            console.error('Error al desactivar el rol:', error);
            // Aquí podrías mostrar un mensaje de error
        }
    }





    //------------------------------------------------------------------------------------
    // Activar rol
    const [showModalActivar, setShowModalActivar] = useState(false);
    const [roleToActivar, setRoleToActivar] = useState(null);
    const handleActivar = async () => {
        if (!roleToActivar) return;

        try {
            // ✅ IMPLEMENTAR LA ACTIVACIÓN REAL DEL ROL
            const user = JSON.parse(localStorage.getItem('user'));

            // Llamar al servicio para activar el rol
            await RoleService.toggleRoleStatus(roleToActivar.id, true, user.id);
            console.log("Rol activado exitosamente");

            // Mostrar mensaje de éxito
            mensajeExito = `El rol "${roleToActivar.rol}" se activó correctamente`;
            tituloExito = "Éxito";
            setShowModalExito(true);

            // Recargar la tabla
            loadRoles();

            // Limpiar y cerrar modal
            setRoleToActivar(null);
            setShowModalActivar(false);

        } catch (error) {
            console.error('Error al activar el rol:', error);
            // Aquí podrías mostrar un mensaje de error
        }
    }





    //------------------------------------------------------------------------------------
    // Editar rol
    const [showModalEditarRol, setShowModalEditarRol] = useState(false);
    const [roleToEdit, setRoleToEdit] = useState(null);
    const [formValuesEditarRol, setFormValuesEditarRol] = useState({
        nombreRol: "",
        codigoRol: ""
    });
    const [errorsEditarRol, setErrorsEditarRol] = useState({
        nombreRol: "",
        codigoRol: ""
    });
    const [isActiveRolEditar, setIsActiveRolEditar] = useState(true);
    const [selectedPermissionsEditar, setSelectedPermissionsEditar] = useState([]);
    const handleShowEditarRol = async (role) => {
        try {
            console.log("Obteniendo información del rol para editar:", role.id);

            // Obtener información completa del rol desde la BD
            const roleInfo = await RoleService.getRoleById(role.id);

            if (roleInfo) {
                setRoleToEdit(roleInfo);

                // Llenar el formulario con los datos del rol
                setFormValuesEditarRol({
                    nombreRol: roleInfo.name || "",
                    codigoRol: roleInfo.code || ""
                });

                // Establecer el estado activo
                setIsActiveRolEditar(roleInfo.is_active);

                // Marcar los permisos que ya tiene asignados
                if (roleInfo.permissions && roleInfo.permissions.length > 0) {
                    const permissionIds = roleInfo.permissions.map(p => p.id);
                    setSelectedPermissionsEditar(permissionIds);
                } else {
                    setSelectedPermissionsEditar([]);
                }

                setShowModalEditarRol(true);
                console.log("Información del rol para editar obtenida:", roleInfo);
            } else {
                alert("No se pudo obtener la información del rol");
            }
        } catch (error) {
            console.error("Error al obtener información del rol para editar:", error);
            alert("Error al obtener la información del rol: " + error.message);
        }
    };
    const handleEditarRol = async () => {
        const inputElement = document.getElementById("nombreRolEditar");
        const inputElementCodigo = document.getElementById("codigoRolEditar");

        // Validaciones básicas
        if (formValuesEditarRol.nombreRol.trim() === '' || formValuesEditarRol.codigoRol.trim() === '') {
            setErrorsEditarRol({
                nombreRol: "El nombre del rol es requerido",
                codigoRol: "El codigo del rol es requerido"
            });

            if (inputElement) {
                inputElement.style.borderColor = 'red';
                inputElement.style.borderWidth = '2px';
            }
            if (inputElementCodigo) {
                inputElementCodigo.style.borderColor = 'red';
                inputElementCodigo.style.borderWidth = '2px';
            }
            setTimeout(() => {
                if (inputElement) {
                    inputElement.style.borderColor = '';
                    inputElement.style.borderWidth = '';
                }
                if (inputElementCodigo) {
                    inputElementCodigo.style.borderColor = '';
                    inputElementCodigo.style.borderWidth = '';
                }
                setErrorsEditarRol({
                    nombreRol: "",
                    codigoRol: ""
                });
            }, 3000);
            return;
        }

        try {
            // ✅ VALIDAR QUE NO EXISTA EL NOMBRE (excluyendo el rol actual)
            const nameExists = await RoleService.nameExists(formValuesEditarRol.nombreRol);
            if (nameExists && formValuesEditarRol.nombreRol !== roleToEdit.name) {
                setErrorsEditarRol({
                    nombreRol: "Ya existe un rol con este nombre",
                    codigoRol: ""
                });

                if (inputElement) {
                    inputElement.style.borderColor = 'red';
                    inputElement.style.borderWidth = '2px';
                }

                setTimeout(() => {
                    if (inputElement) {
                        inputElement.style.borderColor = '';
                        inputElement.style.borderWidth = '';
                    }
                    setErrorsEditarRol({
                        nombreRol: "",
                        codigoRol: ""
                    });
                }, 3000);
                return;
            }

            // ✅ VALIDAR QUE NO EXISTA EL CÓDIGO (excluyendo el rol actual)
            const codeExists = await RoleService.codeExists(formValuesEditarRol.codigoRol);
            if (codeExists && formValuesEditarRol.codigoRol !== roleToEdit.code) {
                setErrorsEditarRol({
                    nombreRol: "",
                    codigoRol: "Ya existe un rol con este código"
                });

                if (inputElementCodigo) {
                    inputElementCodigo.style.borderColor = 'red';
                    inputElementCodigo.style.borderWidth = '2px';
                }

                setTimeout(() => {
                    if (inputElementCodigo) {
                        inputElementCodigo.style.borderColor = '';
                        inputElementCodigo.style.borderWidth = '';
                    }
                    setErrorsEditarRol({
                        nombreRol: "",
                        codigoRol: ""
                    });
                }, 3000);
                return;
            }

            // ✅ IMPLEMENTAR LA ACTUALIZACIÓN REAL DEL ROL
            const user = JSON.parse(localStorage.getItem('user'));

            const roleData = {
                nombreRol: formValuesEditarRol.nombreRol,
                codigoRol: formValuesEditarRol.codigoRol,
                isActiveRol: isActiveRolEditar,
                permisosSeleccionados: selectedPermissionsEditar,
                updated_by: user.id
            };

            // Llamar al servicio para actualizar el rol
            const updatedRole = await RoleService.updateRole(roleToEdit.id, roleData);
            console.log("Rol actualizado exitosamente:", updatedRole);

            // Mostrar mensaje de éxito
            mensajeExito = "El rol se actualizó correctamente en los roles y permisos";
            tituloExito = "Éxito";
            setShowModalExito(true);

            // Recargar la tabla
            loadRoles();

            // Limpiar formulario y cerrar modal
            setFormValuesEditarRol({
                nombreRol: "",
                codigoRol: ""
            });
            setErrorsEditarRol({
                nombreRol: "",
                codigoRol: ""
            });
            setSelectedPermissionsEditar([]);
            setRoleToEdit(null);
            setShowModalEditarRol(false);

        } catch (error) {
            console.error('Error al actualizar el rol:', error);
        }
    }





    //------------------------------------------------------------------------------------
    // Toggle de las listas desplegables
    const handleModuleToggle = (moduleName) => {
        if (openModule === moduleName) {
            // Si la misma lista está abierta, la cerramos
            setOpenModule(null);
        } else {
            // Si es una lista diferente, cerramos la anterior y abrimos la nueva
            setOpenModule(moduleName);
        }
    };
    //------------------------------------------------------------------------------------
    // Generar código automático del rol
    const generateRoleCode = (roleName) => {
        if (!roleName) return '';

        // Eliminar caracteres especiales y convertir a snake_case
        const cleanName = roleName
            .replace(/[^a-zA-Z0-9\s]/g, '') // Eliminar caracteres especiales
            .trim();

        if (!cleanName) return '';

        // Convertir a snake_case (guiones bajos)
        const words = cleanName.split(/\s+/);
        const snakeCase = words
            .map(word => word.toLowerCase()) // Todas las palabras en minúscula
            .join('_'); // Unir con guiones bajos

        return snakeCase;
    };





    //------------------------------------------------------------------------------------
    // Permisos
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const handlePermissionChange = (permissionId, isChecked) => {
        if (isChecked) {
            setSelectedPermissions(prev => [...prev, permissionId]);
        } else {
            setSelectedPermissions(prev => prev.filter(id => id !== permissionId));
        }
    };





    //------------------------------------------------------------------------------------
    // Modal de información del rol
    const [showModalRoleInfo, setShowModalRoleInfo] = useState(false);
    const [roleToShow, setRoleToShow] = useState(null);
    const handleShowRoleInfo = async (role) => {
        try {
            console.log("Obteniendo información del rol:", role.id);

            // Obtener información completa del rol desde la BD
            const roleInfo = await RoleService.getRoleById(role.id);

            if (roleInfo) {
                setRoleToShow(roleInfo);
                setShowModalRoleInfo(true);
                console.log("Información del rol obtenida:", roleInfo);
            } else {
                alert("No se pudo obtener la información del rol");
            }
        } catch (error) {
            console.error("Error al obtener información del rol:", error);
            alert("Error al obtener la información del rol: " + error.message);
        }
    };





    //------------------------------------------------------------------------------------
    // Agregar rol
    const [showModalAgregarRol, setShowModalAgregarRol] = useState(false);
    const [isActiveRol, setIsActiveRol] = useState(true);
    const [errorsAgregarRol, setErrorsAgregarRol] = useState({
        nombreRol: "",
        codigoRol: ""
    });
    const [formValuesAgregarRol, setFormValuesAgregarRol] = useState({
        nombreRol: "",
        codigoRol: ""
    });
    const handleAgregarRol = async () => {
        const inputElement = document.getElementById("nombreRol");
        const inputElementCodigo = document.getElementById("codigoRol");

        // Validaciones básicas
        if (formValuesAgregarRol.nombreRol.trim() === '' || formValuesAgregarRol.codigoRol.trim() === '') {
            setErrorsAgregarRol({
                nombreRol: "El nombre del rol es requerido",
                codigoRol: "El codigo del rol es requerido"
            });

            if (inputElement) {
                inputElement.style.borderColor = 'red';
                inputElement.style.borderWidth = '2px';
            }
            if (inputElementCodigo) {
                inputElementCodigo.style.borderColor = 'red';
                inputElementCodigo.style.borderWidth = '2px';
            }
            setTimeout(() => {
                if (inputElement) {
                    inputElement.style.borderColor = '';
                    inputElement.style.borderWidth = '';
                }
                if (inputElementCodigo) {
                    inputElementCodigo.style.borderColor = '';
                    inputElementCodigo.style.borderWidth = '';
                }
                setErrorsAgregarRol({
                    nombreRol: "",
                    codigoRol: ""
                });
            }, 3000);
            return;
        }

        try {
            // ✅ VALIDAR QUE NO EXISTA EL NOMBRE
            const nameExists = await RoleService.nameExists(formValuesAgregarRol.nombreRol);
            if (nameExists) {
                setErrorsAgregarRol({
                    nombreRol: "Ya existe un rol con este nombre",
                    codigoRol: ""
                });

                // Marcar el campo de nombre como error
                if (inputElement) {
                    inputElement.style.borderColor = 'red';
                    inputElement.style.borderWidth = '2px';
                }

                // Limpiar el error después de 3 segundos
                setTimeout(() => {
                    if (inputElement) {
                        inputElement.style.borderColor = '';
                        inputElement.style.borderWidth = '';
                    }
                    setErrorsAgregarRol({
                        nombreRol: "",
                        codigoRol: ""
                    });
                }, 3000);
                return;
            }

            // ✅ VALIDAR QUE NO EXISTA EL CÓDIGO
            const codeExists = await RoleService.codeExists(formValuesAgregarRol.codigoRol);

            if (codeExists) {
                setErrorsAgregarRol({
                    nombreRol: "",
                    codigoRol: "Ya existe un rol con este código"
                });

                // Marcar el campo de código como error
                if (inputElementCodigo) {
                    inputElementCodigo.style.borderColor = 'red';
                    inputElementCodigo.style.borderWidth = '2px';
                }

                // Limpiar el error después de 3 segundos
                setTimeout(() => {
                    if (inputElementCodigo) {
                        inputElementCodigo.style.borderColor = '';
                        inputElementCodigo.style.borderWidth = '';
                    }
                    setErrorsAgregarRol({
                        nombreRol: "",
                        codigoRol: ""
                    });
                }, 3000);
                return;
            }

            const user = JSON.parse(localStorage.getItem('user'));

            const roleData = {
                nombreRol: formValuesAgregarRol.nombreRol,
                codigoRol: formValuesAgregarRol.codigoRol,
                isActiveRol: isActiveRol,
                permisosSeleccionados: selectedPermissions,
                created_by: user.id
            };

            const newRole = await RoleService.createRole(roleData);
            console.log("Rol creado exitosamente:", newRole);

            loadRoles();

            mensajeExito = "El rol se creó correctamente en los roles y permisos";
            tituloExito = "Exito";

            setShowModalExito(true);

            // Limpiar formulario y cerrar modal
            setFormValuesAgregarRol({
                nombreRol: "",
                codigoRol: ""
            });
            setErrorsAgregarRol({
                nombreRol: "",
                codigoRol: ""
            });
            setSelectedPermissions([]); // Limpiar permisos seleccionados
            setShowModalAgregarRol(false);

        } catch (error) {
            console.error('Error al crear el rol:', error);
        }
    }


    return (
        <div className={styles.container}>
            <Nav />
            <Fondo />
            <div className={styles.content}>
                <p className={styles.rutaScreen}>Panel Administrativo - <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>Roles y Permisos</span></p>
                <h1 className={styles.title}>Roles y Permisos</h1>
                <div className={styles.searchContainer}>
                    <InputSearch
                        placeholder="Buscar"
                        value={searchTerm}
                        onChange={handleSearch}
                        onSearchBlocks={handleSearchBlocks}
                    />
                    <Boton
                        label="Agregar rol"
                        type="button"
                        disabled={false}
                        tipo="blueButton"
                        icon={<FaPlus />}
                        onClick={() => setShowModalAgregarRol(true)}
                    />
                </div>
                <Instruccion texto="Use el buscador para filtrar por nombre, codigo, estado...presione doble espacio para agregar más filtros" />
                <div className={styles.tableContainer}>
                    {loading && (
                        <TableSkeleton
                            columns={5}
                            columnNames={["Nº", "Rol", "Codigo", "Estado", "Acciones"]}
                            rows={6}
                        />
                    )}
                    {!loading && (
                        <Table
                            headers={["Nº", "Rol", "Codigo", "Estado", "Acciones"]}
                            data={tableRows}
                        />
                    )}
                </div>
            </div>
            {showModalDelete && (
                <ModalExito
                    title="Eliminar"
                    type="delete"
                    message={`¿Estás seguro de querer eliminar el rol "${roleToDelete?.rol}"? Esta acción no se puede deshacer.`}
                    onClose={() => {
                        setShowModalDelete(false);
                        setRoleToDelete(null);
                    }}
                    onFinalizar={() => handleDelete()}
                    onCancel={() => {
                        setShowModalDelete(false);
                        setRoleToDelete(null);
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
            {showModalDesactivar && roleToDesactivar && (
                <ModalExito
                    type="personalizar"
                    icon={FaToggleOff}
                    title="Desactivar rol"
                    message=""
                    extraContent={
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                            <Lista titulo="" opciones={[
                                <div>
                                    <p style={{ fontWeight: '600' }}>Rol: <span style={{ fontWeight: '400' }}>{roleToDesactivar.rol}</span></p>
                                </div>
                            ]} />
                            <p style={{ fontSize: '13px', fontWeight: '400', color: 'red', textAlign: 'left', marginTop: 'auto', whiteSpace: 'wrap' }}>¿Estás seguro de que quieres desactivar este rol? <span style={{ fontSize: '13px', fontWeight: '200' }}>Esta Accion impedira que el rol sea visible para la asignacion de roles.</span></p>
                            <Combobox
                                label="Motivo"
                                id="desactivarRol"
                                options={motivosDesactivar.map(motivo => ({ label: motivo, value: motivo }))}
                                required
                                errorMessage={errors.desactivarRol}
                                value={formValues.desactivarRol}
                                onChange={(e) => {
                                    setFormValues({
                                        ...formValues,
                                        desactivarRol: e.target.value
                                    });
                                    // Limpiar el error cuando el usuario empiece a escribir
                                    if (errors.desactivarRol) {
                                        setErrors({
                                            desactivarRol: ""
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
                                setFormValues({ desactivarRol: "" });
                                setErrors({ desactivarRol: "" });
                                setRoleToDesactivar(null);
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
                        setFormValues({ desactivarRol: "" });
                        setErrors({ desactivarRol: "" });
                        setRoleToDesactivar(null);
                    }}
                    onFinalizar={() => {
                        setShowModalDesactivar(false);
                        // Limpiar el formulario y errores al finalizar
                        setFormValues({ desactivarRol: "" });
                        setErrors({ desactivarRol: "" });
                        setRoleToDesactivar(null);
                    }}
                    showCloseButton={true}
                />
            )}
            {showModalActivar && roleToActivar && (
                <ModalExito
                    type="personalizar"
                    icon={FaToggleOff}
                    title="Activar rol"
                    message=""
                    extraContent={
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                            <Lista titulo="" opciones={[
                                <div>
                                    <p style={{ fontWeight: '600' }}>Rol: <span style={{ fontWeight: '400' }}>{roleToActivar.rol}</span></p>
                                </div>
                            ]} />
                            <p style={{ fontSize: '13px', fontWeight: '400', color: 'green', textAlign: 'left', marginTop: 'auto', whiteSpace: 'wrap' }}>¿Estás seguro de que quieres activar este rol? <span style={{ fontSize: '13px', fontWeight: '200' }}>Esta Accion habilitara el rol para la asignacion de roles.</span></p>
                        </div>
                    }
                    customButtonConfig={[
                        {
                            label: "Cancelar",
                            onClick: () => {
                                setShowModalActivar(false);
                                setRoleToActivar(null);
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
                        setRoleToActivar(null);
                    }}
                    onFinalizar={() => {
                        setShowModalActivar(false);
                        // Limpiar el formulario y errores al finalizar
                        setFormValues({ desactivarRol: "" });
                        setErrors({ desactivarRol: "" });
                    }}
                    showCloseButton={true}
                />
            )}
            {showModalEditarRol && roleToEdit && (
                <ModalExito
                    title="Editar Rol"
                    type="personalizar"
                    message=""
                    styleCustom={{ minWidth: '700px', maxWidth: 'auto', overflowY: 'auto' }}
                    extraContent={
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '10px', marginBottom: '20px' }}>
                                <Input
                                    label="Nombre del rol"
                                    required
                                    placeholder="Nombre del rol"
                                    value={formValuesEditarRol.nombreRol}
                                    id="nombreRolEditar"
                                    onChange={(e) => {
                                        const nombreRol = e.target.value;
                                        setFormValuesEditarRol({
                                            ...formValuesEditarRol,
                                            nombreRol: nombreRol
                                        });
                                    }}
                                    errorMessage={errorsEditarRol.nombreRol}
                                />
                                <Input
                                    label="Codigo del rol"
                                    required
                                    value={formValuesEditarRol.codigoRol}
                                    placeholder="Código del rol"
                                    id="codigoRolEditar"
                                    onChange={(e) => {
                                        let inputValue = e.target.value;

                                        // Convertir espacios en barras bajas
                                        inputValue = inputValue.replace(/\s+/g, '_');

                                        // Filtrar SOLO letras, números y barras bajas - BLOQUEAR TODO LO DEMÁS
                                        inputValue = inputValue.replace(/[^a-zA-Z0-9_]/g, '');

                                        // No permitir múltiples barras bajas consecutivas
                                        inputValue = inputValue.replace(/_+/g, '_');

                                        // Solo eliminar barras bajas del inicio y final si hay MÁS DE UNO
                                        if (inputValue.startsWith('__') && inputValue.length > 2) {
                                            inputValue = inputValue.replace(/^_+/, '');
                                        }
                                        if (inputValue.endsWith('__') && inputValue.length > 2) {
                                            inputValue = inputValue.replace(/_+$/, '');
                                        }

                                        setFormValuesEditarRol({
                                            ...formValuesEditarRol,
                                            codigoRol: inputValue
                                        });
                                    }}
                                    errorMessage={errorsEditarRol.codigoRol}
                                />
                                <Switch
                                    checked={isActiveRolEditar}
                                    onChange={setIsActiveRolEditar}
                                    showLabels={true}
                                    trueLabel="Activo"
                                    falseLabel="Inactivo"
                                />
                            </div>
                            <div style={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }}>
                                {Object.entries(permissions).map(([moduleName, modulePermissions]) => (
                                    <ListaDesplegable
                                        key={moduleName}
                                        titulo={`Gestión de ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}`}
                                        isOpen={openModule === moduleName}
                                        onToggle={() => handleModuleToggle(moduleName)}
                                    >
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <div style={{ flex: 1 }}>
                                                {modulePermissions.slice(0, 10).map(permission => (
                                                    <SingleCheckBox
                                                        key={permission.id}
                                                        label={permission.code}
                                                        onChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedPermissionsEditar(prev => [...prev, permission.id]);
                                                            } else {
                                                                setSelectedPermissionsEditar(prev => prev.filter(id => id !== permission.id));
                                                            }
                                                        }}
                                                        checked={selectedPermissionsEditar.includes(permission.id)}
                                                    />
                                                ))}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                {modulePermissions.slice(10, 20).map(permission => (
                                                    <SingleCheckBox
                                                        key={permission.id}
                                                        label={permission.code}
                                                        onChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedPermissionsEditar(prev => [...prev, permission.id]);
                                                            } else {
                                                                setSelectedPermissionsEditar(prev => prev.filter(id => id !== permission.id));
                                                            }
                                                        }}
                                                        checked={selectedPermissionsEditar.includes(permission.id)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </ListaDesplegable>
                                ))}
                            </div>
                        </div>
                    }
                    customButtonConfig={[
                        {
                            label: "Cancelar",
                            onClick: () => {
                                setShowModalEditarRol(false);
                            },
                            tipo: "grayButton",
                            icon: <FaTimes />
                        },
                        {
                            label: "Guardar",
                            onClick: () => {
                                handleEditarRol();
                            },
                            tipo: "greenButton",
                            icon: <FaCheck />
                        }
                    ]}
                    onClose={() => {
                        setShowModalEditarRol(false);
                        setFormValuesEditarRol({
                            nombreRol: "",
                            codigoRol: ""
                        });
                        setErrorsEditarRol({
                            nombreRol: "",
                            codigoRol: ""
                        });
                        setSelectedPermissionsEditar([]);
                        setRoleToEdit(null);
                        setOpenModule(null);
                    }}
                />
            )}
            {showModalAgregarRol && (
                <ModalExito
                    title="Agregar Nuevo Rol"
                    type="personalizar"
                    message=""
                    styleCustom={{ minWidth: '700px', maxWidth: 'auto', overflowY: 'auto' }}
                    extraContent={
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '10px', marginBottom: '20px' }}>
                                <Input
                                    label="Nombre del rol"
                                    required
                                    placeholder="Nombre del rol"
                                    value={formValuesAgregarRol.nombreRol}
                                    id="nombreRol"
                                    onChange={(e) => {
                                        const nombreRol = e.target.value;
                                        // Solo generar código automáticamente si el campo de código está vacío o coincide con el generado anteriormente
                                        const autoGeneratedCode = generateRoleCode(nombreRol);
                                        const currentCode = formValuesAgregarRol.codigoRol;
                                        const previousAutoCode = generateRoleCode(formValuesAgregarRol.nombreRol);

                                        // Si el código actual es igual al auto-generado anterior, actualizarlo
                                        // Si no, mantener el código que el usuario escribió manualmente
                                        const codigoRol = (currentCode === previousAutoCode || currentCode === '') ? autoGeneratedCode : currentCode;

                                        setFormValuesAgregarRol({
                                            ...formValuesAgregarRol,
                                            nombreRol: nombreRol,
                                            codigoRol: codigoRol
                                        });
                                    }}
                                    errorMessage={errorsAgregarRol.nombreRol}
                                />
                                <Input
                                    label="Codigo del rol"
                                    required
                                    value={formValuesAgregarRol.codigoRol}
                                    placeholder="Se genera automáticamente"
                                    id="codigoRol"
                                    onChange={(e) => {
                                        let inputValue = e.target.value;

                                        // Convertir espacios en barras bajas
                                        inputValue = inputValue.replace(/\s+/g, '_');

                                        // Filtrar SOLO letras, números y barras bajas - BLOQUEAR TODO LO DEMÁS
                                        inputValue = inputValue.replace(/[^a-zA-Z0-9_]/g, '');

                                        // No permitir múltiples barras bajas consecutivas
                                        inputValue = inputValue.replace(/_+/g, '_');

                                        // Solo eliminar barras bajas del inicio y final si hay MÁS DE UNO
                                        if (inputValue.startsWith('__') && inputValue.length > 2) {
                                            inputValue = inputValue.replace(/^_+/, '');
                                        }
                                        if (inputValue.endsWith('__') && inputValue.length > 2) {
                                            inputValue = inputValue.replace(/_+$/, '');
                                        }

                                        setFormValuesAgregarRol({
                                            ...formValuesAgregarRol,
                                            codigoRol: inputValue
                                        });
                                    }}
                                    errorMessage={errorsAgregarRol.codigoRol}
                                />
                                <Switch
                                    checked={isActiveRol}
                                    onChange={setIsActiveRol}
                                    showLabels={true}
                                    trueLabel="Activo"
                                    falseLabel="Inactivo"
                                />
                            </div>
                            <div style={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }}>
                                {Object.entries(permissions).map(([moduleName, modulePermissions]) => (
                                    <ListaDesplegable
                                        key={moduleName}
                                        titulo={`Gestión de ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}`}
                                        isOpen={openModule === moduleName}
                                        onToggle={() => handleModuleToggle(moduleName)}
                                    >
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <div style={{ flex: 1 }}>
                                                {modulePermissions.slice(0, 10).map(permission => (
                                                    <SingleCheckBox
                                                        key={permission.id}
                                                        label={permission.code}
                                                        onChange={(checked) => handlePermissionChange(permission.id, checked)}
                                                        checked={selectedPermissions.includes(permission.id)}
                                                    />
                                                ))}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                {modulePermissions.slice(10, 20).map(permission => (
                                                    <SingleCheckBox
                                                        key={permission.id}
                                                        label={permission.code}
                                                        onChange={(checked) => handlePermissionChange(permission.id, checked)}
                                                        checked={selectedPermissions.includes(permission.id)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </ListaDesplegable>
                                ))}
                            </div>
                        </div>
                    }
                    customButtonConfig={[
                        {
                            label: "Cancelar",
                            onClick: () => {
                                setShowModalAgregarRol(false);
                            },
                            tipo: "grayButton",
                            icon: <FaTimes />
                        },
                        {
                            label: "Guardar",
                            onClick: () => {
                                handleAgregarRol();
                            },
                            tipo: "greenButton",
                            icon: <FaCheck />
                        }
                    ]}
                    onClose={() => {
                        setShowModalAgregarRol(false);
                        setFormValuesAgregarRol({
                            nombreRol: "",
                            codigoRol: ""
                        });
                        setErrorsAgregarRol({
                            nombreRol: "",
                            codigoRol: ""
                        });
                        setOpenModule(null);
                    }}
                />
            )}
            {showModalRoleInfo && roleToShow && (
                <ModalExito
                    type="personalizar"
                    icon={FaUser}
                    title="Información del Rol"
                    styleCustom={{ maxWidth: '800px' }}
                    extraContent={
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                            {/* Datos del Rol */}
                            <Lista titulo="Datos del Rol" opciones={[
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <p style={{ fontWeight: '600' }}>Nombre: <span style={{ fontWeight: '400' }}>{roleToShow.name}</span></p>
                                    <p style={{ fontWeight: '600' }}>Código: <span style={{ fontWeight: '400' }}>{roleToShow.code}</span></p>
                                    <p style={{ fontWeight: '600' }}>Estado: <span style={{ fontWeight: '400', color: roleToShow.is_active ? 'green' : 'red' }}>{roleToShow.is_active ? 'Activo' : 'Inactivo'}</span></p>
                                    <p style={{ fontWeight: '600' }}>Creado: <span style={{ fontWeight: '400' }}>{roleToShow.created_at ? new Date(roleToShow.created_at).toLocaleDateString('es-ES') : 'N/A'}</span></p>
                                    <p style={{ fontWeight: '600' }}>Última actualización: <span style={{ fontWeight: '400' }}>{roleToShow.updated_at ? new Date(roleToShow.updated_at).toLocaleDateString('es-ES') : 'N/A'}</span></p>
                                </div>,
                            ]} />

                            {/* Permisos Asignados */}
                            <Lista titulo="Permisos Asignados" opciones={[
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {roleToShow.permissions && roleToShow.permissions.length > 0 ? (
                                        (() => {
                                            // Agrupar permisos por módulo
                                            const groupedPermissions = roleToShow.permissions.reduce((acc, permission) => {
                                                const module = permission.module;
                                                if (!acc[module]) {
                                                    acc[module] = [];
                                                }
                                                acc[module].push(permission);
                                                return acc;
                                            }, {});

                                            return Object.entries(groupedPermissions).map(([moduleName, modulePermissions]) => (
                                                <ListaDesplegable
                                                    key={moduleName}
                                                    titulo={moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}
                                                    isOpen={openModule === moduleName}
                                                    onToggle={() => handleModuleToggle(moduleName)}
                                                >
                                                    <div style={{ padding: '8px 15px' }}>
                                                        {modulePermissions.map((permission, index) => (
                                                            <div key={index} style={{
                                                                padding: '6px 0',
                                                                borderBottom: index < modulePermissions.length - 1 ? '1px solid #f0f0f0' : 'none',
                                                                fontSize: '13px'
                                                            }}>
                                                                <span style={{ fontWeight: '500', color: '#555' }}>
                                                                    {permission.action}
                                                                </span>
                                                                {permission.scope && (
                                                                    <span style={{ color: '#888', marginLeft: '5px' }}>
                                                                        ({permission.scope})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </ListaDesplegable>
                                            ));
                                        })()
                                    ) : (
                                        <p style={{ color: '#666', fontStyle: 'italic' }}>No hay permisos asignados</p>
                                    )}
                                </div>,
                            ]} />
                        </div>
                    }
                    customButtonConfig={[
                        {
                            label: "Aceptar",
                            onClick: () => {
                                setShowModalRoleInfo(false);
                                setRoleToShow(null);
                            },
                            tipo: "blueButton",
                            icon: <FaCheck />
                        }
                    ]}
                    showCloseButton={true}
                    onClose={() => {
                        setShowModalRoleInfo(false);
                        setRoleToShow(null);
                    }}
                />
            )}
        </div>
    );
}

export default GestionRolesPermisos;