import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabase/supabaseClient";
import Footer from "../../sections/Footer";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);
    const [sessionValid, setSessionValid] = useState(false);

    useEffect(() => {
        // Forzar a Supabase a leer el hash de la URL y crear la sesión si viene del email
        const initializeSession = async () => {
            try {
                // Esto consume el hash de la URL (#access_token=...&type=recovery...)
                const { data: { session }, error } = await supabase.auth.getSession();
                
                setSessionReady(true);
                
                if (error) {
                    console.error('Error al obtener la sesión:', error);
                    setSessionValid(false);
                    return;
                }
                
                if (session && session.user) {
                    setSessionValid(true);
                } else {
                    setSessionValid(false);
                }
            } catch (error) {
                console.error('Error al inicializar la sesión:', error);
                setSessionReady(true);
                setSessionValid(false);
            }
        };
        
        initializeSession();
    }, []);

    // Redirigir solo después de que la sesión esté lista y sea inválida
    useEffect(() => {
        if (sessionReady && !sessionValid) {
            navigate("/login", { 
                state: { message: "Enlace de recuperación inválido o expirado" } 
            });
        }
    }, [sessionReady, sessionValid, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if (password !== confirmPassword) {
            setErrorMsg("Las contraseñas no coinciden");
            return;
        }

        if (password.length < 6) {
            setErrorMsg("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setSuccessMsg("Contraseña actualizada exitosamente");
            
            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                navigate("/login", { 
                    state: { message: "Contraseña actualizada. Puedes iniciar sesión con tu nueva contraseña." } 
                });
            }, 2000);

        } catch (error) {
            setErrorMsg("Error al actualizar la contraseña: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Mostrar loading mientras se verifica la sesión
    if (!sessionReady) {
        return (
            <>
                <div className="w-full max-w-md mx-auto p-6 space-y-4 bg-white shadow-md rounded">
                    <img className="h-30 w-auto mb-4 mx-auto" src="/favicon.svg" alt="Logo de la empresa" />
                    <h2 className="text-2xl font-bold text-center">Verificando enlace...</h2>
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // Solo mostrar el formulario si la sesión es válida
    if (!sessionValid) {
        return null; // El useEffect se encargará de la redirección
    }

    return (
        <>
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md mx-auto p-6 space-y-4 bg-white shadow-md rounded"
            >
                <img className="h-30 w-auto mb-4 mx-auto" src="/favicon.svg" alt="Logo de la empresa" />
                <h2 className="text-2xl font-bold text-center">Restablecer Contraseña</h2>

                {errorMsg && <p className="text-red-500">{errorMsg}</p>}
                {successMsg && <p className="text-green-500">{successMsg}</p>}

                <div>
                    <label className="block font-medium mb-1">Nueva Contraseña</label>
                    <input
                        type="password"
                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>

                <div>
                    <label className="block font-medium mb-1">Confirmar Nueva Contraseña</label>
                    <input
                        type="password"
                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors w-full disabled:opacity-50"
                >
                    {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-green-600 hover:text-green-800 transition-colors text-sm underline w-full"
                >
                    Volver al inicio de sesión
                </button>
            </form>
            <Footer />
        </>
    );
}