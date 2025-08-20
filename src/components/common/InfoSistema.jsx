import styles from "./InfoSistema.module.css";

function InfoSistema(props){
    const { title, details} = props;

    return(
        <div className={styles.infoSistemaContainer}>
            <h1 className={styles.infoSistemaTitle}>{title}</h1>
            <h1 className={styles.infoSistemaDetails}>{details}</h1>
        </div>
    )
}

export default InfoSistema;