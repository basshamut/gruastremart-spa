import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import NavBar from "../components/NavBar.jsx";
import InternalActivityTable from "../pages/InternalActivity.jsx";
import OperatorActivityTable from "../pages/OperatorActivity.jsx";
import CustomerActivityTable from "../pages/CustomerActivity.jsx";

export default function Hero({ role: userRole }) {
    const location = useLocation();
    const [activeRole, setActiveRole] = useState(userRole);

    // Detectar si hay un role en el state de la navegación
    useEffect(() => {
        if (location.state?.role) {
            setActiveRole(location.state.role);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

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
