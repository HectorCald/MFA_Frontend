import { useState, useEffect } from "react";
import styles from "./SingleCheckBox.module.css";
import InfoBoton from "./InfoBoton";
import { FaCheck } from "react-icons/fa";

function SingleCheckBox(props) {
    const { 
        label, 
        id, 
        required = false, 
        checked = false, 
        onChange,
        readOnly = false,
        info,
        disabled = false,
        className = ""
    } = props;

    const [showInfo, setShowInfo] = useState(false);
    const [isChecked, setIsChecked] = useState(checked);
    
    // Sincronizar estado interno con prop checked
    useEffect(() => {
        setIsChecked(checked);
    }, [checked]);
    
    const handleChange = (e) => {
        if (readOnly || disabled) return;
        
        const newValue = e.target.checked;
        setIsChecked(newValue);
        
        if (onChange) {
            // Siempre pasar el valor booleano para mayor compatibilidad
            onChange(newValue);
        }
    };

    const getCheckboxClasses = () => {
        const baseClasses = [
            styles.checkboxContainer,
            className
        ];
        
        if (disabled) baseClasses.push(styles.disabled);
        if (readOnly) baseClasses.push(styles.readOnly);
        
        return baseClasses.filter(Boolean).join(' ');
    };

    return (
        <div className={getCheckboxClasses()}>
            <div className={styles.checkboxWrapper}>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        id={id}
                        checked={isChecked}
                        onChange={handleChange}
                        disabled={disabled || readOnly}
                        className={styles.checkboxInput}
                        readOnly={readOnly}
                    />
                    
                    <span className={styles.checkmark}>
                        <span className={styles.checkIcon}><FaCheck/></span>
                    </span>
                    
                    <span className={styles.labelText}>
                        {label} {required && <span className={styles.required}>*</span>}
                    </span>
                </label>
                
                {info && (
                    <InfoBoton 
                        info={info} 
                        setShowInfo={setShowInfo} 
                        showInfo={showInfo} 
                    />
                )}
            </div>
        </div>
    );
}

export default SingleCheckBox;
