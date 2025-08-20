import React from 'react';
import styles from './Lista.module.css';

const Lista = ({ titulo, opciones = [], className = '', styleCustom = {} }) => {
    return (
        <div className={`${styles.listaContainer} ${className}`}>
            {titulo && (
                <h3 className={styles.listaTitulo}>{titulo}</h3>
            )}
            <div className={styles.listaOpciones} style={styleCustom}>
                {opciones.map((opcion, index) => (
                    <div key={index} className={styles.listaOpcion}>
                        {opcion}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Lista;
