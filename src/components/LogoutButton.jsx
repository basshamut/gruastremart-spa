import React from "react";
import { useAuth } from "../hook/useAuth";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    async function handleLogout(event) {
        event.preventDefault();
        try {
            await signOut();
            navigate("/login");
        } catch (error) {
            console.error("Error al cerrar sesión:", error.message);
        }
    };

    return (
        <a href="#" onClick={(event) => handleLogout(event)}
            className="block py-2 px-4 text-sm text-secondary-foreground hover:bg-secondary/80 hover:text-secondary rounded-md">
            Cerrar Sesión
        </a>
    );
}
