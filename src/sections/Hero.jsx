import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../components/common/NavBar.jsx";
import InternalActivity from "../pages/InternalActivity.jsx";
import OperatorActivity from "../pages/OperatorActivity.jsx";
import OperatorPaymentsActivity from "../pages/OperatorPaymentsActivity.jsx";
import CustomerActivity from "../pages/CustomerActivity.jsx";
import ConfigurationActivity from "../pages/ConfigurationActivity.jsx";
import ProfileActivity from "../pages/ProfileActivity.jsx";

export default function Hero() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeRole, setActiveRole] = useState("");
    const [userRole, setUserRole] = useState("");
    const [currentView, setCurrentView] = useState("");

    useEffect(() => {
        const roleInStorage = JSON.parse(localStorage.getItem("userDetail")).role;

        if (!roleInStorage) {
            console.error("Debe iniciar sesión para acceder");
            navigate("/login", { state: { message: "Debe iniciar sesión para acceder" } });
        } else {
            setUserRole(roleInStorage);
            setActiveRole(roleInStorage);
        }

        if (location.state?.role) {
            setActiveRole(location.state.role);
            window.history.replaceState({}, document.title);
        }

        // Determinar la vista actual basada en la URL
        const path = location.pathname;
        if (path === "/configurations") {
            setCurrentView("configurations");
        } else if (path === "/profiles") {
            setCurrentView("profiles");
        } else if (path === "/payments") {
            setCurrentView("payments");
        } else {
            setCurrentView("dashboard");
        }

    }, [location.state, location.pathname, navigate, userRole]);

    return (
        <section className="flex flex-col md:flex-row min-h-screen bg-background">
            <aside className="bg-card md:w-64">
                <NavBar role={userRole} />
            </aside>

            <main className="flex-1 p-4">
                {currentView === "configurations" ? (
                    <ConfigurationActivity />
                ) : currentView === "profiles" ? (
                    <ProfileActivity />
                ) : currentView === "payments" ? (
                    <OperatorPaymentsActivity />
                ) : (
                    <>
                        {activeRole === "ADMIN" && <InternalActivity role={activeRole} />}
                        {activeRole === "OPERATOR" && <OperatorActivity role={activeRole} />}
                        {activeRole === "CLIENT" && <CustomerActivity role={activeRole} />}
                    </>
                )}
            </main>
        </section>
    );
}
