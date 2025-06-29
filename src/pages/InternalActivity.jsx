import React, { useState, useEffect } from "react";
import { ReceiptText } from 'lucide-react';
import Pagination from "../components/common/Pagination";
import { usePaginatedDemands } from "../hooks/data/usePaginatedDemands";

export default function InternalActivity() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const userName = JSON.parse(localStorage.getItem("userDetail")).name
    console.log(userName);

    const {
        demands,
        loading,
        error,
        page,
        totalPages,
        pageSize,
        handlePageChange,
        handlePageSizeChange
    } = usePaginatedDemands(null, refreshTrigger, 10);

    return (
        <>
            <h1 className="text-2xl font-bold text-foreground">Bienvenido de nuevo {userName} !</h1>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                <div className="bg-card p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-primary-foreground">Actividad Reciente</h2>
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
                                {/* Desktop: tabla */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left border-collapse mt-2">
                                        <thead>
                                        <tr className="border-b">
                                            <th className="p-2">Descripción</th>
                                            <th className="p-2">Origen</th>
                                            <th className="p-2">Destino</th>
                                            <th className="p-2">Fecha</th>
                                            <th className="p-2">Estado</th>
                                            <th className="p-2">Detalles</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {demands.map(demand => (
                                            <tr key={demand.id} className="border-b">
                                                <td className="p-2">{demand.description}</td>
                                                <td className="p-2">{demand.currentLocation.name}</td>
                                                <td className="p-2">{demand.destinationLocation.name}</td>
                                                <td className="p-2">{new Date(demand.createdAt).toLocaleDateString()}</td>
                                                <td className="p-2">{demand.state}</td>
                                                <td className="p-2"><ReceiptText className="h-6 w-6 text-primary" /></td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile: tarjetas */}
                                <div className="md:hidden space-y-3 mt-2">
                                    {demands.map(demand => (
                                        <div key={demand.id} className="border rounded p-3 pb-1">
                                            <div className="font-medium text-sm mb-2 line-clamp-1">{demand.description}</div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="font-medium text-xs block text-muted-foreground">Origen</span>
                                                    <span className="line-clamp-1">{demand.currentLocation.name}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-xs block text-muted-foreground">Destino</span>
                                                    <span className="line-clamp-1">{demand.destinationLocation.name}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-xs block text-muted-foreground">Fecha</span>
                                                    <span>{new Date(demand.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-xs block text-muted-foreground">Estado</span>
                                                    <span>{demand.state}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-end mt-1">
                                                <ReceiptText className="h-5 w-5 text-primary" />
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

            {/* Resumen Mensual */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                <div className="bg-card p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-bold text-primary-foreground">Resumen Mensual</h2>
                    <div className="mt-4">
                        <p className="text-sm text-muted-foreground">No hay resumen disponible.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
