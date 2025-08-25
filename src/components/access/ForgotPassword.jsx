import { useState } from "react";
import { useAuth } from "../../hooks/auth/useAuth";
import { useNavigate } from "react-router-dom";
import Footer from "../../sections/Footer";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const { resetPasswordForEmail } = useAuth();
    const [email, setEmail] = useState("");
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        if (!email) {
            setErrorMsg("Por favor ingresa tu correo electrónico");
            return;
        }

        setIsLoading(true);

        try {
            await resetPasswordForEmail(email);
            setSuccessMsg("Se ha enviado un enlace de recuperación a tu correo electrónico. Revisa tu bandeja de entrada y sigue las instrucciones.");
            setEmail(""); // Limpiar el campo después del éxito
        } catch (error) {
            setErrorMsg("Error al enviar el enlace de recuperación: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md mx-auto p-6 space-y-4 bg-white shadow-md rounded"
            >
                <img className="h-30 w-auto mb-4 mx-auto" src="/favicon.svg" alt="Logo de la empresa" />
                <h2 className="text-2xl font-bold text-center">Recuperar Contraseña</h2>
                <p className="text-gray-600 text-center text-sm">
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
                {successMsg && <p className="text-green-500 text-sm">{successMsg}</p>}

                <div>
                    <label className="block font-medium mb-1">Correo electrónico</label>
                    <input
                        type="email"
                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="tu@correo.com"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors w-full disabled:opacity-50"
                    >
                        {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-green-600 hover:text-green-800 transition-colors text-sm underline"
                    >
                        Volver al inicio de sesión
                    </button>
                </div>
            </form>
            <Footer />
        </>
    );
}