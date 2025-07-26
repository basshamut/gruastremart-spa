import { useState } from "react";
import SecuritySettings from "../components/configuration/SecuritySettings";

export default function ProfileActivity() {
    const [activeTab, setActiveTab] = useState("seguridad");

    return (
        <>
            <h1 className="text-2xl font-bold text-foreground">
                Perfil
            </h1>

            {/* Panel de tabs */}
            <div className="mt-6 mb-4 flex border-b border-gray-200">
                <button
                    className={`px-4 py-2 font-semibold focus:outline-none transition-colors duration-200 border-b-2 
                        ${activeTab === "seguridad"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-blue-600"
                        }`}
                    onClick={() => setActiveTab("seguridad")}
                >
                    Seguridad
                </button>
            </div>

            {/* Contenido de los tabs */}
            {activeTab === "seguridad" && (
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                    <div className="bg-card p-4 rounded-lg shadow-md">
                        <SecuritySettings />
                    </div>
                </div>
            )}
        </>
    );
}
