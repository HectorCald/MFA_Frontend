import React, { useState, useRef, useEffect } from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import styles from './MenuPuntos.module.css';

const MenuPuntos = ({ opciones = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuDirection, setMenuDirection] = useState('down'); // 'down' o 'up'
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleMenu = () => {
        if (!isOpen) {
            // Calcular dirección del menú antes de abrirlo
            calculateMenuDirection();
        }
        setIsOpen(!isOpen);
    };

    const calculateMenuDirection = () => {
        if (buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const menuHeight = 200; // Altura estimada del menú (ajusta según necesites)
            
            // Si hay espacio abajo, menú hacia abajo; si no, hacia arriba
            if (buttonRect.bottom + menuHeight <= windowHeight) {
                setMenuDirection('down');
            } else {
                setMenuDirection('up');
            }
        }
    };

    const handleOptionClick = (opcion) => {
        if (opcion.onClick) {
            opcion.onClick();
        }
        if (opcion.navigate) {
            window.location.href = opcion.navigate;
        }
        setIsOpen(false);
    };

    return (
        <div className={styles.container} ref={menuRef}>
            <button 
                ref={buttonRef}
                className={styles.botonPuntos} 
                onClick={toggleMenu}
                type="button"
                aria-label="Menú de opciones"
            >
                <FaEllipsisV />
            </button>
            
            {isOpen && (
                <div className={`${styles.menu} ${styles[`menu${menuDirection === 'up' ? 'Up' : 'Down'}`]}`}>
                    {opciones.map((opcion, index) => (
                        <button
                            key={index}
                            className={styles.opcion}
                            onClick={() => handleOptionClick(opcion)}
                            type="button"
                        >
                            {opcion.icono && (
                                <span className={styles.icono}>{opcion.icono}</span>
                            )}
                            <span>{opcion.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MenuPuntos;
