import styles from "./GestionarClienteEmpresa.module.css";
import Fondo from "../../components/common/Fondo";
import logo from "../../assets/logo-MFA.png";
import Boton from "../../components/common/Boton";
import { FaPlus } from "react-icons/fa";
import InputSearch from "../../components/common/InputSearch";
import Table from "../../components/ui/Table";
import ActionButtons from "../../components/ui/ActionButtons";
import ModalExito from "../../components/ui/ModalExito";
import { useState, useEffect } from "react";
import BusinessClientRegistrationService from "../../services/businessClientRegistrationService";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/ui/nav";

function GestionarClienteEmpresa() {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchBlocks, setSearchBlocks] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deletedClientInfo, setDeletedClientInfo] = useState(null);

    useEffect(() => {
        loadBusinessClients();
    }, []);

    const loadBusinessClients = async () => {
        try {
            setLoading(true);
            const response = await BusinessClientRegistrationService.getAllBusinessClients();
            setClients(response);
        } catch (error) {
            console.error('Error loading business clients:', error);
            setError('Error al cargar los clientes empresariales');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getPaymentStatus = (centralizedPayment) => {
        return centralizedPayment ? 'Centralizado' : 'Descentralizado';
    };

    const getStatusText = (client) => {
        return 'Activo';
    };

    // Funciones para los botones de acciones
    const handleInfo = (client) => {
        console.log('Ver información del cliente:', client);
        alert(`Información del cliente: ${client.name}`);
    };

    const handleEdit = (client) => {
        console.log('Editar cliente:', client);
        // Navegar a la página de editar con el ID del cliente
        navigate(`/gestionar-cliente-empresa/editar-cliente-empresa/${client.id}`);
    };

    const handleDelete = (client) => {
        console.log('Confirmar eliminación del cliente:', client);
        setClientToDelete(client);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!clientToDelete) return;

        try {
            setDeleteLoading(true);
            const response = await BusinessClientRegistrationService.deleteBusinessClient(clientToDelete.id);

            // Guardar información del cliente eliminado para el modal de éxito
            setDeletedClientInfo({
                name: clientToDelete.name,
                code: clientToDelete.code,
                offices: clientToDelete.office_count || 0
            });

            // Recargar la lista de clientes
            await loadBusinessClients();
            setShowDeleteModal(false);
            setClientToDelete(null);

            // Mostrar modal de éxito
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error deleting client:', error);

            // Mostrar mensaje de error más específico
            let errorMessage = 'Error al eliminar el cliente';
            if (error.message.includes('No se puede eliminar el cliente porque tiene datos asociados')) {
                errorMessage = 'No se puede eliminar este cliente porque tiene datos asociados que no se pueden eliminar. Contacte al administrador del sistema.';
            } else if (error.message.includes('Error de restricción única')) {
                errorMessage = 'Error de restricción única al eliminar el cliente. Contacte al administrador del sistema.';
            } else if (error.message.includes('Error interno del servidor')) {
                errorMessage = 'Error interno del servidor. Por favor, intente nuevamente o contacte al administrador del sistema.';
            } else {
                errorMessage = `Error al eliminar el cliente: ${error.message}`;
            }

            alert(errorMessage);
        } finally {
            setDeleteLoading(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setClientToDelete(null);
    };

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        setDeletedClientInfo(null);
    };

    const handleBuild = (client) => {
        console.log('Gestionar oficinas del cliente:', client);
        // Navegar a la página de gestión de oficinas con el ID del cliente
        navigate(`/gestionar-cliente-empresa/gestionar-oficinas/${client.id}`);
    };

    const handleConfig = (client) => {
        console.log('Configuración del cliente:', client);
        alert(`Configuración de: ${client.name}`);
    };

    // Función para filtrar clientes basada en bloques de búsqueda
    const filterClientsByBlocks = (clients, blocks) => {
        if (blocks.length === 0) return clients;

        return clients.filter(client => {
            const clientData = {
                name: client.name?.toLowerCase() || '',
                code: client.code?.toLowerCase() || '',
                payment: getPaymentStatus(client.centralized_payment).toLowerCase(),
                status: getStatusText(client).toLowerCase(),
                country: client.country_name?.toLowerCase() || '',
                gerente: client.gerente_general?.toLowerCase() || '',
                offices: (client.office_count || 0).toString()
            };

            return blocks.every(block => {
                const blockLower = block.toLowerCase();
                return Object.values(clientData).some(value =>
                    value.includes(blockLower)
                );
            });
        });
    };

    const filteredClients = filterClientsByBlocks(clients, searchBlocks);

    const tableData = filteredClients.map((client, index) => [
        index + 1,
        client.name || 'N/A',
        getStatusText(client),
        formatDate(client.created_at),
        client.country_name || 'N/A',
        client.office_count || 0,
        getPaymentStatus(client.centralized_payment),
        client.gerente_general || 'N/A',
        <ActionButtons
            onInfo={() => handleInfo(client)}
            onEdit={() => handleEdit(client)}
            onDelete={() => handleDelete(client)}
            onBuild={() => handleBuild(client)}
            onConfig={() => handleConfig(client)}
        />
    ]);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchBlocks = (blocks) => {
        setSearchBlocks(blocks);
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <Fondo />
                <div className={styles.content}>
                    <img src={logo} className={styles.logo} alt="logo" />
                    <h1 className={styles.title}>Panel Administrativo de Cliente Empresa</h1>
                    <div className={styles.loading}>
                        Cargando clientes...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <Fondo />
                <div className={styles.content}>
                    <img src={logo} className={styles.logo} alt="logo" />
                    <h1 className={styles.title}>Panel Administrativo de Cliente Empresa</h1>
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
                <h1 className={styles.title}>Panel Administrativo - Clientes Empresa</h1>
                <div className={styles.searchContainer}>
                    <InputSearch
                        placeholder="Buscar"
                        value={searchTerm}
                        onChange={handleSearch}
                        onSearchBlocks={handleSearchBlocks}
                        info="Buscar por nombre, apellido, email, teléfono, cédula, ciudad, país, gerente general, etc. (Presiona la lupa para buscar o haz doble espacio para agregar más filtros)"
                    />
                    <Boton
                        label="Agregar cliente"
                        onClick={() => {
                            navigate('/gestionar-cliente-empresa/agregar-cliente-empresa');
                        }}
                        type="button"
                        disabled={false}
                        tipo="blueButton"
                        icon={<FaPlus />}
                    />
                </div>
                <div className={styles.tableContainer}>
                    <Table
                        headers={["Nº", "Nombre", "Estado", "Fecha de Aniversario", "Pais", "Oficinas", "Pago", "Gerente general", "Acciones"]}
                        data={tableData}
                    />
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            {showDeleteModal && clientToDelete && (
                <ModalExito
                    type="delete"
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que quieres eliminar el Cliente Empresa "${clientToDelete.name}"? Esta acción no se puede deshacer y se perderán todos los datos asociados(Oficinas, Gerente, Contactos, etc.).`}
                    showButtons={true}
                    onClose={cancelDelete}
                    onAgregarOficina={cancelDelete}
                    onFinalizar={confirmDelete}
                    clienteEmpresa={clientToDelete}
                    oficinaPrincipal={null}
                    tipoGestionPagos={null}
                />
            )}

            {/* Modal de éxito después de eliminar */}
            {showSuccessModal && deletedClientInfo && (
                <ModalExito
                    type="success-generico"
                    title="¡Eliminación Exitosa!"
                    message={`El Cliente Empresa "${deletedClientInfo.name}" ha sido eliminado correctamente junto con todos sus datos asociados.`}
                    showButtons={true}
                    onClose={closeSuccessModal}
                    onAgregarOficina={closeSuccessModal}
                    onFinalizar={closeSuccessModal}
                    clienteEmpresa={null}
                    oficinaPrincipal={null}
                    tipoGestionPagos={null}
                />
            )}
        </div>
    )
}

export default GestionarClienteEmpresa;