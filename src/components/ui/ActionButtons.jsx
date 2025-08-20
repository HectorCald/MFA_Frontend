import { BoxIcon } from 'boxicons-react';
import styles from "./ActionButtons.module.css";

function ActionButtons({
    tipo = "cliente",
    onInfo,
    onEdit,
    onDelete,
    onBuild,
    onConfig,
    onContable,
    onResponsable,
    showContable = true
}) {
    // Configuración para gestión de usuarios
    if (tipo === "gestionUsuarios") {
        return (
            <div className={styles.actionButtons}>
                <button
                    className={`${styles.actionButton} ${styles.infoButton}`}
                    onClick={onInfo}
                    title="Ver información"
                >
                    <BoxIcon name="info-circle" className={styles.icon}/>
                </button>
                <button
                    className={`${styles.actionButton} ${styles.editButton}`}
                    onClick={onEdit}
                    title="Editar"
                >
                    <BoxIcon name="edit" className={styles.icon}/>
                </button>
                <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={onDelete}
                    title="Eliminar"
                >
                    <BoxIcon name="trash" className={styles.icon}/>
                </button>
            </div>
        );
    }

    // Configuración para cliente empresa
    if (tipo === "cliente") {
        return (
            <div className={styles.actionButtons}>
                <button
                    className={`${styles.actionButton} ${styles.infoButton}`}
                    onClick={onInfo}
                    title="Ver información"
                >
                    <BoxIcon name="info-circle" className={styles.icon}/>
                </button>
                <button
                    className={`${styles.actionButton} ${styles.editButton}`}
                    onClick={onEdit}
                    title="Editar"
                >
                    <BoxIcon name="edit" className={styles.icon}/>
                </button>
                <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={onDelete}
                    title="Eliminar"
                >
                    <BoxIcon name="trash" className={styles.icon}/>
                </button>
                <button
                    className={`${styles.actionButton} ${styles.buildButton}`}
                    onClick={onBuild}
                    title="Gestionar oficinas"
                >
                    <BoxIcon name="building" className={styles.icon}/>
                </button>
                <button
                    className={`${styles.actionButton} ${styles.configButton}`}
                    onClick={onConfig}
                    title="Configuración"
                >
                    <BoxIcon name="cog" className={styles.icon}/>
                </button>
            </div>
        );
    }

    // Configuración para oficina
    if (tipo === "oficina") {
        return (
            <div className={styles.actionButtons}>
                <button
                    className={`${styles.actionButton} ${styles.infoButton}`}
                    onClick={onInfo}
                    title="Ver información"
                >
                    <BoxIcon name="info-circle" className={styles.icon}/>
                </button>
                <button
                    className={`${styles.actionButton} ${styles.editButton}`}
                    onClick={onEdit}
                    title="Editar"
                >
                    <BoxIcon name="edit" className={styles.icon}/>
                </button>
                <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={onDelete}
                    title="Eliminar"
                >
                    <BoxIcon name="trash" className={styles.icon}/>
                </button>
                {showContable && (
                    <button
                        className={`${styles.actionButton} ${styles.buildButton}`}
                        onClick={onContable}
                        title="Contable"
                    >
                        <BoxIcon name="user" className={styles.icon}/>
                    </button>
                )}
                <button
                    className={`${styles.actionButton} ${styles.configButton}`}
                    onClick={onResponsable}
                    title="Responsable"
                >
                    <BoxIcon name="user-check" className={styles.icon}/>
                </button>
            </div>
        );
    }

    // Configuración por defecto (cliente)
    return (
        <div className={styles.actionButtons}>
            <button
                className={`${styles.actionButton} ${styles.infoButton}`}
                onClick={onInfo}
                title="Ver información"
            >
                <BoxIcon name="info-circle" className={styles.icon}/>
            </button>
            <button
                className={`${styles.actionButton} ${styles.editButton}`}
                onClick={onEdit}
                title="Editar"
            >
                <BoxIcon name="edit" className={styles.icon}/>
            </button>
            <button
                className={`${styles.actionButton} ${styles.deleteButton}`}
                onClick={onDelete}
                title="Eliminar"
            >
                <BoxIcon name="trash" className={styles.icon}/>
            </button>
            <button
                className={`${styles.actionButton} ${styles.buildButton}`}
                onClick={onBuild}
                title="Gestionar oficinas"
            >
                <BoxIcon name="building" className={styles.icon}/>
            </button>
            <button
                className={`${styles.actionButton} ${styles.configButton}`}
                onClick={onConfig}
                title="Configuración"
            >
                <BoxIcon name="cog" className={styles.icon}/>
            </button>
        </div>
    );
}

export default ActionButtons;
