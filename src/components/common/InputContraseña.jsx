import styles from "./InputContraseña.module.css";
import { useState } from "react";
import MensajeError from "./MensajeError";
import InfoBoton from "./InfoBoton";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function InputContraseña(props) {
    const { 
        label, 
        type = "password", 
        id, 
        value, 
        onChange, 
        placeholder, 
        required, 
        info, 
        errorMessage, 
        readOnly,
        generarContraseña = false,
        longitudContraseña = 12
    } = props;

    const [showInfo, setShowInfo] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Función para generar contraseña aleatoria
    const generarContraseñaAleatoria = () => {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let contraseña = '';
        
        for (let i = 0; i < longitudContraseña; i++) {
            contraseña += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        
        // Simular el evento onChange
        onChange({ 
            target: { 
                id: id, 
                value: contraseña,
                name: id 
            } 
        });
    };

    // Función para alternar visibilidad de la contraseña
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={styles.inputContainer}>
            <div className={styles.inputInfo}>
                <label htmlFor={id}>{label} {required && <span>*</span>}</label>
                {info && (
                    <InfoBoton info={info} setShowInfo={setShowInfo} showInfo={showInfo} />
                )}
            </div>
            
            <div className={styles.inputWrapper}>
                <input 
                    type={showPassword ? "text" : "password"}
                    id={id} 
                    value={value} 
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required} 
                    readOnly={readOnly}
                    style={readOnly ? { color: "gray", focus: "none", pointerEvents: "none" } : {}}
                />
                
                {/* Botón para generar contraseña */}
                {generarContraseña && (
                    <button
                        type="button"
                        className={styles.generateButton}
                        onClick={generarContraseñaAleatoria}
                        title="Generar contraseña aleatoria"
                    >
                        🔐
                    </button>
                )}
                
                {/* Botón para mostrar/ocultar contraseña */}
                <button
                    type="button"
                    className={styles.visibilityButton}
                    onClick={togglePasswordVisibility}
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>
            
            {errorMessage && <MensajeError mensaje={errorMessage} />}
        </div>
    )
}

export default InputContraseña;
