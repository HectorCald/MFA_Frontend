import styles from "./Instruccion.module.css";

const Instruccion = ({ texto }) => {
    return (
        <div className={styles.instruccion}>
            <h1 className={styles.title}>Instrucción</h1>
            <p className={styles.texto}>{texto}</p>
        </div>
    );
};

export default Instruccion;