// src/components/SignUpForm.jsx
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {registerUserInDb} from "../../services/UserService";

export default function SignUpForm() {
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
        name: "",
        lastName: "",
        phone: "",
        address: "",
        identificationNumber: "",
        birthDate: "",
        role: "CLIENT",
    });

    const [errorMsg, setErrorMsg] = useState(null);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(null);
        try {
            await signUp(form.email, form.password); // Create user in Supabase
            await registerUserInDb(form); // Create user in the database
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

            {[
                { label: "Correo electrónico", name: "email", type: "email" },
                { label: "Contraseña", name: "password", type: "password" },
                { label: "Nombre", name: "name" },
                { label: "Apellidos", name: "lastName" },
                { label: "Teléfono", name: "phone" },
                { label: "Dirección", name: "address" },
                { label: "DNI/NIF", name: "identificationNumber" },
                { label: "Fecha de nacimiento", name: "birthDate", type: "date" },
            ].map(({ label, name, type = "text" }) => (
                <div key={name}>
                    <label className="block font-medium mb-1">{label}</label>
                    <input
                        type={type}
                        name={name}
                        value={form[name]}
                        onChange={handleChange}
                        required
                        className="border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                </div>
            ))}

            <button
                type="submit"
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors w-full"
            >
                Registrarse
            </button>
            <button
                onClick={() => navigate("/login")}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors w-full"
                type="button"
            >
                Volver
            </button>
        </form>
    );
}
