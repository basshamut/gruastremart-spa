import { ReceiptText, TrendingUp, TrendingDown, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import { usePaginatedDemands } from "../hooks/data/usePaginatedDemands";
import { useMonthlyStats } from "../hooks/data/useMonthlyStats";
import { useAutoRefresh } from "../hooks/data/useAutoRefresh";
import { usePriceCalculation } from "../hooks/data/usePriceCalculation";
import { formatDate, calculateDistance } from "../utils/Utils";
import { useState } from "react";

export default function InternalActivity() {
    const userName = JSON.parse(localStorage.getItem("userDetail")).name
    
    // Hook para auto-refresh cada 30 segundos
    const { refreshTrigger } = useAutoRefresh(30);
    
    const activeList = usePaginatedDemands("ACTIVE", refreshTrigger, 10);
    const takenList = usePaginatedDemands("TAKEN", refreshTrigger, 10);
    const cancelledList = usePaginatedDemands("CANCELLED", refreshTrigger, 10);
    const completedList = usePaginatedDemands("COMPLETED", refreshTrigger, 10);
    const { stats, loading: statsLoading, error: statsError } = useMonthlyStats();
    
    // Estados para el modal de detalles
    const [selectedDemand, setSelectedDemand] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    
    // Hook centralizado para cálculos de precios
    const { 
        calculateAutomaticPrice, 
        formatPrice, 
        getPriceSourceText, 
        pricingOptions
    } = usePriceCalculation();



    // Función para abrir el modal de detalles
    const openDetailsModal = (demand) => {
        setSelectedDemand(demand);
        setModalOpen(true);
    };

    // Función para cerrar el modal
    const closeModal = () => {
        setModalOpen(false);
        setSelectedDemand(null);
    };



    // Función para obtener el badge de estado
    const getStatusBadge = (state) => {
        const badges = {
            ACTIVE: { text: "Activa", class: "bg-blue-100 text-blue-800" },
            TAKEN: { text: "Asignada", class: "bg-green-100 text-green-800" },
            CANCELLED: { text: "Cancelada", class: "bg-red-100 text-red-800" },
            COMPLETED: { text: "Completada", class: "bg-purple-100 text-purple-800" }
        };
        const badge = badges[state] || { text: state, class: "bg-gray-100 text-gray-800" };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.class}`}>
                {badge.text}
            </span>
        );
    };

    // Función helper para renderizar tabla de solicitudes
    const renderDemandTable = (demandList, title, emptyMessage) => (
        <div className="bg-card p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-primary-foreground">{title}</h2>
                {demandList.demands.length > 0 && (
                    <div className="text-xs text-gray-500 space-y-1">
                        <div>Última actualización: {new Date().toLocaleTimeString()}</div>
                        <div className="flex items-center text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                            Actualización cada 30s
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-4">
                {demandList.loading ? (
                    <p className="text-sm text-muted-foreground">Cargando...</p>
                ) : demandList.error ? (
                    <p className="text-sm text-red-500">{demandList.error}</p>
                ) : demandList.demands.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{emptyMessage}</p>
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
                                        <th className="p-2">Vehículo</th>
                                        <th className="p-2">Fecha</th>
                                        <th className="p-2">Estado</th>
                                        <th className="p-2">Detalles</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {demandList.demands.map(demand => (
                                        <tr key={demand.id} className="border-b hover:bg-gray-50">
                                            <td className="p-2">{demand.description}</td>
                                            <td className="p-2">{demand.currentLocation.name}</td>
                                            <td className="p-2">{demand.destinationLocation.name}</td>
                                            <td className="p-2">
                                                <div className="text-sm">
                                                    <div className="font-medium">{demand.carType}</div>
                                                    {demand.vehicleWeight ? (
                                                        <div className="text-xs text-gray-500">{demand.vehicleWeight} kg</div>
                                                    ) : (
                                                        <span className="text-gray-400">No especificado</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-2">{new Date(demand.createdAt).toLocaleDateString()}</td>
                                            <td className="p-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    demand.state === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                                                    demand.state === 'TAKEN' ? 'bg-green-100 text-green-800' :
                                                    demand.state === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                                                    demand.state === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {demand.state === 'ACTIVE' ? 'Activa' :
                                                     demand.state === 'TAKEN' ? 'Asignada' :
                                                     demand.state === 'COMPLETED' ? 'Completada' :
                                                     demand.state === 'CANCELLED' ? 'Cancelada' :
                                                     demand.state}
                                                </span>
                                            </td>
                                            <td className="p-2">
                                                <button
                                                    onClick={() => openDetailsModal(demand)}
                                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                                >
                                                    <ReceiptText className="h-6 w-6" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile: tarjetas */}
                        <div className="md:hidden space-y-3 mt-2">
                            {demandList.demands.map(demand => (
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
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                demand.state === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                                                demand.state === 'TAKEN' ? 'bg-green-100 text-green-800' :
                                                demand.state === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                                                demand.state === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {demand.state === 'ACTIVE' ? 'Activa' :
                                                 demand.state === 'TAKEN' ? 'Asignada' :
                                                 demand.state === 'COMPLETED' ? 'Completada' :
                                                 demand.state === 'CANCELLED' ? 'Cancelada' :
                                                 demand.state}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex justify-end">
                                        <button
                                            onClick={() => openDetailsModal(demand)}
                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors"
                                        >
                                            Ver detalles
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Pagination
                            page={demandList.page}
                            totalPages={demandList.totalPages}
                            pageSize={demandList.pageSize}
                            onPageChange={demandList.handlePageChange}
                            onPageSizeChange={demandList.handlePageSizeChange}
                        />
                    </>
                )}
            </div>
        </div>
    );

    return (
        <>
            <h1 className="text-2xl font-bold text-foreground">Bienvenido de nuevo {userName} !</h1>
            
            {/* Resumen Mensual */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                <div className="bg-card p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-bold text-primary-foreground">Resumen Mensual</h2>
                    <div className="mt-4">
                        {statsLoading ? (
                            <p className="text-sm text-muted-foreground">Cargando estadísticas...</p>
                        ) : statsError ? (
                            <p className="text-sm text-red-500">{statsError}</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Total de Solicitudes */}
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-green-600">Total Solicitudes</p>
                                            <p className="text-2xl font-bold text-blue-800">{stats.totalRequests}</p>
                                        </div>
                                        <Calendar className="h-8 w-8 text-green-500" />
                                    </div>
                                    <div className="mt-2 flex items-center">
                                        {stats.monthlyTrend >= 0 ? (
                                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                                        )}
                                        <span className={`text-sm ${stats.monthlyTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {Math.abs(stats.monthlyTrend)}% vs mes anterior
                                        </span>
                                    </div>
                                </div>

                                {/* Solicitudes Completadas */}
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-green-600">Completadas</p>
                                            <p className="text-2xl font-bold text-green-800">{stats.completedRequests}</p>
                                        </div>
                                        <CheckCircle className="h-8 w-8 text-green-500" />
                                    </div>
                                    <p className="text-xs text-green-600 mt-2">
                                        Tasa de finalización: {stats.completionRate}%
                                    </p>
                                </div>

                                {/* Solicitudes En Proceso */}
                                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-yellow-600">En Proceso</p>
                                            <p className="text-2xl font-bold text-yellow-800">
                                                {stats.activeRequests + stats.takenRequests}
                                            </p>
                                        </div>
                                        <Clock className="h-8 w-8 text-yellow-500" />
                                    </div>
                                    <p className="text-xs text-yellow-600 mt-2">
                                        Activas: {stats.activeRequests} | Asignadas: {stats.takenRequests}
                                    </p>
                                </div>

                                {/* Promedio Diario */}
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-purple-600">Promedio Diario</p>
                                            <p className="text-2xl font-bold text-purple-800">{stats.dailyAverage}</p>
                                        </div>
                                        <AlertCircle className="h-8 w-8 text-purple-500" />
                                    </div>
                                    <p className="text-xs text-purple-600 mt-2">
                                        Canceladas: {stats.cancelledRequests}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Solicitudes Activas */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                {renderDemandTable(activeList, "Solicitudes Activas", "No hay solicitudes activas.")}
            </div>

            {/* Solicitudes Asignadas */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                {renderDemandTable(takenList, "Solicitudes Asignadas", "No hay solicitudes asignadas.")}
            </div>

            {/* Solicitudes Completadas */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                {renderDemandTable(completedList, "Solicitudes Completadas", "No hay solicitudes completadas.")}
            </div>

            {/* Solicitudes Canceladas */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                {renderDemandTable(cancelledList, "Solicitudes Canceladas", "No hay solicitudes canceladas.")}
            </div>

            {/* Modal de detalles */}
            {modalOpen && selectedDemand && (
                <Modal
                    isOpen={modalOpen}
                    onClose={closeModal}
                    title="Detalles de la Asignación"
                >
                    <div className="space-y-4">
                        {/* Información principal */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-bold text-lg text-gray-800 mb-3">{selectedDemand.origin}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Estado:</span>
                                    <div className="mt-1">{getStatusBadge(selectedDemand.state)}</div>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Tipo de vehículo:</span>
                                    <p className="text-gray-800">{selectedDemand.carType}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Fecha:</span>
                                    <p className="text-gray-800">{formatDate(selectedDemand.createdAt)}</p>
                                </div>
                                {selectedDemand.assignedOperatorId && (
                                    <div>
                                        <span className="font-medium text-gray-700">Operador:</span>
                                        <p className="text-gray-800">{selectedDemand.assignedOperatorId}</p>
                                    </div>
                                )}
                                {selectedDemand.vehicleWeight && (
                                    <div>
                                        <span className="font-medium text-gray-700">Peso del vehículo:</span>
                                        <p className="text-gray-800">{selectedDemand.vehicleWeight} kg</p>
                                    </div>
                                )}
                                {selectedDemand.distance && (
                                    <div>
                                        <span className="font-medium text-gray-700">Distancia:</span>
                                        <p className="text-gray-800">{selectedDemand.distance} km</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Descripción y avería */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selectedDemand.description && (
                                <div>
                                    <span className="font-medium text-gray-700 text-sm">Descripción:</span>
                                    <p className="text-gray-800 mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                                        {selectedDemand.description}
                                    </p>
                                </div>
                            )}
                            {selectedDemand.breakdown && (
                                <div>
                                    <span className="font-medium text-gray-700 text-sm">Tipo de avería:</span>
                                    <p className="text-gray-800 mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                                        {selectedDemand.breakdown}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Ubicaciones */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selectedDemand.currentLocation && (
                                <div>
                                    <span className="font-medium text-gray-700 text-sm">📍 Ubicación actual:</span>
                                    <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-gray-800 text-sm font-medium">{selectedDemand.currentLocation.name || 'Sin nombre'}</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {selectedDemand.currentLocation.latitude?.toFixed(6)}, {selectedDemand.currentLocation.longitude?.toFixed(6)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {selectedDemand.destinationLocation && (
                                <div>
                                    <span className="font-medium text-gray-700 text-sm">🎯 Destino:</span>
                                    <div className="mt-1 p-3 bg-green-50 rounded-lg">
                                        <p className="text-gray-800 text-sm font-medium">{selectedDemand.destinationLocation.name || 'Sin nombre'}</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {selectedDemand.destinationLocation.latitude?.toFixed(6)}, {selectedDemand.destinationLocation.longitude?.toFixed(6)}
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            {/* Mostrar distancia calculada si tenemos ambas ubicaciones */}
                            {selectedDemand.currentLocation && selectedDemand.destinationLocation && (
                                <div className="sm:col-span-2">
                                    <span className="font-medium text-gray-700 text-sm">📏 Distancia:</span>
                                    <div className="mt-1 p-3 bg-purple-50 rounded-lg">
                                        <p className="text-gray-800 text-sm font-medium">
                                            {selectedDemand.distance || calculateDistance(
                                                selectedDemand.currentLocation.latitude,
                                                selectedDemand.currentLocation.longitude,
                                                selectedDemand.destinationLocation.latitude,
                                                selectedDemand.destinationLocation.longitude
                                            )} km
                                            {!selectedDemand.distance && (
                                                <span className="text-xs text-purple-600 ml-2">(calculada automáticamente)</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>



                        {/* Cálculo del viaje */}
                        {(() => {
                            // Calcular distancia si no está disponible
                            const distance = selectedDemand.distance || 
                                (selectedDemand.currentLocation && selectedDemand.destinationLocation ? 
                                    calculateDistance(
                                        selectedDemand.currentLocation.latitude,
                                        selectedDemand.currentLocation.longitude,
                                        selectedDemand.destinationLocation.latitude,
                                        selectedDemand.destinationLocation.longitude
                                    ) : null);
                            
                            const priceCalculation = calculateAutomaticPrice(selectedDemand);
                            return priceCalculation && priceCalculation.isValid ? (
                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="font-medium text-gray-700 mb-3">💰 Cálculo del Viaje</h4>
                                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <span className="font-medium text-green-800 text-sm">Categoría de peso:</span>
                                                <p className="text-green-700">{priceCalculation.weightCategory}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-green-800 text-sm">Tipo de servicio:</span>
                                                <p className="text-green-700 capitalize">{priceCalculation.serviceType.replace('_', ' ')}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-green-800 text-sm">Distancia total:</span>
                                                <p className="text-green-700">{priceCalculation.distance?.toFixed(2)} km</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-green-800 text-sm">Precio total:</span>
                                                <p className="text-green-700 font-bold text-lg">{formatPrice(priceCalculation.totalPrice)}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Información del origen del precio */}
                                        <div className="mt-3 pt-3 border-t border-green-300">
                                            <p className="text-xs text-green-600">
                                                {getPriceSourceText(priceCalculation.priceSource)}
                                            </p>
                                        </div>

                                        {/* Desglose del cálculo */}
                                        <div className="mt-4 pt-3 border-t border-green-300">
                                            <h5 className="font-medium text-green-800 text-sm mb-2">Desglose del cálculo:</h5>
                                            {priceCalculation.serviceType === 'urbano' ? (
                                                <div className="text-sm text-green-700">
                                                    <p>• Servicio urbano (≤8 km): <span className="font-medium">{formatPrice(priceCalculation.breakdown.urbanPrice)}</span></p>
                                                    <p className="text-xs text-green-600 mt-1">Precio fijo para servicios dentro del área urbana</p>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-green-700 space-y-1">
                                                    <p>• Precio base: <span className="font-medium">{formatPrice(priceCalculation.breakdown.basePrice)}</span></p>
                                                    <p>• Distancia extra: <span className="font-medium">{priceCalculation.breakdown.extraDistance} km</span></p>
                                                    <p>• Tarifa por km adicional: <span className="font-medium">{formatPrice(priceCalculation.breakdown.pricePerKm)}/km</span></p>
                                                    <p>• Costo adicional: <span className="font-medium">{formatPrice(priceCalculation.breakdown.extraCost)}</span></p>
                                                    <div className="border-t border-green-300 pt-2 mt-2">
                                                        <p className="font-medium">Total: {formatPrice(priceCalculation.breakdown.basePrice)} + {formatPrice(priceCalculation.breakdown.extraCost)} = {formatPrice(priceCalculation.totalPrice)}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                selectedDemand.distance || selectedDemand.vehicleWeight ? (
                                    <div className="border-t border-gray-200 pt-4">
                                        <h4 className="font-medium text-gray-700 mb-3">💰 Cálculo del Viaje</h4>
                                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                            <p className="text-yellow-800 text-sm">
                                                No se puede calcular el precio automáticamente.
                                            </p>
                                            <div className="text-xs text-yellow-700 mt-2">
                                                <p className="font-medium mb-1">Datos faltantes:</p>
                                                {!distance && !selectedDemand.currentLocation && <p>• Falta información de distancia y ubicaciones</p>}
                                                {!distance && selectedDemand.currentLocation && !selectedDemand.destinationLocation && <p>• Falta ubicación de destino</p>}
                                                {!distance && !selectedDemand.currentLocation && selectedDemand.destinationLocation && <p>• Falta ubicación actual</p>}
                                                {!selectedDemand.vehicleWeight && <p>• Falta información del peso del vehículo</p>}
                                                {pricingOptions.length === 0 && <p>• No hay categorías de precio configuradas</p>}
                                            </div>
                                        </div>
                                    </div>
                                ) : null
                            );
                        })()}
                    </div>
                </Modal>
            )}
        </>
    );
}
