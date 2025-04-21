import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import NavBar from "../components/common/NavBar.jsx";
import InternalActivity from "../pages/InternalActivity.jsx";
import OperatorActivity from "../pages/OperatorActivity.jsx";
import CustomerActivity from "../pages/CustomerActivity.jsx";

export default function Hero() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeRole, setActiveRole] = useState("");
    const [userRole, setUserRole] = useState("");

    useEffect(() => {
        const roleInStorage = JSON.parse(localStorage.getItem("userDetail")).role;
        console.log(roleInStorage);

        if (!roleInStorage) {
            console.error("Debe iniciar sesión para acceder");
            navigate("/login", {state: {message: "Debe iniciar sesión para acceder"}});
        } else {
            setUserRole(roleInStorage);
            setActiveRole(roleInStorage);
        }

        if (location.state?.role) {
            setActiveRole(location.state.role);
            window.history.replaceState({}, document.title);
        }

    }, [location.state, navigate, userRole]);

    return (
        <section className="flex flex-col md:flex-row min-h-screen bg-background">
            <aside className="bg-card md:w-64">
                <NavBar role={userRole}/>
            </aside>

            <main className="flex-1 p-4">
                {activeRole === "ADMIN" && <InternalActivity role={activeRole}/>}
                {activeRole === "OPERATOR" && <OperatorActivity role={activeRole}/>}
                {activeRole === "CLIENT" && <CustomerActivity role={activeRole}/>}
            </main>
        </section>
    );
}
