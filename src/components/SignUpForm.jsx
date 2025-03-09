// src/components/SignUpForm.jsx
import { useState } from "react";
import { useAuth } from "../hook/useAuth";
import { useNavigate } from "react-router-dom";

export default function SignUpForm() {
    const { signUp } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState(null);
    const navigate = useNavigate();

    function handleBack() {
        navigate("/login")
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        try {
            await signUp(email, password);
            alert("¡Te has registrado correctamente! Revisa tu correo para confirmar.");
        } catch (error) {
            setErrorMsg(error.message);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-md mx-auto p-6 space-y-4 bg-white shadow-md rounded"
        >
            <img className="h-20 w-auto mb-4 mx-auto" src="/favicon.svg" alt="Logo de la empresa" />
            <h2 className="text-2xl font-bold text-center">Registro</h2>
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

            <button
                type="submit"
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors w-full"
            >
                Registrarse
            </button>
            <button onClick={handleBack} className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors w-full">
                Volver
            </button>

        </form>
    );
}
