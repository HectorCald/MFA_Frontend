import React from "react";
import styles from "./Person.module.css";
import Boton from "../common/Boton";
import { FaUser, FaTimes, FaEnvelope, FaCalendar, FaPhone, FaIdCard, FaMapMarkerAlt, FaVenusMars } from "react-icons/fa";

function Person({ 
    user,
    isOpen,
    onClose,
    title = "Información de Usuario",
    showButtons = false,
    customButtons
}) {
    if (!isOpen) return null;

    // Función para formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return 'Fecha inválida';
        }
    };

    // Renderizar botones personalizados si se proporcionan
    const renderCustomButtons = () => {
        if (customButtons) {
            return (
                <div className={styles.personButtons}>
                    {customButtons}
                </div>
            );
        }
        return null;
    };

    return (
        <div className={styles.personContainer}>
            <div className={`${styles.personContent} ${styles.personShow}`}>
                {/* Header del modal - igual al de ModalExito */}
                <div className={styles.personIcon}>
                    <FaUser size={24} />
                </div>
                <h2 className={styles.personTitle}>{title}</h2>

                {/* Información del usuario - compacta */}
                <div className={styles.personInfo}>
                    {/* Información personal */}
                    <div className={styles.infoSection}>
                        <h3 className={styles.sectionTitle}>Información Personal</h3>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Nombre:</span>
                                <span className={styles.infoValue}>{user?.first_name || 'N/A'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Apellido:</span>
                                <span className={styles.infoValue}>{user?.last_name || 'N/A'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>DNI/CI:</span>
                                <span className={styles.infoValue}>
                                    <FaIdCard className={styles.infoIcon} />
                                    {user?.dni || 'N/A'}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Género:</span>
                                <span className={styles.infoValue}>
                                    <FaVenusMars className={styles.infoIcon} />
                                    {user?.gender === 'M' ? 'Masculino' : user?.gender === 'F' ? 'Femenino' : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Información de contacto */}
                    <div className={styles.infoSection}>
                        <h3 className={styles.sectionTitle}>Información de Contacto</h3>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Email:</span>
                                <span className={styles.infoValue}>
                                    <FaEnvelope className={styles.infoIcon} />
                                    {user?.email || 'N/A'}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Teléfono:</span>
                                <span className={styles.infoValue}>
                                    <FaPhone className={styles.infoIcon} />
                                    {user?.cellphone || user?.phone || 'N/A'}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Dirección:</span>
                                <span className={styles.infoValue}>
                                    <FaMapMarkerAlt className={styles.infoIcon} />
                                    {user?.address || 'N/A'}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Código Postal:</span>
                                <span className={styles.infoValue}>{user?.postal_code || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Información adicional */}
                    <div className={styles.infoSection}>
                        <h3 className={styles.sectionTitle}>Información Adicional</h3>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Fecha de Nacimiento:</span>
                                <span className={styles.infoValue}>
                                    <FaCalendar className={styles.infoIcon} />
                                    {formatDate(user?.birthdate)}
                                </span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>País:</span>
                                <span className={styles.infoValue}>{user?.country_name || 'N/A'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Ciudad:</span>
                                <span className={styles.infoValue}>{user?.city_name || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botones */}
                {showButtons && (renderCustomButtons() || (
                    <div className={styles.personButtons}>
                        <Boton
                            label="Cerrar"
                            onClick={onClose}
                            type="button"
                            disabled={false}
                            tipo="blueButton"
                            icon={<FaTimes />}
                        />
                    </div>
                ))}

                {/* Botón de cerrar */}
                <Boton
                    label={<FaTimes />}
                    onClick={onClose}
                    type="button"
                    disabled={false}
                    tipo="closeButton"
                    className={styles.personCloseButton}
                />
            </div>
        </div>
    );
}

export default Person;


