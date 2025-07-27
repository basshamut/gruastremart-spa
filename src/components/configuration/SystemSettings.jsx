import React, { useState } from "react";
import { Settings, Save, RefreshCw } from "lucide-react";

export default function SystemSettings() {
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
            alert("Configuraciones guardadas exitosamente");
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
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tiempo Máximo de Espera (minutos)
                            </label>
                            <input
                                type="number"
                                value={settings.maxWaitTime}
                                onChange={(e) => handleInputChange('maxWaitTime', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Configuraciones de Operación */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Configuraciones de Operación</h3>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="maintenanceMode"
                                checked={settings.maintenanceMode}
                                onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                                Modo de Mantenimiento
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="autoAssignOperators"
                                checked={settings.autoAssignOperators}
                                onChange={(e) => handleInputChange('autoAssignOperators', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="autoAssignOperators" className="ml-2 block text-sm text-gray-900">
                                Asignación Automática de Operadores
                            </label>
                        </div>
                    </div>
                </div>

                {/* Configuraciones de Notificaciones */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Configuraciones de Notificaciones</h3>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="emailNotifications"
                                checked={settings.emailNotifications}
                                onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                                Notificaciones por Email
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="smsNotifications"
                                checked={settings.smsNotifications}
                                onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-900">
                                Notificaciones por SMS
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
