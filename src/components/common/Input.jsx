import styles from "./Input.module.css";
import { useState } from "react";
import MensajeError from "./MensajeError";
import InfoBoton from "./InfoBoton";

function Input(props) {
    const { label, type, id, value, onChange, placeholder, required, info, errorMessage, readOnly } = props;

    const [showInfo, setShowInfo] = useState(false);

    return (
        <div className={styles.inputContainer}>
            <div className={styles.inputInfo}>
                <label htmlFor={id}>{label} {required && <span>*</span>}</label>
                {info && (
                    <InfoBoton info={info} setShowInfo={setShowInfo} showInfo={showInfo} />
                )}
            </div>
            <input 
                type={type} 
                id={id} 
                value={value} 
                onChange={(e) => {
                    // Capitalizar la primera letra de cada palabra para campos de texto
                    if (type === 'text' && !readOnly) {
                        const inputValue = e.target.value;
                        const capitalizedValue = inputValue.replace(/\b\w/g, l => l.toUpperCase());
                        onChange({ ...e, target: { ...e.target, value: capitalizedValue } });
                    } else {
                        onChange(e);
                    }
                }} 
                required={required} 
                readOnly={readOnly}
                style={readOnly ?{ color:  "gray", focus: "none", pointerEvents: "none"} : {}}
            />
            {errorMessage? <MensajeError mensaje={errorMessage === true ? "Este campo es requerido" : errorMessage} /> : null}
        </div>
    )
}
//holas
export default Input;