import React, { useState } from "react";
import { Settings, Save, RefreshCw } from "lucide-react";
import ToastContainer from "../common/ToastContainer";
import { useToast } from "../../hooks/common/useToast.js";

export default function SystemSettings() {
    // Hook para notificaciones
    const { toasts, showSuccess, removeToast } = useToast();

    const [settings, setSettings] = useState({
        defaultRadius: 5000,
        maintenanceMode: false,
        emailNotifications: true,
        smsNotifications: false,
        autoAssignOperators: true,
        maxWaitTime: 30,
    });

    const [loading, setLoading] = useState(false);

    const handleInputChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        // Simular guardado
        setTimeout(() => {
            setLoading(false);
            showSuccess("Configuraciones guardadas exitosamente");
        }, 1000);
    };

    const handleReset = () => {
        if (window.confirm("¿Estás seguro de que deseas restablecer todas las configuraciones?")) {
            setSettings({
                appName: "GruasTreMart",
                maxRequestsPerDay: 10,
                defaultRadius: 5000,
                maintenanceMode: false,
                emailNotifications: true,
                smsNotifications: false,
                autoAssignOperators: true,
                maxWaitTime: 30,
            });
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Configuraciones del Sistema
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                        onClick={handleReset}
                        className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Restablecer
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Información del Sistema */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Información del Sistema</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Versión</p>
                            <p className="text-lg font-semibold">1.0.0</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Última Actualización</p>
                            <p className="text-lg font-semibold">26/07/2025</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Estado del Sistema</p>
                            <p className="text-lg font-semibold text-green-600">Operativo</p>
                        </div>
                    </div>
                </div>

                {/* Configuraciones Generales */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Configuraciones Generales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Radio por Defecto (metros)
                            </label>
                            <input
                                type="number"
                                value={settings.defaultRadius}
                                onChange={(e) => handleInputChange('defaultRadius', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                readOnly
                                disabled
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Container para notificaciones */}
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </div>
    );
}
