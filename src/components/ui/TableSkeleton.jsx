import styles from "./TableSkeleton.module.css";

function TableSkeleton({ columns = 5, columnNames = [], rows = 8 }) {
    // Generar nombres de columnas si no se proporcionan
    const headers = columnNames.length > 0 ? columnNames : Array(columns).fill('').map((_, index) => `Columna ${index + 1}`);
    
    // Generar filas de skeleton con el número especificado
    const skeletonRows = Array(rows).fill(null);

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead className={styles.tableHeader}>
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index} className={styles.skeletonHeader}>
                                <div className={styles.skeletonText}></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={styles.tableBody}>
                    {skeletonRows.map((_, rowIndex) => (
                        <tr key={rowIndex} className={styles.skeletonRow}>
                            {headers.map((_, cellIndex) => (
                                <td key={cellIndex} className={styles.skeletonCell}>
                                    <div className={styles.skeletonText}></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TableSkeleton;
