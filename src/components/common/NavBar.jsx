import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth";
import {Home, LogOut, Menu, Settings, User, Users, X} from "lucide-react";

export default function NavBar({role}) {
    const navigate = useNavigate();
    const {signOut} = useAuth();
    const [open, setOpen] = useState(false);

    const goTo = (e, destination, role = null) => {
        e.preventDefault();
        setOpen(false); // cerrar menú
        if (destination === "logout") {
            signOut().then(() => {
                localStorage.removeItem("jwt");
                navigate("/");
            });
        } else {
            navigate(destination, {state: role ? {role} : {}});
        }
    };

    const mobileNavItems = [
        {
            label: "Inicio",
            icon: <Home className="w-5 h-5 mr-2"/>,
            onClick: (e) => goTo(e, "/home", role),
            show: true
        },
        {
            label: "Perfil",
            icon: <User className="w-5 h-5 mr-2"/>,
            onClick: (e) => goTo(e, "/profile"),
            show: role === "ADMIN"
        },
        {
            label: "Usuarios",
            icon: <Users className="w-5 h-5 mr-2"/>,
            onClick: (e) => goTo(e, "/home", "CLIENT"),
            show: role === "ADMIN"
        },
        {
            label: "Operadores",
            icon: <Settings className="w-5 h-5 mr-2"/>,
            onClick: (e) => goTo(e, "/home", "OPERATOR"),
            show: role === "ADMIN"
        },
        {
            label: "Salir",
            icon: <LogOut className="w-5 h-5 mr-2"/>,
            onClick: (e) => goTo(e, "logout"),
            show: true
        }
    ];

    return (
        <>
            {/* Botón de menú solo en móvil */}
            <div className="fixed top-4 left-4 z-50 md:hidden">
                <button
                    onClick={() => setOpen(!open)}
                    className="p-2 bg-card shadow-md rounded-full border text-foreground"
                    aria-label="Abrir menú"
                >
                    {open ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
                </button>
            </div>

            {/* Menú lateral emergente con fondo sólido */}
            {open && (
                <div
                    className="fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-card z-40 shadow-lg border-r md:hidden px-4 pt-20">
                    <ul className="space-y-3">
                        {mobileNavItems
                            .filter((item) => item.show)
                            .map((item, idx) => (
                                <li key={idx}>
                                    <a
                                        href="#"
                                        onClick={item.onClick}
                                        className="flex items-center text-sm py-2 px-2 rounded-md hover:bg-secondary/50"
                                    >
                                        {item.icon}
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                    </ul>
                </div>
            )}

        </>
    );
}
