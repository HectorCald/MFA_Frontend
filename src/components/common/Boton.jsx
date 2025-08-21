import styles from "./Boton.module.css";
import { FaPlus, FaCheck, FaArrowRight } from "react-icons/fa";

function Boton(props){
    const { label, onClick, type, disabled, tipo, icon, loading = false, style = '' } = props;

    return(
        <button 
            className={`${tipo === "closeButton" ? styles.closeButton : styles.btn + " " + styles[tipo] + " " + style} ${loading ? styles.loading : ''}`} 
            onClick={onClick} 
            type={type} 
            disabled={disabled || loading}
        >
            {icon && !loading && <span className={styles.icon}>{icon}</span>}
            
            {loading ? (
                <div className={styles.loadingDots}>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                </div>
            ) : (
                <span>{label}</span>
            )}
        </button>   
    )
}

export default Boton;