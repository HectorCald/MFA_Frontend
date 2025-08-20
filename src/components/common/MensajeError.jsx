import { FaExclamationCircle } from "react-icons/fa";
import styles from "./MensajeError.module.css";

function MensajeError(props) {
    const { mensaje } = props;
    return (
        <p className={styles.errorMessage}><FaExclamationCircle />{mensaje}</p>
    )
}

export default MensajeError;