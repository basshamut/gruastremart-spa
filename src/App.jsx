import Footer from "./sections/Footer.jsx";
import Header from "./sections/Header.jsx";
import Hero from "./sections/Hero.jsx";

export default function App() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <Hero />
            <Footer />
        </div>
    );
}
