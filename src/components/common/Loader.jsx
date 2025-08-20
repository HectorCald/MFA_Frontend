import React from 'react';
import styles from './Loader.module.css';

const Loader = ({ size = 'medium', color = '#007bff', text = 'Cargando...', show = true }) => {
    return (
        <div className={`${styles.loaderContainer} ${show ? styles.show : styles.hide}`}>
            <div className={`${styles.loader} ${styles[size]}`}>
                {[...Array(5)].map((_, index) => (
                    <div
                        key={index}
                        className={styles.pillar}
                        style={{
                            '--delay': `${index * 0.1}s`,
                            '--color': color
                        }}
                    />
                ))}
            </div>
            {text && <p className={styles.loaderText}>{text}</p>}
        </div>
    );
};

export default Loader;
