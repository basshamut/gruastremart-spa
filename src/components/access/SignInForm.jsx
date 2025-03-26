import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { getRoleByEmail} from "../../services/UserService";

import Footer from "../../sections/Footer";

export default function SignInForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const { signIn } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState(location.state?.message || null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);

        try {
            await signIn(email, password);

            const role = await getRoleByEmail(email);
            if (!role) {
                throw new Error("No se pudo determinar el rol del usuario");
            }

            localStorage.setItem("role", role);
            navigate("/home");
        } catch (error) {
            navigate("/login", { state: { message: error.message } });
            setErrorMsg(error.message);
        }
    };

    const handleSignUp = () => {
        navigate("/register");
    };

    return (
        <>
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md mx-auto p-6 space-y-4 bg-white shadow-md rounded"
            >
                <img className="h-20 w-auto mb-4 mx-auto" src="/favicon.svg" alt="Logo de la empresa" />
                <h2 className="text-2xl font-bold text-center">Iniciar Sesión</h2>

                {errorMsg && <p className="text-red-500">{errorMsg}</p>}

                <div>
                    <label className="block font-medium mb-1">Correo electrónico</label>
                    <input
                        type="email"
                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block font-medium mb-1">Contraseña</label>
                    <input
                        type="password"
                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        type="submit"
                        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors w-full"
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        type="button"
                        onClick={handleSignUp}
                        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors w-full"
                    >
                        Registrarse
                    </button>
                </div>
            </form>
            <Footer />
        </>
    );
}
