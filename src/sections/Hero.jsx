import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import NavBar from "../components/common/NavBar.jsx";
import InternalActivityTable from "../pages/InternalActivity.jsx";
import OperatorActivityTable from "../pages/OperatorActivity.jsx";
import CustomerActivityTable from "../pages/CustomerActivity.jsx";

export default function Hero({ role: userRole }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeRole, setActiveRole] = useState(userRole);
    const { isSessionActive } = useAuth();

    // Detectar si hay un role en el state de la navegación
    useEffect(() => {
        if (!userRole || !isSessionActive) {      
            console.error("Debe iniciar sesión para acceder");
            navigate("/login",{state: {message: "Debe iniciar sesión para acceder"}});
        }

        if (location.state?.role) {
            setActiveRole(location.state.role);
            window.history.replaceState({}, document.title);
        } 
        
    }, [location.state, navigate, userRole, isSessionActive]);

    return (
        <section className="flex flex-col md:flex-row min-h-screen bg-background">
            <aside className="bg-card md:w-64">
                <NavBar role={userRole} />
            </aside>

            <main className="flex-1 p-4">
                {activeRole === "ADMIN" && <InternalActivityTable role={activeRole} />}
                {activeRole === "OPERATOR" && <OperatorActivityTable role={activeRole} />}
                {activeRole === "CLIENT" && <CustomerActivityTable role={activeRole} />}
            </main>
        </section>
    );
}
