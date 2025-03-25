import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function NavBar({ role }) {
    const navigate = useNavigate();
    const { signOut } = useAuth();

    function goToActivityPage(event, role) {
        event.preventDefault();
        navigate("/home", { state: { role } });
    }

    async function handleLogout(event) {
        event.preventDefault();
        try {
            await signOut();
            localStorage.removeItem("jwt");
            navigate("/");
        } catch (error) {
            console.error("Error al cerrar sesión:", error.message);
        }
    };

    return (
        <>
            <div className="p-4">
                <h2 className="text-lg font-bold text-primary-foreground">Dashboard</h2>
            </div>
            <nav className="py-4">
                {role === "ADMIN" && (<div>
                    <a href="#" onClick={(event) => { goToActivityPage(event, "ADMIN") }} className="block py-2 px-4 text-sm text-secondary-foreground hover:bg-secondary/80 hover:text-secondary rounded-md">
                        Inicio
                    </a>
                    <a href="#" className="block py-2 px-4 text-sm text-secondary-foreground hover:bg-secondary/80 hover:text-secondary rounded-md">
                        Perfil
                    </a>
                    <a href="#" className="block py-2 px-4 text-sm text-secondary-foreground hover:bg-secondary/80 hover:text-secondary rounded-md">
                        Configuración
                    </a>
                    <a href="#" onClick={(event) => { goToActivityPage(event, "CLIENT") }} className="block py-2 px-4 text-sm text-secondary-foreground hover:bg-secondary/80 hover:text-secondary rounded-md">
                        Tablero Usuarios
                    </a>
                    <a href="#" onClick={(event) => { goToActivityPage(event, "OPERATOR") }} className="block py-2 px-4 text-sm text-secondary-foreground hover:bg-secondary/80 hover:text-secondary rounded-md">
                        Tablero Operadores
                    </a>
                </div>
                )}

                <a href="#" onClick={(event) => { handleLogout(event) }} className="block py-2 px-4 text-sm text-secondary-foreground hover:bg-secondary/80 hover:text-secondary rounded-md">
                    Cerrar sesión
                </a>
            </nav>
        </>
    );
}
