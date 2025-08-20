import styles from "./GestionarClienteEmpresa.module.css";
import Fondo from "../../components/common/Fondo";
import logo from "../../assets/logo-MFA.png";
import Boton from "../../components/common/Boton";
import { FaPlus, FaArrowLeft } from "react-icons/fa";
import InputSearch from "../../components/common/InputSearch";
import Table from "../../components/ui/Table";
import ActionButtons from "../../components/ui/ActionButtons";
import ModalExito from "../../components/ui/ModalExito";
import Person from "../../components/ui/Person";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import OfficeService from "../../services/officeService";
import BusinessClientRegistrationService from "../../services/businessClientRegistrationService";
import Nav from "../../components/ui/nav";

function GestionarOficinasClienteEmpresa() {
    const navigate = useNavigate();
    const { clientId } = useParams();
    
    const [offices, setOffices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchBlocks, setSearchBlocks] = useState([]);
    const [clientInfo, setClientInfo] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showPersonModal, setShowPersonModal] = useState(false);
    const [officeToDelete, setOfficeToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deletedOfficeInfo, setDeletedOfficeInfo] = useState(null);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [personModalTitle, setPersonModalTitle] = useState("");
    const [modalConfig, setModalConfig] = useState({
        type: "info",
        title: "",
        message: "",
        showButtons: true
    });

    useEffect(() => {
        loadClientInfo();
    }, [clientId]);

    const loadClientInfo = async () => {
        try {
            // Obtener información del cliente empresarial
            const response = await BusinessClientRegistrationService.getBusinessClientById(clientId);
            const clientData = {
                id: clientId,
                name: response.name || 'Cliente Empresa',
                code: response.code || 'CLI001',
                centralized_payment: response.centralized_payment || false,
                gerente: response.gerente || null
            };
            
            setClientInfo(clientData);
            
            // Llamar a loadOffices con los datos del cliente
            await loadOffices(clientData);
        } catch (error) {
            console.error('Error cargando información del cliente:', error);
            const clientData = {
                id: clientId,
                name: 'Cliente Empresa',
                code: 'CLI001',
                centralized_payment: false,
                gerente: null
            };
            
            setClientInfo(clientData);
            await loadOffices(clientData);
        }
    };

    const loadOffices = async (clientData = null) => {
        try {
            setLoading(true);
            const response = await OfficeService.getOfficesByBusinessClientId(clientId);
            // Obtener roles reales de cada oficina usando la tabla business_person_role
            const officesWithRoles = await Promise.all(
                response.map(async (office) => {
                        try {
                            // Obtener roles reales de esta oficina
                            const rolesResponse = await OfficeService.getOfficeRoles(office.id, clientId);
                            console.log(`Roles para oficina ${office.name}:`, rolesResponse);
                            
                            const roles = {
                                gerente: null,
                                responsable: null,
                                contable: null
                            };
                            
                            if (rolesResponse) {
                                console.log(`Datos obtenidos de business_person_role para ${office.name}:`, rolesResponse);
                                
                                // Procesar los roles obtenidos de business_person_role
                                rolesResponse.forEach(role => {
                                    if (role.role_type_name === 'Responsable de Oficina') {
                                        roles.responsable = {
                                            id: role.person_id,
                                            first_name: role.first_name,
                                            last_name: role.last_name,
                                            dni: role.dni,
                                            email: role.email,
                                            cellphone: role.cellphone
                                        };
                                    } else if (role.role_type_name === 'Contacto Contable') {
                                        roles.contable = {
                                            id: role.person_id,
                                            first_name: role.first_name,
                                            last_name: role.last_name,
                                            dni: role.dni,
                                            email: role.email,
                                            cellphone: role.cellphone
                                        };
                                    } else if (role.role_type_name === 'Gerente General') {
                                        roles.gerente = {
                                            id: role.person_id,
                                            first_name: role.first_name,
                                            last_name: role.last_name,
                                            dni: role.dni,
                                            email: role.email,
                                            cellphone: role.cellphone
                                        };
                                    }
                                });
                            } else {
                                console.log(`No se pudieron obtener roles para ${office.name}:`, rolesResponse);
                            }
                            
                            return {
                                ...office,
                                roles: roles
                            };
                        } catch (error) {
                            console.log(`Error obteniendo roles para ${office.name}:`, error.message);
                            return {
                                ...office,
                                roles: {
                                    gerente: null,
                                    responsable: null,
                                    contable: null
                                }
                            };
                        }
                    })
                );
                
                            setOffices(officesWithRoles);
            
    } catch (error) {
            setError('Error al cargar las oficinas del cliente');
        } finally {
            setLoading(false);
        }
    };

    // Función para filtrar oficinas basada en bloques de búsqueda
    const filterOfficesByBlocks = (offices, blocks) => {
        if (blocks.length === 0) return offices;
        
        return offices.filter(office => {
            const officeData = {
                name: office.name?.toLowerCase() || '',
                city: office.city_name?.toLowerCase() || '',
                country: office.country_name?.toLowerCase() || '',
                phone: office.phone?.toLowerCase() || '',
                cellphone: office.cellphone?.toLowerCase() || '',
                email: office.email?.toLowerCase() || '',
                type: office.office_type_name?.toLowerCase() || ''
            };

            return blocks.every(block => {
                const blockLower = block.toLowerCase();
                return Object.values(officeData).some(value => 
                    value.includes(blockLower)
                );
            });
        });
    };

    const filteredOffices = filterOfficesByBlocks(offices, searchBlocks);

    // Función para determinar si mostrar el icono de contable
    const shouldShowContable = (office) => {
        if (!clientInfo) return false;
        
        // Si el pago es centralizado, solo mostrar en la oficina principal
        if (clientInfo.centralized_payment === true) {
            return office.office_type_name === 'Principal';
        }
        
        // Si el pago NO es centralizado, mostrar en todas las oficinas
        return true;
    };

    // Función para obtener el nombre del responsable de la oficina
    const getResponsableName = (office) => {
        // Usar el responsable específico de la oficina si existe
        if (office.roles?.responsable) {
            const name = `${office.roles.responsable.first_name} ${office.roles.responsable.last_name}`;
            return name;
        }
        
        // Si no hay responsable específico, usar el gerente general como fallback
        if (office.roles?.gerente) {
            const name = `${office.roles.gerente.first_name} ${office.roles.gerente.last_name} (Gerente)`;
            return name;
        }
        
        return 'N/A';
    };

    const tableData = filteredOffices.map((office, index) => [
        index + 1,
        office.name || 'N/A',
        office.city_name || 'N/A',
        office.country_name || 'N/A',
        office.phone || 'N/A',
        office.cellphone || 'N/A',
        office.email || 'N/A',
        office.office_type_name || 'N/A',
        getResponsableName(office),
        <ActionButtons 
            tipo="oficina"
            onInfo={() => handleInfo(office)}
            onEdit={() => handleEdit(office)}
            onDelete={() => handleDelete(office)}
            onContable={() => handleContable(office)}
            onResponsable={() => handleResponsable(office)}
            showContable={shouldShowContable(office)}
        />
    ]);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchBlocks = (blocks) => {
        setSearchBlocks(blocks);
    };



    const handleAddOffice = () => {
        navigate(`/gestionar-cliente-empresa/gestionar-oficinas/${clientId}/agregar-oficina`);
    };

    // Funciones para los botones de acciones
    const handleInfo = (office) => {
        alert(`Información de la oficina: ${office.name}`);
    };

    const handleEdit = (office) => {
        // Navegar a la página de edición de oficina
        navigate(`/gestionar-cliente-empresa/gestionar-oficinas/${clientId}/editar-oficina/${office.id}`);
    };

    const handleDelete = (office) => {
        
        // Verificar que no sea la oficina principal
        if (office.office_type_name === 'Principal') {
            setModalConfig({
                type: "info",
                title: "Información",
                message: "No se puede eliminar la oficina principal. Esta oficina es fundamental para el funcionamiento del cliente empresarial y debe permanecer activa.",
                showButtons: true
            });
            setShowInfoModal(true);
            return;
        }
        
        setOfficeToDelete(office);
        setShowDeleteModal(true);
    };

    const handleContable = (office) => {
        // Usar el contable específico de la oficina si existe
        if (office.roles?.contable) {
            setSelectedPerson(office.roles.contable);
            setPersonModalTitle(`Contable de la Oficina: ${office.name}`);
            setShowPersonModal(true);
        } 
        // Si no hay contable específico, usar el gerente general como fallback
        else if (office.roles?.gerente) {
            setSelectedPerson(office.roles.gerente);
            setPersonModalTitle(`Contable de la Oficina: ${office.name} (Gerente General)`);
            setShowPersonModal(true);
        } 
        else {
            alert('No hay información del contable disponible para esta oficina');
        }
    };

    const handleResponsable = (office) => {
        // Usar el responsable específico de la oficina si existe
        if (office.roles?.responsable) {
            setSelectedPerson(office.roles.responsable);
            setPersonModalTitle(`Responsable de la Oficina: ${office.name}`);
            setShowPersonModal(true);
        } 
        // Si no hay responsable específico, usar el gerente general como fallback
        else if (office.roles?.gerente) {
            setSelectedPerson(office.roles.gerente);
            setPersonModalTitle(`Responsable de la Oficina: ${office.name} (Gerente General)`);
            setShowPersonModal(true);
        } 
        else {
            alert('No hay información del responsable disponible para esta oficina');
        }
    };

    // Función para confirmar eliminación de oficina
    const confirmDelete = async () => {
        if (!officeToDelete) return;

        try {
            setDeleteLoading(true);
            
            // Obtener el usuario logueado desde localStorage
            const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
            const currentUserId = userInfo.id || userInfo.user_id;
            
            if (!currentUserId) {
                throw new Error('No se pudo obtener el ID del usuario logueado');
            }

            const response = await OfficeService.deactivateOffice(officeToDelete.id, currentUserId);

            // Guardar información de la oficina eliminada para el modal de éxito
            setDeletedOfficeInfo({
                name: officeToDelete.name,
                roles_deleted: response?.roles_deleted || 0,
                persons_deleted: response?.persons_deleted || 0
            });

            // Recargar la lista de oficinas
            await loadOffices();
            setShowDeleteModal(false);
            setOfficeToDelete(null);

            // Mostrar modal de éxito
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error deleting office:', error);
            
            let errorMessage = 'Error al eliminar la oficina';
            if (error.message.includes('No se puede eliminar la oficina principal')) {
                errorMessage = 'No se puede eliminar la oficina principal';
            } else if (error.message.includes('Error interno del servidor')) {
                errorMessage = 'Error interno del servidor. Por favor, intente nuevamente.';
            } else {
                errorMessage = `Error al eliminar la oficina: ${error.message}`;
            }
            
            alert(errorMessage);
        } finally {
            setDeleteLoading(false);
        }
    };

    // Función para cancelar eliminación
    const cancelDelete = () => {
        setShowDeleteModal(false);
        setOfficeToDelete(null);
    };

    // Función para cerrar modal de éxito
    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        setDeletedOfficeInfo(null);
    };

    // Función para cerrar modal de información
    const closeInfoModal = () => {
        setShowInfoModal(false);
    };

    // Función para cerrar modal de Person
    const closePersonModal = () => {
        setShowPersonModal(false);
        setSelectedPerson(null);
        setPersonModalTitle("");
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <Nav />
                <Fondo />
                <div className={styles.content}>
                    <h1 className={styles.title}>Gestionando Oficinas del Cliente</h1>
                    <div className={styles.loading}>
                        Cargando oficinas...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <Nav />
                <Fondo />
                <div className={styles.content}>
                    <h1 className={styles.title}>Gestionando Oficinas del Cliente</h1>
                    <div className={styles.error}>
                        {error}
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
                <h1 className={styles.title}>
                    Gestion de Oficinas - {clientInfo?.name || 'Cliente Empresa'}
                </h1>
                
                <div className={styles.searchContainer}>
                    <InputSearch 
                        placeholder="Buscar oficinas" 
                        value={searchTerm}
                        onChange={handleSearch}
                        onSearchBlocks={handleSearchBlocks}
                        info="Buscar por nombre, ciudad, país, teléfono, celular, email, tipo, etc. (Presiona la lupa para buscar o haz doble espacio para agregar más filtros)"
                    />
                    <Boton 
                        label="Agregar Oficina" 
                        onClick={handleAddOffice} 
                        type="button" 
                        disabled={false} 
                        tipo="blueButton" 
                        icon={<FaPlus />} 
                    />
                </div>
                
                {/* Label del tipo de pago */}
                <div className={styles.paymentInfoContainer}>
                    <span className={styles.paymentLabel}>
                        Pago: {clientInfo?.centralized_payment ? 'Centralizado' : 'Descentralizado'}
                    </span>
                </div>
                
                <div className={styles.tableContainer}>
                    <Table 
                        headers={["Nº", "Nombre", "Ciudad", "País", "Teléfono", "Celular", "Email", "Tipo", "Responsable", "Acciones"]} 
                        data={tableData} 
                    />
                </div>
            </div>
            
            {/* Modal de confirmación de eliminación */}
            {showDeleteModal && officeToDelete && (
                <ModalExito
                    type="delete"
                    title="Confirmar Eliminación"
                    message={`¿Está seguro que desea eliminar la oficina "${officeToDelete.name}"? Esta acción eliminará la oficina, todas las relaciones de roles (responsable, contable) y las personas creadas específicamente para esta oficina (no el gerente general). Esta acción no se puede deshacer.`}
                    showButtons={true}
                    onClose={cancelDelete}
                    onAgregarOficina={cancelDelete}
                    onFinalizar={confirmDelete}
                    clienteEmpresa={null}
                    oficinaPrincipal={officeToDelete}
                    tipoGestionPagos={null}
                />
            )}

            {/* Modal de éxito después de eliminar */}
            {showSuccessModal && deletedOfficeInfo && (
                <ModalExito
                    type="success-generico"
                    title="¡Eliminación Exitosa!"
                    message={`La oficina "${deletedOfficeInfo.name}" ha sido eliminada correctamente junto con ${deletedOfficeInfo.roles_deleted} relaciones de roles y ${deletedOfficeInfo.persons_deleted} personas asociadas.`}
                    showButtons={true}
                    onClose={closeSuccessModal}
                    onAgregarOficina={closeSuccessModal}
                    onFinalizar={closeSuccessModal}
                    clienteEmpresa={null}
                    oficinaPrincipal={null}
                    tipoGestionPagos={null}
                />
            )}

            {/* Modal de información */}
            {showInfoModal && (
                <ModalExito
                    type={modalConfig.type}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    showButtons={modalConfig.showButtons}
                    onClose={closeInfoModal}
                    onAgregarOficina={closeInfoModal}
                    onFinalizar={closeInfoModal}
                    clienteEmpresa={null}
                    oficinaPrincipal={null}
                    tipoGestionPagos={null}
                />
            )}

            {/* Modal de Person para mostrar información de Contable/Responsable */}
            {showPersonModal && selectedPerson && (
                <Person
                    user={selectedPerson}
                    isOpen={showPersonModal}
                    onClose={closePersonModal}
                    title={personModalTitle}
                    showButtons={true}
                />
            )}
        </div>
    )
}

export default GestionarOficinasClienteEmpresa;
