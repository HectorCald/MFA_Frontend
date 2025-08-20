import styles from "./BotonBuscar.module.css";
import { FaSearch } from "react-icons/fa";

function BotonBuscar({ onClick }) {
    return (
        <button className={styles.botonBuscar} onClick={onClick}>
            <FaSearch /> Buscar
        </button>
    );
}

export default BotonBuscar;