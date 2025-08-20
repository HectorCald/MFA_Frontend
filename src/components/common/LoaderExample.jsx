import React, { useState } from 'react';
import Loader from './Loader';
import styles from './LoaderExample.module.css';

const LoaderExample = () => {
    const [isLoading, setIsLoading] = useState(false);

    const simulateLoading = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 3000);
    };

    return (
        <div className={styles.container}>
            <h2>🎯 Ejemplos del Componente Loader</h2>
            
            <div className={styles.section}>
                <h3>📏 Diferentes Tamaños</h3>
                <div className={styles.loaderRow}>
                    <div>
                        <h4>Pequeño</h4>
                        <Loader size="small" />
                    </div>
                    <div>
                        <h4>Mediano (por defecto)</h4>
                        <Loader size="medium" />
                    </div>
                    <div>
                        <h4>Grande</h4>
                        <Loader size="large" />
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h3>🎨 Diferentes Colores</h3>
                <div className={styles.loaderRow}>
                    <div>
                        <h4>Primario</h4>
                        <Loader color="#007bff" />
                    </div>
                    <div>
                        <h4>Éxito</h4>
                        <Loader color="#28a745" />
                    </div>
                    <div>
                        <h4>Peligro</h4>
                        <Loader color="#dc3545" />
                    </div>
                    <div>
                        <h4>Advertencia</h4>
                        <Loader color="#ffc107" />
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h3>📝 Con Texto Personalizado</h3>
                <div className={styles.loaderRow}>
                    <Loader text="Procesando datos..." />
                    <Loader text="Guardando cambios..." color="#28a745" />
                    <Loader text="Conectando..." color="#17a2b8" />
                </div>
            </div>

            <div className={styles.section}>
                <h3>🔄 Uso Real en Componente</h3>
                <div className={styles.demoContainer}>
                    {isLoading ? (
                        <Loader text="Simulando carga..." color="#007bff" />
                    ) : (
                        <div className={styles.content}>
                            <p>Este es el contenido de tu aplicación</p>
                            <button onClick={simulateLoading} className={styles.button}>
                                Simular Carga
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.section}>
                <h3>💡 Código de Uso</h3>
                <pre className={styles.code}>
{`// Uso básico
<Loader />

// Con tamaño personalizado
<Loader size="large" />

// Con color personalizado
<Loader color="#ff6b6b" />

// Con texto personalizado
<Loader text="Cargando usuarios..." />

// Combinando propiedades
<Loader 
    size="small" 
    color="#28a745" 
    text="Guardando..." 
/>

// En un estado de carga
{isLoading && <Loader text="Procesando..." />}`}
                </pre>
            </div>
        </div>
    );
};

export default LoaderExample;
