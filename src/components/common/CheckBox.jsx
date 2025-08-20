import { useState, useEffect } from "react";
import styles from "./CheckBox.module.css";
import InfoBoton from "./InfoBoton";

function CheckBox(props){
    const { 
        label, 
        id, 
        required, 
        checked = false, 
        onChange,
        options = [], // Array de opciones para múltiples checkboxes
        groupLabel = "", // Label para el grupo
        groupId = "", // ID para el grupo
        multiple = false, // Prop para definir si es selección múltiple o única
        value = "", // Valor inicial para el grupo
        readOnly = false,
        info,
    } = props;

    const [showInfo, setShowInfo] = useState(false);
    
    const [isChecked, setIsChecked] = useState(checked);
    const [selectedOptions, setSelectedOptions] = useState(
        value ? [value] : []
    );
    
    // Sincronizar selectedOptions con el value prop
    useEffect(() => {
        if (value) {
            setSelectedOptions([value]);
        } else {
            setSelectedOptions([]);
        }
    }, [value]);
    
    // Si hay opciones, renderizar múltiples checkboxes
    if (options.length > 0) {
        const handleOptionChange = (optionValue, isSelected) => {
            let newSelectedOptions;
            
            if (multiple) {
                // Selección múltiple: agregar o remover opciones
                if (isSelected) {
                    newSelectedOptions = [...selectedOptions, optionValue];
                } else {
                    newSelectedOptions = selectedOptions.filter(option => option !== optionValue);
                }
            } else {
                // Selección única: solo una opción seleccionada
                if (isSelected) {
                    newSelectedOptions = [optionValue];
                } else {
                    newSelectedOptions = [];
                }
            }
            
            setSelectedOptions(newSelectedOptions);
            
            if (onChange) {
                onChange({
                    target: {
                        id: groupId,
                        value: multiple ? newSelectedOptions : (newSelectedOptions.length > 0 ? newSelectedOptions[0] : ""),
                        type: 'checkbox-group',
                        multiple: multiple
                    }
                });
            }
        };
        
        return (
            <div className={styles.checkboxGroupContainer}>
                <div className={styles.checkboxGroupInfo}>
                {groupLabel && (
                    <label className={styles.groupLabel}>
                        {groupLabel} {required && <span className={styles.required}>*</span>}
                    </label>
                )}
                    {info && (
                        <InfoBoton info={info} setShowInfo={setShowInfo} showInfo={showInfo} />
                    )}
                </div>
                <div className={styles.checkboxGroup}>
                    {options.map((option, index) => {
                        const isChecked = selectedOptions.includes(option.value);
                        return (
                            <div key={index} className={styles.checkboxContainer}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type={multiple ? "checkbox" : "radio"}
                                        name={groupId} // Para radio buttons, mismo name para el grupo
                                        id={`${groupId}-${index}`}
                                        checked={isChecked}
                                        onChange={(e) => handleOptionChange(option.value, e.target.checked)}
                                        className={styles.checkboxInput}
                                    />
                                <span className={styles.checkmark}></span>
                                <span className={styles.labelText}>
                                    {option.label}
                                </span>
                            </label>
                        </div>
                    );
                })}
                </div>
            </div>
        );
    }
    
    // Checkbox individual (comportamiento original)
    const handleChange = (e) => {
        const newValue = e.target.checked;
        setIsChecked(newValue);
        if (onChange) {
            onChange(e);
        }
    };
    
    return (
        <div className={styles.checkboxContainer}>
            <label className={styles.checkboxLabel}>
                <input
                    type="checkbox"
                    id={id}
                    checked={isChecked}
                    onChange={handleChange}
                    className={styles.checkboxInput}
                />
                <span className={styles.checkmark}></span>
                <span className={styles.labelText}>
                    {label} {required && <span className={styles.required}>*</span>}
                </span>
            </label>
        </div>
    );
}

export default CheckBox;