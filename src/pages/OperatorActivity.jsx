import React, { useState, useEffect } from "react";
import Pagination from "../components/common/Pagination";
import { usePaginatedDemands } from "../hooks/usePaginatedDemands";
import { useCraneNotifications } from "../hooks/useCraneNotifications";

export default function OperatorActivity() {
    const token = localStorage.getItem("jwt");
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;

    // Estado para forzar la recarga de datos
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Estado para las notificaciones nuevas
    const [pendingNotifications, setPendingNotifications] = useState([]);
    const [hasNewNotifications, setHasNewNotifications] = useState(false);

    const {
        demands,
        loading,
        error,
        page,
        totalPages,
        pageSize,
        handlePageChange,
        handlePageSizeChange
    } = usePaginatedDemands(apiDomain, token, refreshTrigger, 10);

    // Función que se ejecutará cuando llegue una nueva notificación
    const handleNewDemand = (newCraneDemand) => {
        console.log("Nueva solicitud recibida:", newCraneDemand.dueDate);
        setPendingNotifications(prev => [...prev, newCraneDemand]);
        setHasNewNotifications(true);
    };

    // Conectamos al WebSocket usando el hook
    useCraneNotifications(handleNewDemand);

    // Efecto para refrescar automáticamente al recibir nuevas solicitudes
    useEffect(() => {
        if (hasNewNotifications) {
            const timer = setTimeout(() => {
                refreshData();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [hasNewNotifications]);

    const refreshData = () => {
        setRefreshTrigger(prev => prev + 1);
        setPendingNotifications([]);
        setHasNewNotifications(false);
    };

    return (
        <>
            <h1 className="text-2xl font-bold text-foreground">Bienvenido de nuevo!</h1>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                <div className="bg-card p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-primary-foreground">Solicitudes Abiertas</h2>
                        {pendingNotifications.length > 0 && (
                            <button
                                onClick={refreshData}
                                className="bg-primary text-white text-xs px-3 py-1 rounded-full flex items-center"
                            >
                                {pendingNotifications.length} nueva{pendingNotifications.length > 1 ? 's' : ''} • Ver
                            </button>
                        )}
                    </div>
                    <div className="mt-4">
                        {loading ? (
                            <p className="text-sm text-muted-foreground">Cargando...</p>
                        ) : error ? (
                            <p className="text-sm text-red-500">{error}</p>
                        ) : demands.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No hay actividad reciente.</p>
                        ) : (
                            <>
                                {/* Table for desktop */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left border-collapse mt-2">
                                        <thead>
                                        <tr className="border-b">
                                            <th className="p-2">Falla</th>
                                            <th className="p-2">Origen</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {demands.map((demand) => (
                                            <tr key={demand.id} className="border-b">
                                                <td className="p-2">{demand.breakdown}</td>
                                                <td className="p-2">{demand.origin}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Cards for mobile */}
                                <div className="md:hidden space-y-2 mt-2">
                                    {demands.map((demand) => (
                                        <div key={demand.id} className="border rounded p-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <span className="font-medium text-xs block text-muted-foreground">Falla</span>
                                                    <span className="line-clamp-1">{demand.breakdown}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-xs block text-muted-foreground">Origen</span>
                                                    <span className="line-clamp-1">{demand.origin}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Pagination
                                    page={page}
                                    totalPages={totalPages}
                                    pageSize={pageSize}
                                    onPageChange={handlePageChange}
                                    onPageSizeChange={handlePageSizeChange}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
