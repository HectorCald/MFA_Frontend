import { useState, useRef, useEffect } from "react";
import styles from "./Select.module.css";
import MensajeError from "./MensajeError";
function Select({ label, id, options, required, onChange, value, placeholder = "Seleccionar...", errorMessage, readOnly }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(
        options.find(option => option.value === value) || null
    );

    const selectRef = useRef(null);

    // Cerrar dropdown cuando se hace click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Actualizar selectedOption cuando cambia el value prop
    useEffect(() => {
        const option = options.find(option => option.value === value);
        setSelectedOption(option || null);
    }, [value, options]);

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
        setIsOpen(false);
        onChange({ target: { value: option.value } });
    };

    const handleSelectClick = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={styles.selectContainer} ref={selectRef}>
            <label htmlFor={label}>{label} {required && <span className={styles.required}>*</span>}</label>
            <div className={styles.selectWrapper}>
                <div
                    className={styles.selectDisplay}
                    onClick={readOnly ? undefined : handleSelectClick}
                    style={{ border: errorMessage ? '2px solid red' : '', ...(readOnly ? { color: "gray", focus: "none", pointerEvents: "none" } : {}) }}
                >
                    <span className={styles.selectValue} style={readOnly ? { color: "gray", focus: "none", pointerEvents: "none" } : {}}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <div className={`${styles.selectArrow} ${isOpen ? styles.rotated : ''}`}>
                        ▼
                    </div>
                </div>
                <input
                    type="hidden"
                    id={id}
                    value={selectedOption ? selectedOption.value : ""}
                    required={required}
                    readOnly={readOnly}
                    style={readOnly ? { color: "gray", focus: "none", pointerEvents: "none" } : {}}
                />
                {errorMessage ? <MensajeError mensaje="Este campo es requerido" /> : null}
                {isOpen && !readOnly &&     (
                    <div className={styles.dropdownList}>
                        {options.map((option) => (
                            <div
                                key={option.value}
                                className={`${styles.dropdownItem} ${selectedOption?.value === option.value ? styles.selected : ''
                                    }`}
                                onClick={() => handleOptionSelect(option)}
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Select;