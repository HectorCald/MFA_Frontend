import { useState, useRef, useEffect } from "react";
import styles from "./InputNumero.module.css";
import MensajeError from "./MensajeError";

function InputNumero({ label, id, required, onChange, value, placeholder, errorMessage, readOnly }) {
    const [selectedCountry, setSelectedCountry] = useState({
        code: "BO",
        name: "Bolivia",
        flag: "🇧🇴",
        dialCode: "+591"
    });
    const [isOpen, setIsOpen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState(value || "");
    
    const inputRef = useRef(null);
    
    // Lista de países con códigos de marcación
    const countryOptions = [
        { code: "BO", name: "Bolivia", flag: "🇧🇴", dialCode: "+591" },
        { code: "AR", name: "Argentina", flag: "🇦🇷", dialCode: "+54" },
        { code: "BR", name: "Brasil", flag: "🇧🇷", dialCode: "+55" },
        { code: "CL", name: "Chile", flag: "🇨🇱", dialCode: "+56" },
        { code: "CO", name: "Colombia", flag: "🇨🇴", dialCode: "+57" },
        { code: "EC", name: "Ecuador", flag: "🇪🇨", dialCode: "+593" },
        { code: "PE", name: "Perú", flag: "🇵🇪", dialCode: "+51" },
        { code: "PY", name: "Paraguay", flag: "🇵🇾", dialCode: "+595" },
        { code: "UY", name: "Uruguay", flag: "🇺🇾", dialCode: "+598" },
        { code: "VE", name: "Venezuela", flag: "🇻🇪", dialCode: "+58" },
        { code: "MX", name: "México", flag: "🇲🇽", dialCode: "+52" },
        { code: "ES", name: "España", flag: "🇪🇸", dialCode: "+34" },
        { code: "US", name: "Estados Unidos", flag: "🇺🇸", dialCode: "+1" }
    ];
    
    // Cerrar dropdown cuando se hace click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Sincronizar el estado interno cuando cambie el prop value
    useEffect(() => {
        if (value) {
            // Buscar el país correspondiente al código de marcación en el valor
            const matchingCountry = countryOptions.find(country => 
                value.startsWith(country.dialCode)
            );
            
            if (matchingCountry) {
                // Actualizar el país seleccionado si es diferente
                if (selectedCountry.code !== matchingCountry.code) {
                    setSelectedCountry(matchingCountry);
                }
                
                // Extraer solo el número del teléfono completo
                const numberOnly = value.replace(matchingCountry.dialCode, '');
                setPhoneNumber(numberOnly);
            } else {
                // Si no encuentra un país, usar el país actual
                const numberOnly = value.replace(selectedCountry.dialCode, '');
                setPhoneNumber(numberOnly);
            }
        } else {
            setPhoneNumber('');
        }
    }, [value, selectedCountry.dialCode, countryOptions]);
    
    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        setIsOpen(false);
        
        // Notificar cambio con el código de país y número
        const fullNumber = `${country.dialCode}${phoneNumber}`;
        onChange({ 
            target: { 
                value: fullNumber,
                countryCode: country.code,
                dialCode: country.dialCode
            } 
        });
    };
    
    const handlePhoneChange = (e) => {
        const number = e.target.value;
        setPhoneNumber(number);
        
        // Notificar cambio con el código de país y número
        const fullNumber = `${selectedCountry.dialCode}${number}`;
        onChange({ 
            target: { 
                value: fullNumber,
                countryCode: selectedCountry.code,
                dialCode: selectedCountry.dialCode
            } 
        });
    };
    
    const handleCountryClick = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={styles.inputNumeroContainer} ref={inputRef}>
            <label htmlFor={id}>{label} {required && <span className={styles.required}>*</span>}</label>
            <div className={styles.inputWrapper}>
                {/* Select de país con bandera */}
                <div className={styles.countrySelect}>
                    <div 
                        className={styles.countryDisplay}
                        onClick={handleCountryClick}
                        style={readOnly ? { color: "gray", focus: "none", pointerEvents: "none" } : {}}
                    >
                        <div className={styles.flagContainer}>
                            <span className={styles.flagEmoji}>{selectedCountry.flag}</span>
                        </div>
                        <div className={`${styles.countryArrow} ${isOpen ? styles.rotated : ''}`}>
                            ▼
                        </div>
                    </div>
                    
                    {isOpen && !readOnly && (
                        <div className={styles.countryDropdown}>
                            {countryOptions.map((country) => (
                                <div
                                    key={country.code}
                                    className={`${styles.countryOption} ${
                                        selectedCountry.code === country.code ? styles.selected : ''
                                    }`}
                                    onClick={() => handleCountrySelect(country)}
                                >
                                    <div className={styles.flagContainer}>
                                        <span className={styles.flagEmoji}>{country.flag}</span>
                                    </div>
                                    <span className={styles.countryName}>{country.name}</span>
                                    <span className={styles.dialCode}>{country.dialCode}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <input
                    type="number"
                    id={id}
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className={styles.phoneInput}
                    required={required}
                    style={{ border: errorMessage ? '2px solid red' : '', ...(readOnly ? { color: "gray", focus: "none", pointerEvents: "none" } : {}) }}
                    readOnly={readOnly}
                />
                {errorMessage ? <MensajeError mensaje={'Este campo es requerido'} /> : null}
            </div>
        </div>
    );
}

export default InputNumero;
