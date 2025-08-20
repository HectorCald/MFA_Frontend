import styles from "./Table.module.css";

function Table({ headers, data, styleCustom, columnAlignments = [] }) {
    // Función para obtener la alineación de una columna específica
    const getColumnAlignment = (columnIndex) => {
        if (columnAlignments && columnAlignments[columnIndex]) {
            return columnAlignments[columnIndex];
        }
        return 'center'; // Alineación por defecto
    };

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table} style={styleCustom}>
                <thead className={styles.tableHeader}>
                    <tr>
                        {headers.map((header, index) => (
                            <th 
                                key={header} 
                                style={{ textAlign: getColumnAlignment(index) }}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={styles.tableBody}>
                    {data && data.length > 0 ? (
                        data.map((row, index) => (
                            <tr key={index} className={styles.tableRow} data-row-index={index}>
                                {row.map((cell, cellIndex) => (
                                    <td 
                                        key={cellIndex}
                                        style={{ textAlign: getColumnAlignment(cellIndex) }}
                                    >
                                        {typeof cell === 'object' ? cell : cell}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={headers.length} className={styles.noData}>
                                No hay datos disponibles
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}   

export default Table;