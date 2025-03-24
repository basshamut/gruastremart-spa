import { useAuth } from "./hooks/useAuth";
import Footer from "./sections/Footer.jsx";
import Header from "./sections/Header.jsx";
import Hero from "./sections/Hero.jsx";
import useGetRole from "./hooks/useGetRole";
import Spinner from "./components/common/Spinner.jsx";

function App() {
    const { user, loading: authLoading } = useAuth();
    const { role, loading: roleLoading, error } = useGetRole(user ? user.email : null);

    // Mientras carga la sesión inicial o el rol, puedes mostrar un loader
    if (authLoading || roleLoading) {
        return <div>
            <Spinner />
        </div>;
    }

    return (
        <div className="min-h-screen flex flex-col">
            {error && <div>Role error: {error.message}</div>}
            <Header />
            <Hero role={role || "GUEST"} />
            <Footer />
        </div>
    );
}

export default App;