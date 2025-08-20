import fondo from "../../assets/fondo.png"
import styles from "./Fondo.module.css"
function Fondo(){
    return (
        <div className={styles.fondoPrincipal}>
            <img src={fondo} alt="" />
        </div>
    )
}
export default Fondo;