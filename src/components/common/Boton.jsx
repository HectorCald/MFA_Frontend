import styles from "./Boton.module.css";
import { FaPlus, FaCheck, FaArrowRight } from "react-icons/fa";
function Boton(props){
    const { label, onClick, type, disabled, tipo, icon } = props;

    return(
        <button className={tipo === "closeButton" ? styles.closeButton : styles.btn + " " + styles[tipo]} onClick={onClick} type={type} disabled={disabled}>
            {icon && <span className={styles.icon}>{icon}</span>}
            <span>{label}</span>
        </button>   
    )
}

export default Boton;