import React from "react";
import NavBar from "../components/NavBar.jsx";
import InternalActivityTable from "../components/InternalActivityTable.jsx";

export default function Hero(props) {
    const { role } = props;
    return (
        <section className="flex flex-col md:flex-row min-h-screen bg-background">
            {/* Barra lateral */}
            <aside className="bg-card md:w-64">
                <NavBar role={role} />
            </aside>

            {/* Contenido principal */}
            <main className="flex-1 p-4">
                <InternalActivityTable role={role} />
            </main>
        </section>
    );
}
