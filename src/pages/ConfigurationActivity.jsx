import { useState } from "react";
import SystemSettings from "../components/configuration/SystemSettings";
import UserSettings from "../components/configuration/UserSettings";

export default function ConfigurationActivity() {
    const [activeTab, setActiveTab] = useState("usuarios");

    return (
        <>
            <h1 className="text-2xl font-bold text-foreground">
                Configuraciones
            </h1>

            {/* Panel de tabs */}
            <div className="mt-6 mb-4 flex border-b border-gray-200">
                <button
                    className={`px-4 py-2 font-semibold focus:outline-none transition-colors duration-200 border-b-2 ${activeTab === "usuarios"
                            ? "border-green-600 text-green-600"
                            : "border-transparent text-gray-500 hover:text-green-600"
                        }`}
                    onClick={() => setActiveTab("usuarios")}
                >
                    Usuarios
                </button>
                <button
                    className={`ml-4 px-4 py-2 font-semibold focus:outline-none transition-colors duration-200 border-b-2 ${activeTab === "sistema"
                            ? "border-green-600 text-green-600"
                            : "border-transparent text-gray-500 hover:text-green-600"
                        }`}
                    onClick={() => setActiveTab("sistema")}
                >
                    Sistema
                </button>
            </div>

            {/* Contenido de los tabs */}
            {activeTab === "usuarios" && (
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                    <div className="bg-card p-4 rounded-lg shadow-md">
                        <UserSettings />
                    </div>
                </div>
            )}

            {activeTab === "sistema" && (
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                    <div className="bg-card p-4 rounded-lg shadow-md">
                        <SystemSettings />
                    </div>
                </div>
            )}
        </>
    );
}
