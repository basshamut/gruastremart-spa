import React from "react";
import { useAuth } from "../../hook/useAuth";

export default function LogoutButton() {
    const { signOut } = useAuth();

    async function handleLogout(event) {
        event.preventDefault();
        try {
            await signOut();
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
