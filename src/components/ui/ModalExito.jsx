import styles from "./ModalExito.module.css";
import Boton from "../common/Boton";
import { FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle, FaExclamationCircle, FaPlus, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";

function ModalExito({
    clienteEmpresa,
    oficinaPrincipal,
    tipoGestionPagos,
    onClose,
    onAgregarOficina,
    onFinalizar,
    type = "success",
    title,
    message,
    showButtons = true,
    errorDetails,
    customButtons,
    icon,
    // Nuevas props para personalización completa
    customIcon,
    customTitle,
    customMessage,
    additionalContent,
    extraContent,
    customButtonConfig,
    showCloseButton = true,
    modalClassName,
    styleCustom,
    customColor,
    buttonLoading = false,
    showOverlay = false,
}) {
    // Configuración según el tipo de modal
    const getModalConfig = () => {
        switch (type) {
            case "error":
                return {
                    icon: FaExclamationCircle,
                    title: title || "¡Error!",
                    message: message || "Ha ocurrido un error en el proceso.",
                    className: styles.modalError
                };
            case "warning":
                return {
                    icon: FaExclamationTriangle,
                    title: title || "¡Advertencia!",
                    message: message || "Hay algo que debes considerar.",
                    className: styles.modalWarning
                };
            case "duplicate":
                return {
                    icon: FaInfoCircle,
                    title: title || "Datos Duplicados Detectados",
                    message: message || "Se encontraron datos que ya existen en el sistema. ¿Deseas continuar al siguiente paso o corregir los datos?",
                    className: styles.modalInfo
                };
            case "delete":
                return {
                    icon: FaTrash,
                    title: title || "Confirmar Eliminación",
                    message: message || "¿Estás seguro de que quieres eliminar este elemento?",
                    className: styles.modalDelete
                };
            case "info":
                return {
                    icon: FaInfoCircle,
                    title: title || "Información",
                    message: message || "Información importante.",
                    className: styles.modalInfo
                };
            case "success-generico":
                return {
                    icon: FaCheck,
                    title: title || "¡Éxito!",
                    message: message || "Operación completada exitosamente.",
                    className: styles.modalSuccess
                };
            case "personalizar":
                return {
                    icon: icon || FaInfoCircle,
                    title: title || "Modal Personalizado",
                    message: message,
                    className: modalClassName || styles.modalInfo,
                    customColor: customColor
                };
            default:
                return {
                    icon: FaCheck,
                    title: title || "¡Registro exitoso!",
                    message: message || "El Cliente Empresa y Oficina Principal han sido registrados correctamente.",
                    className: styles.modalSuccess
                };
        }
    };

    const config = getModalConfig();
    const IconComponent = config.icon;

    // Renderizar botones personalizados si se proporcionan
    const renderCustomButtons = () => {
        if (customButtons) {
            return (
                <div className={styles.modalExitoButtons}>
                    {customButtons}
                </div>
            );
        }
        return null;
    };

    // Renderizar botones por defecto según el tipo
    const renderDefaultButtons = () => {
        if (type === "success") {
            return (
                <div className={styles.modalExitoButtons}>
                    <Boton
                        label="Oficina"
                        onClick={onAgregarOficina}
                        type="button"
                        disabled={false}
                        tipo="blueButton"
                        icon={<FaPlus />}
                        style={{ display: buttonLoading ? 'none' : 'block' }}
                    />
                    <Boton
                        label="Finalizar"
                        onClick={onFinalizar}
                        type="button"
                        disabled={false}
                        tipo="greenButton"
                        icon={<FaCheck />}
                        loading={buttonLoading}
                    />
                </div>
            );
        }

        if (type === "warning") {
            return (
                <div className={styles.modalExitoButtons}>
                    <Boton
                        label="Cancelar"
                        onClick={onClose}
                        type="button"
                        disabled={false}
                        tipo="grayButton"
                        icon={<FaTimes />}
                    />
                    <Boton
                        label="Confirmar"
                        onClick={onFinalizar}
                        type="button"
                        disabled={false}
                        tipo="orangeButton"
                        icon={<FaExclamationTriangle />}
                    />
                </div>
            );
        }

        if (type === "delete") {
            return (
                <div className={styles.modalExitoButtons}>
                    <Boton
                        label="Cancelar"
                        onClick={onClose}
                        type="button"
                        disabled={false}
                        tipo="grayButton"
                        icon={<FaTimes />}
                        style={buttonLoading ? 'disabledButton' : ''}
                    />
                    <Boton
                        label="Si, Eliminar"
                        onClick={onFinalizar}
                        type="button"
                        disabled={false}
                        tipo="redButton"
                        icon={<FaTrash />}
                        loading={buttonLoading}
                    />
                </div>
            );
        }

        if (type === "duplicate") {
            return (
                <div className={styles.modalExitoButtons}>
                    <Boton
                        label="Cancelar"
                        onClick={onClose}
                        type="button"
                        disabled={false}
                        tipo="grayButton"
                        icon={<FaTimes />}
                    />
                    <Boton
                        label="Continuar"
                        onClick={onFinalizar}
                        type="button"
                        disabled={false}
                        tipo="blueButton"
                        icon={<FaCheck />}
                    />
                </div>
            );
        }

        // Para tipos informativos (error, info) solo mostrar un botón
        if (type === "error" || type === "info") {
            return (
                <div className={styles.modalExitoButtons}>
                    <Boton
                        label="Aceptar"
                        onClick={onClose}
                        type="button"
                        disabled={false}
                        tipo={type === "error" ? "redButton" : "blueButton"}
                        icon={<FaCheck />}
                    />
                </div>
            );
        }

        // Para success-generico mostrar botón Finalizar para salir de editar
        if (type === "success-generico") {
            return (
                <div className={styles.modalExitoButtons}>
                    <Boton
                        label="Finalizar"
                        onClick={onFinalizar}
                        type="button"
                        disabled={false}
                        tipo="greenButton"
                        icon={<FaCheck />}
                    />
                </div>
            );
        }
        if (type === "personalizar") {
            if (customButtonConfig && customButtonConfig.length > 0) {
                return (
                    <div className={styles.modalExitoButtons}>
                        {customButtonConfig.map((button, index) => (
                            <Boton
                                key={index}
                                label={button.label}
                                onClick={button.onClick}
                                type="button"
                                tipo={button.tipo}
                                icon={button.icon}
                                loading={button.buttonLoading}
                            />
                        ))}
                    </div>
                );
            }
        }
        return null;
    };


    return (

        <div className={styles.modalExitoContainer}>

            <div className={`${styles.modalExitoContent} ${styles.modalExitoShow} ${config.className}`} style={styleCustom}>
                <div className={styles.overlayModal} style={{ display: showOverlay ? 'block' : 'none' }}></div>
                <div className={styles.modalExitoIcon} style={config.customColor ? { color: config.customColor } : {}}>
                    <IconComponent size={24} />
                </div>
                <h2 className={styles.modalExitoTitle} style={config.customColor ? { color: config.customColor } : {}}>{config.title}</h2>
                <p className={styles.modalExitoText} style={config.customColor ? { color: config.customColor } : {}}>{config.message}</p>

                {/* Mostrar detalles adicionales del error si están disponibles */}
                {type === "error" && errorDetails && (
                    <div className={styles.modalErrorDetails}>
                        <p className={styles.modalErrorDetail}>
                            <strong>Código de Error:</strong> {errorDetails.errorCode || 'N/A'}
                        </p>
                        {errorDetails.errorType && (
                            <p className={styles.modalErrorDetail}>
                                <strong>Tipo de Error:</strong> {errorDetails.errorType}
                            </p>
                        )}
                        {errorDetails.errorConstraint && (
                            <p className={styles.modalErrorDetail}>
                                <strong>Restricción:</strong> {errorDetails.errorConstraint}
                            </p>
                        )}
                        {errorDetails.errorDetail && (
                            <p className={styles.modalErrorDetail}>
                                <strong>Detalle:</strong> {errorDetails.errorDetail}
                            </p>
                        )}
                    </div>
                )}

                {/* Solo mostrar la lista si es tipo success */}
                {type === "success" && (
                    <ul className={styles.modalExitoList}>
                        <li>
                            <FaCheck className={styles.modalExitoIconList} />
                            Cliente Empresa: <span>{clienteEmpresa?.nombreEmpresa || 'N/A'}</span>
                        </li>
                        <li>
                            <FaCheck className={styles.modalExitoIconList} />
                            Oficina Principal: <span>{oficinaPrincipal?.nombreOficina || 'N/A'}</span>
                        </li>
                        <li>
                            <FaCheck className={styles.modalExitoIconList} />
                            Tipo de gestión de pagos: <span>{tipoGestionPagos?.pagoSeleccionado === 'centralizado' ? 'Centralizado' : 'No Centralizado'}</span>
                        </li>
                    </ul>
                )}

                {type === "success" && (
                    <p className={styles.modalExitoText}>¿Desea agregar otra oficina?</p>
                )}

                {/* Contenido adicional personalizable */}
                {(type === "completamente-personalizable" || type === "personalizar") && additionalContent && (
                    <div className={styles.modalAdditionalContent}>
                        {additionalContent}
                    </div>
                )}

                {/* Contenido extra personalizable */}
                {(type === "completamente-personalizable" || type === "personalizar") && extraContent && (
                    <div className={styles.modalExtraContent}>
                        {extraContent}
                    </div>
                )}

                {/* Renderizar botones */}
                {showButtons && (renderCustomButtons() || renderDefaultButtons())}

                {/* Botón de cerrar opcional */}
                {showCloseButton && (
                    <Boton
                        label={<FaTimes />}
                        onClick={onClose}
                        type="button"
                        disabled={false}
                        tipo="closeButton"
                        className={styles.modalExitoCloseButton}
                    />
                )}
            </div>
        </div>
    )
}

export default ModalExito;