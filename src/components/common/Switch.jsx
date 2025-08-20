import React from 'react';
import styles from './Switch.module.css';

const Switch = ({ 
    checked = false, 
    onChange, 
    disabled = false,
    className = '',
    size = 'medium', // small, medium, large
    showLabels = false, // Mostrar texto true/false
    trueLabel = "ON", // Texto para estado true
    falseLabel = "OFF" // Texto para estado false
}) => {
    const handleToggle = () => {
        if (!disabled && onChange) {
            onChange(!checked);
        }
    };

    return (
        <div className={`${styles.switchContainer} ${className}`}>
            {showLabels && (
                <span className={`${styles.label} ${styles.falseLabel} ${checked ? styles.hidden : ''}`}>
                    {falseLabel}
                </span>
            )}
            
            <button
                type="button"
                className={`${styles.switch} ${styles[size]} ${checked ? styles.checked : ''} ${disabled ? styles.disabled : ''}`}
                onClick={handleToggle}
                disabled={disabled}
                role="switch"
                aria-checked={checked}
            >
                <div className={styles.slider} />
            </button>
            
            {showLabels && (
                <span className={`${styles.label} ${styles.trueLabel} ${!checked ? styles.hidden : ''}`}>
                    {trueLabel}
                </span>
            )}
        </div>
    );
};

export default Switch;
