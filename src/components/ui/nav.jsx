import styles from "./nav.module.css"
import logo from "../../assets/logo-MFA.png"
import { FaUser, FaBars, FaTimes } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { navOptions } from "../../constants/navOptions.jsx";

function Nav() {
    const navigate = useNavigate();

    // Obtener información del usuario desde localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user.role;

    // Estado para controlar qué dropdown está abierto
    const [openDropdown, setOpenDropdown] = useState(null);

    // Estado para controlar qué botón está activo
    const [activeButton, setActiveButton] = useState(() => {
        const options = navOptions[role] || navOptions.default;
        const activeOption = options.find(option => option.isActive);
        return activeOption ? activeOption.id : null;
    });

    // Obtener las opciones según el rol del usuario
    const currentOptions = navOptions[role] || navOptions.default;
    const [menuActivo, setMenuActivo] = useState(false);
    // Función para alternar dropdown
    const toggleDropdown = (dropdownId, e) => {
        e.stopPropagation();

        // Si el dropdown ya está abierto, cerrarlo y desactivar el botón
        if (openDropdown === dropdownId) {
            setOpenDropdown(null);
            setActiveButton(null);
        } else {
            // Si el dropdown está cerrado, abrirlo y activar el botón
            setOpenDropdown(dropdownId);
            setActiveButton(dropdownId);
        }
    };

    // Función para navegar a una página
    const handleNavigation = (href) => {
        navigate(href);
        setOpenDropdown(null); // Cerrar dropdown después de navegar
    };

    // Cerrar dropdown cuando se hace click fuera
    useEffect(() => {
        const handleClickOutside = () => {
            setOpenDropdown(null);
            setActiveButton(null);

        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const toggleMenu = () => {
        setMenuActivo(!menuActivo);
    }

    return (
        <div className={styles.navContainer}>
            <img className={styles.logo} src={logo} alt="" />
            {<div className={`${styles.navContent} ${menuActivo ? styles.menuActivo : styles.menuInactivo}`}>
                <button className={styles.cerrarMenu} onClick={() => setMenuActivo(false)}>
                    <FaTimes />
                </button>
                {currentOptions.map((option) => (
                    <div key={option.id} className={styles.dropdownContainer}>
                        {option.subOptions.length > 0 ? <button
                            className={activeButton === option.id ? styles.optionActivo : styles.option}
                            onClick={(e) => toggleDropdown(option.id, e)}
                        >
                            {option.icon}
                            {option.label}
                        </button> : <a href={option.href} className={styles.option}>
                            {option.icon}
                            {option.label}
                        </a>}
                        {openDropdown === option.id && (
                            <div className={styles.dropdownMenu}>
                                {option.subOptions.map((subOption, index) => (
                                    <a
                                        key={index}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavigation(subOption.href);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {subOption.label}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>}

            <div className={styles.circulo}></div>
            <div className={styles.opciones}>
                <button className={styles.perfil}>
                    <FaUser />
                    <p>Perfil</p>
                </button>
                <button className={styles.menuHamburguesa} onClick={toggleMenu}>
                    <FaBars />
                </button>
            </div>
        </div>
    )
}
export default Nav;