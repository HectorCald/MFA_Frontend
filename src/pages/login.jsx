import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaExclamationTriangle } from "react-icons/fa";
import logo from "../assets/logo-color.png"
import Fondo from "../components/common/Fondo";
import googleIcon from "../assets/icons/google-icon.png"
import "../styles/login.css";
import AuthService from "../services/authService";


export default function Login() {
    const [email, setEmail] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setPasswordVisible((prev) => !prev);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Limpiar errores anteriores
        setEmailError(false);
        setPasswordError(false);
        setLoading(true);

        try {
            const data = await AuthService.login({ email, password });
            
            // ✅ Guardar token y usuario en localStorage ANTES de navegar
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // SOLO navegar si el login es exitoso
            navigate('/');
        } catch (err) {
            console.log('❌ Error completo:', err);
            console.log('❌ Respuesta del servidor:', err.response?.data);
            console.log('❌ Status code:', err.response?.status);

            // Marcar ambos campos como incorrectos cuando falle el login
            setEmailError(true);
            setPasswordError(true);
            // NO navegar si hay error - la página se queda en login
        } finally {
            setLoading(false);
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (emailError) {
            setEmailError(false);
            setPasswordError(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (passwordError) {
            setEmailError(false);
            setPasswordError(false);
        }
    };

    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    return (
        <div className="login-page">
            {loading && <div className="overlay"></div>}
            <Fondo />
            <img className="logotipo" src={logo} alt="Logo" />
            <div className="login-container">
                <h3 className="iniciar-sesion">Iniciar Sesión</h3>
                <p className="descripcion">Ingresa tus credenciales para continuar:</p>

                <form onSubmit={handleSubmit}>
                    <div className="edit-container">
                        <div className="entrada">
                            <p className={emailFocused || email ? 'float' : ''}
                            style={{ color: emailError && (emailFocused || email) ? 'red' : '' }}>Correo electrónico</p>
                            <input
                                type="email"
                                value={email}
                                onChange={handleEmailChange}
                                onFocus={() => setEmailFocused(true)}
                                onBlur={() => setEmailFocused(false)}
                                style={{ border: emailError ? '2px solid red' : '' }}
                            />
                            {emailError && <p className="error-mensaje"><FaExclamationTriangle /> Credenciales incorrectas.</p>}
                        </div>
                        <div className="entrada">
                            <p className={passwordFocused || password ? 'float' : ''}
                            style={{ color: passwordError && (passwordFocused || password) ? 'red' : '' }}>Contraseña</p>
                            <div className="contraseña-span">
                                <input
                                    type={passwordVisible ? "text" : "password"}
                                    value={password}
                                    onChange={handlePasswordChange}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                    required
                                    style={{ border: passwordError ? '2px solid red' : '' }}
                                />
                                <span onClick={togglePasswordVisibility}>{passwordVisible ? <FaEyeSlash /> : <FaEye />}</span>
                            </div>
                            {passwordError && <p className="error-mensaje"><FaExclamationTriangle /> Credenciales incorrectas.</p>}
                            <p className="btn-olvido">Olvido su contraseña?</p>
                        </div>
                    </div>

                    <button 
                        className={`btn-login ${loading ? 'loading' : ''}`} 
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="loading-dots">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </div>
                        ) : (
                            'Iniciar sesión'
                        )}
                    </button>
                    <div className="google-container">
                        <img src={googleIcon} alt="" />
                        <button className="btn-google">Continuar con Google</button>
                    </div>
                </form>
                <p className="terminos">Terminos y condiciones</p>
            </div>
        </div>
    );
}