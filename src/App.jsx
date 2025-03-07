import { useState } from "react";
import { useAuth } from "./hook/useAuth";
import Header from "./sections/Header.jsx";
import Hero from "./sections/Hero.jsx";
import Footer from "./sections/Footer.jsx";

function App() {
    const [count, setCount] = useState(0);

    // Opcional: Accede a la información del usuario actual
    const { user, loading } = useAuth();

    // Ejemplo simple de obtener "rol" según el usuario:
    const getRole = () => {
        if (!user) return "guest";
        return "admin";
    };

    // Mientras carga la sesión inicial, puedes mostrar un loader
    if (loading) {
        return <div>Cargando sesión...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header role={getRole()} />
            <Hero role={getRole()} />
            <Footer role={getRole()} />
        </div>
    );
}

export default App;
