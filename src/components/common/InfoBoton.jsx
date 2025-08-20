import styles from "./InfoBoton.module.css";
import { FaInfoCircle } from "react-icons/fa";

function InfoBoton({ info, setShowInfo, showInfo, direction }) {
    return (
        <button className={styles.infoButton} onMouseEnter={() => setShowInfo(true)} onMouseLeave={() => setShowInfo(false)}>
            <FaInfoCircle />
            {showInfo && (
                <div className={`${styles.infoContainer} ${direction === 'right' ? styles.right : styles.left}`}>
                    <p>{info}</p>
                </div>
            )}
        </button>
    )
}

export default InfoBoton;