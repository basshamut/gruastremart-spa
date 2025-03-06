import LogoutButton from "./LogoutButton.jsx";

export default function NavBar() {
    return (
        <>
            <div className="p-4">
                <h2 className="text-lg font-bold text-primary-foreground">Dashboard</h2>
            </div>
            <nav className="py-4">
                <a href="#" className="block py-2 px-4 text-sm text-secondary-foreground hover:bg-secondary/80 hover:text-secondary rounded-md">
                    Inicio
                </a>
                <a href="#" className="block py-2 px-4 text-sm text-secondary-foreground hover:bg-secondary/80 hover:text-secondary rounded-md">
                    Perfil
                </a>
                <a href="#" className="block py-2 px-4 text-sm text-secondary-foreground hover:bg-secondary/80 hover:text-secondary rounded-md">
                    Configuración
                </a>
                <LogoutButton />
            </nav>
        </>
    );
}
