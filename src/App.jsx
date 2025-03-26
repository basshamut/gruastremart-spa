import Footer from "./sections/Footer.jsx";
import Header from "./sections/Header.jsx";
import Hero from "./sections/Hero.jsx";

export default function App() {
    function getRoleFromLocalStorage() {
        return localStorage.getItem("role");
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <Hero role={getRoleFromLocalStorage()} />
            <Footer />
        </div>
    );
}
