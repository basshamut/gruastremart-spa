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
        setOpen(false);
        if (destination === "logout") {
            signOut().then(() => {
                localStorage.removeItem("jwt");
                localStorage.removeItem("role");
                window.location.href = "/login";
            });
        } else {
            navigate(destination, {state: role ? {role} : {}});
        }
    };

    const menuItems = [
        {
            label: "Inicio",
            icon: <Home className="w-5 h-5 mr-2"/>,
            onClick: (e) => goTo(e, "/home", role),
            show: true
        },
        {
            label: "Perfil",
            icon: <User className="w-5 h-5 mr-2"/>,
            onClick: (e) => goTo(e, "#"),
            show: role === "ADMIN"
        },
        {
            label: "Configuraciones",
            icon: <User className="w-5 h-5 mr-2"/>,
            onClick: (e) => goTo(e, "#"),
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
            {/* BOTÓN HAMBURGUESA - SOLO MÓVIL */}
            <div className="fixed top-4 left-4 z-50 md:hidden">
                <button
                    onClick={() => setOpen(!open)}
                    className="p-2 bg-card shadow-md rounded-full border text-foreground"
                    aria-label="Abrir menú"
                >
                    {open ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
                </button>
            </div>

            {/* BACKDROP OSCURO CUANDO EL MENÚ ESTÁ ABIERTO */}
            {open && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* MENÚ LATERAL MÓVIL */}
            <div
                className={`fixed top-0 left-0 bottom-0 w-64 bg-white shadow-lg border-r px-4 pt-20 z-40 transform transition-transform duration-300 md:hidden ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <ul className="space-y-3">
                    {menuItems
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

            {/* MENÚ LATERAL FIJO EN ESCRITORIO */}
            <nav className="hidden md:block px-4 py-6 bg-card border-r w-64 min-h-screen">
                <ul className="space-y-3">
                    {menuItems
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
            </nav>
        </>
    );
}
