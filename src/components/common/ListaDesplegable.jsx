import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styles from './ListaDesplegable.module.css';

const ListaDesplegable = ({ 
    titulo, 
    children, 
    isOpen = false, 
    onToggle,
    className = '',
    headerClassName = '',
    contentClassName = ''
}) => {
    const [isExpanded, setIsExpanded] = useState(isOpen);

    const handleToggle = () => {
        const newState = !isExpanded;
        setIsExpanded(newState);
        if (onToggle) {
            onToggle(newState);
        }
    };

    return (
        <div className={`${styles.container} ${className}`}>
            <div 
                className={`${styles.header} ${headerClassName}`}
                onClick={handleToggle}
            >
                <h3 className={styles.titulo}>{titulo}</h3>
                <div className={styles.iconContainer}>
                    {isExpanded ? (
                        <FaChevronUp className={styles.icon} />
                    ) : (
                        <FaChevronDown className={styles.icon} />
                    )}
                </div>
            </div>
            
            <div className={`${styles.content} ${contentClassName} ${isExpanded ? styles.expanded : ''}`}>
                {children}
            </div>
        </div>
    );
};

export default ListaDesplegable;
