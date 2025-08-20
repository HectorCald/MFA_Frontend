import { FaHome, FaCog, FaServer, FaUsers, FaPlus, FaFile, FaChartLine, FaUser, FaCrown, FaHistory } from "react-icons/fa";

export const navOptions = {
    "Super Administrador": [
        {
            id: 'home',
            label: 'Inicio',
            icon: <FaHome />,
            isActive: true,
            subOptions: [],
            href: '/'
        },
        {
            id: 'cliente',
            label: 'Cliente Empresa',
            icon: <FaUsers />,
            isActive: false,
            subOptions: [],
            href: '/gestionar-cliente-empresa'
        },
        {
            id: 'usuarios',
            label: 'Configuración',
            icon: <FaCog />,
            isActive: false,
            subOptions: [
                { label: 'Usuarios', href: '/gestionar-usuarios' },
                { label: 'Roles y Permisos', href: '/gestionar-roles-permisos' },
            ],
        },
    ],
    // Opción por defecto para casos donde el rol no coincida
    default: [
        {
            id: 'home',
            label: 'Inicio',
            icon: <FaHome />,
            isActive: true,
            subOptions: [],
            href: '/'
        }
    ]
}; 