import styles from "./InputSearch.module.css";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import InfoBoton from "./InfoBoton";

function InputSearch({ placeholder, value, onChange, onSearchBlocks, info }) {
    const [showInfo, setShowInfo] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [searchBlocks, setSearchBlocks] = useState([]);
    const inputRef = useRef(null);

    useEffect(() => {
        if (onSearchBlocks) {
            onSearchBlocks(searchBlocks);
        }
    }, [searchBlocks, onSearchBlocks]);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        // Detectar doble espacio - usar el valor completo del input
        if (newValue.endsWith("  ")) {
            // Obtener el texto completo sin los dos espacios finales
            const blockText = newValue.slice(0, -2).trim();
            console.log("Texto completo del input:", newValue);
            console.log("Texto para crear bloque:", blockText);
            console.log("Longitud del texto:", blockText.length);
            
            if (blockText && !searchBlocks.includes(blockText)) {
                console.log("Creando bloque con texto:", blockText, "Longitud:", blockText.length);
                setSearchBlocks(prev => [...prev, blockText]);
                setInputValue("");
            }
        }

        if (onChange) {
            onChange(e);
        }
    };

    const removeBlock = (blockToRemove) => {
        setSearchBlocks(prev => prev.filter(block => block !== blockToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Backspace" && inputValue === "" && searchBlocks.length > 0) {
            setSearchBlocks(prev => prev.slice(0, -1));
        }
    };

    const handleInputFocus = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleSearchClick = () => {
        const trimmedValue = inputValue.trim();
        
        // Si no hay bloques y hay texto en el input, crear un bloque
        if (searchBlocks.length === 0 && trimmedValue) {
            console.log("Creando bloque desde lupa:", trimmedValue);
            setSearchBlocks([trimmedValue]);
            setInputValue("");
        }
        
        // Si hay bloques pero también hay texto en el input, agregar el texto como bloque
        if (searchBlocks.length > 0 && trimmedValue) {
            console.log("Agregando bloque desde lupa:", trimmedValue);
            if (!searchBlocks.includes(trimmedValue)) {
                setSearchBlocks(prev => [...prev, trimmedValue]);
                setInputValue("");
            }
        }
    };

    return (
        <div className={styles.inputSearchContainer}>
            <div className={styles.inputSearch} onClick={handleInputFocus}>
                <div className={styles.searchBlocks}>
                    {searchBlocks.map((block, index) => (
                        <span key={index} className={styles.searchBlock} title={block}>
                            {block}
                            <button
                                type="button"
                                className={styles.removeBlock}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeBlock(block);
                                }}
                                title="Eliminar filtro"
                            >
                                <FaTimes />
                            </button>
                        </span>
                    ))}
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={searchBlocks.length === 0 ? placeholder : "Agregar más filtros..."}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className={styles.searchInput}
                />
                <div className={styles.infoBotonContainer}>
                    {info && <InfoBoton info={info} setShowInfo={setShowInfo} showInfo={showInfo} direction="right" />}
                </div>
                <FaSearch className={styles.icon} onClick={handleSearchClick} />
            </div>
        </div>
    );
}

export default InputSearch;