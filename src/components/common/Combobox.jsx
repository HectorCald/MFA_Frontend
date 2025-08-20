import { useState, useRef, useEffect } from "react";
import styles from "./Combobox.module.css";
import MensajeError from "./MensajeError";

function Combobox(props) {
    const { label, id, options, value, onChange, placeholder, required, errorMessage, readOnly } = props;
    
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOption, setSelectedOption] = useState(
        options.find(option => option.value === value) || null
    );
    
    const comboboxRef = useRef(null);
    
    // Filtrar opciones basado en el término de búsqueda
    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Cerrar dropdown cuando se hace click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (comboboxRef.current && !comboboxRef.current.contains(event.target)) {
                setIsOpen(false);
                // Mantener el valor seleccionado en lugar de limpiar searchTerm
                if (selectedOption) {
                    setSearchTerm(selectedOption.label.replace(/\b\w/g, l => l.toUpperCase()));
                }
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [selectedOption]);
    
    // Actualizar selectedOption cuando cambia el value prop
    useEffect(() => {
        const option = options.find(option => option.value === value);
        setSelectedOption(option || null);
        if (option) {
            // Capitalizar la primera letra de cada palabra del label
            const capitalizedLabel = option.label.replace(/\b\w/g, l => l.toUpperCase());
            setSearchTerm(capitalizedLabel);
        } else {
            // Si no hay opción (valor vacío), limpiar el searchTerm
            setSearchTerm("");
        }
    }, [value, options]);
    
    const handleOptionSelect = (option) => {
        setSelectedOption(option);
        // Capitalizar la primera letra de cada palabra del label
        const capitalizedLabel = option.label.replace(/\b\w/g, l => l.toUpperCase());
        setSearchTerm(capitalizedLabel);
        setIsOpen(false);
        onChange({ target: { value: option.value } });
    };
    
    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        // Capitalizar la primera letra de cada palabra
        const capitalizedValue = inputValue.replace(/\b\w/g, l => l.toUpperCase());
        setSearchTerm(capitalizedValue);
        setIsOpen(true);
        
        // Si el input está vacío, limpiar la selección
        if (!inputValue) {
            setSelectedOption(null);
            onChange({ target: { value: "" } });
        }
    };
    
    const handleInputClick = () => {
        setIsOpen(!isOpen);
        if (!isOpen && !readOnly) {
            // Solo limpiar searchTerm si no hay opción seleccionada
            if (!selectedOption) {
                setSearchTerm("");
            }
        }
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && filteredOptions.length > 0) {
            handleOptionSelect(filteredOptions[0]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setSearchTerm(selectedOption ? selectedOption.label.replace(/\b\w/g, l => l.toUpperCase()) : "");
        }
    };

    return (
        <div className={styles.comboboxContainer} ref={comboboxRef}>
            <label htmlFor={id}>{label} {required && <span>*</span>}</label>
            <div className={styles.comboboxWrapper}>
                <input
                    type="text"
                    id={id}
                    value={searchTerm}
                    onChange={handleInputChange}
                    onClick={handleInputClick}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={styles.comboboxInput}
                    autoComplete="off"
                    required={required}
                    readOnly={readOnly}
                    style={readOnly ?{ color:  "gray", focus: "none", pointerEvents: "none"} : {}}
                />
                {errorMessage && <MensajeError mensaje="Este campo es requerido" />}
                <div className={styles.comboboxArrow} onClick={handleInputClick}>
                    ▼
                </div>
                
                {isOpen && !readOnly && (
                    <div className={styles.dropdownList}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`${styles.dropdownItem} ${
                                        selectedOption?.value === option.value ? styles.selected : ''
                                    }`}
                                    onClick={() => handleOptionSelect(option)}
                                >
                                    {option.label}
                                </div>
                            ))
                        ) : (
                            <div className={styles.noResults}>
                                No se encontraron resultados
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Combobox;