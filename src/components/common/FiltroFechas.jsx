import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';
import styles from './FiltroFechas.module.css';
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import es from 'date-fns/locale/es';

// Registrar el idioma español
registerLocale('es', es);

const FiltroFechas = ({ 
    onFiltroChange, 
    placeholder = "Filtrar por fechas",
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);

    const handleFechaDesdeChange = (fecha) => {
        setFechaInicio(fecha);
        if (fecha && fechaFin && fecha <= fechaFin) {
            onFiltroChange({ desde: fecha, hasta: fechaFin });
        }
    };

    const handleFechaHastaChange = (fecha) => {
        setFechaFin(fecha);
        if (fecha && fechaInicio && fecha >= fechaInicio) {
            onFiltroChange({ desde: fechaInicio, hasta: fecha });
        }
    };

    const limpiarFiltro = () => {
        setFechaInicio(null);
        setFechaFin(null);
        onFiltroChange({ desde: null, hasta: null });
        setIsOpen(false);
    };

    const aplicarFiltro = () => {
        if (fechaInicio && fechaFin) {
            onFiltroChange({ desde: fechaInicio, hasta: fechaFin });
            setIsOpen(false);
        }
    };

    return (
        <div className={`${styles.filtroContainer} ${className}`}>
            <button
                className={styles.botonFiltro}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <FaCalendarAlt className={styles.icono} />
                <span className={styles.textoBoton}>{placeholder}</span>
            </button>

            {isOpen && (
                <div className={styles.calendarioContainer}>
                    <div className={styles.calendarioHeader}>
                        <h4>Seleccionar rango</h4>
                        <button
                            className={styles.botonCerrar}
                            onClick={() => setIsOpen(false)}
                            type="button"
                        >
                            ×
                        </button>
                    </div>

                    <div className={styles.calendariosWrapper}>
                        <div className={styles.calendarioItem}>
                            <label>Desde:</label>
                            <DatePicker
                                selected={fechaInicio}
                                onChange={handleFechaDesdeChange}
                                selectsStart
                                startDate={fechaInicio}
                                endDate={fechaFin}
                                maxDate={fechaFin}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Seleccionar fecha"
                                className={styles.inputFecha}
                                showPopperArrow={false}
                                locale="es"
                            />
                        </div>

                        <div className={styles.calendarioItem}>
                            <label>Hasta:</label>
                            <DatePicker
                                selected={fechaFin}
                                onChange={handleFechaHastaChange}
                                selectsEnd
                                startDate={fechaInicio}
                                endDate={fechaFin}
                                minDate={fechaInicio}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Seleccionar fecha"
                                className={styles.inputFecha}
                                showPopperArrow={false}
                                locale="es"
                            />
                        </div>
                    </div>

                    <div className={styles.botonesAccion}>
                        <button
                            className={styles.botonLimpiar}
                            onClick={limpiarFiltro}
                            type="button"
                        >
                            Limpiar
                        </button>
                        <button
                            className={styles.botonAplicar}
                            onClick={aplicarFiltro}
                            type="button"
                            disabled={!fechaInicio || !fechaFin}
                        >
                            Aplicar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FiltroFechas;
