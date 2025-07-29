import { ReceiptText, TrendingUp, TrendingDown, Calendar, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import Pagination from "../components/common/Pagination";
import { usePaginatedDemands } from "../hooks/data/usePaginatedDemands";
import { useMonthlyStats } from "../hooks/data/useMonthlyStats";
import { useAutoRefresh } from "../hooks/data/useAutoRefresh";

export default function InternalActivity() {
    const userName = JSON.parse(localStorage.getItem("userDetail")).name
    
    // Hook para auto-refresh cada 30 segundos
    const { refreshTrigger } = useAutoRefresh(30);
    
    const activeList = usePaginatedDemands("ACTIVE", refreshTrigger, 10);
    const takenList = usePaginatedDemands("TAKEN", refreshTrigger, 10);
    const cancelledList = usePaginatedDemands("CANCELLED", refreshTrigger, 10);
    const completedList = usePaginatedDemands("COMPLETED", refreshTrigger, 10);
    const { stats, loading: statsLoading, error: statsError } = useMonthlyStats();

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
                                        <tr key={demand.id} className="border-b">
                                            <td className="p-2">{demand.description}</td>
                                            <td className="p-2">{demand.currentLocation.name}</td>
                                            <td className="p-2">{demand.destinationLocation.name}</td>
                                            <td className="p-2">
                                                <div className="text-sm">
                                                    {demand.vehicleBrand && demand.vehicleModel ? (
                                                        <>
                                                            <div className="font-medium">{demand.vehicleBrand} {demand.vehicleModel}</div>
                                                            {demand.vehicleYear && <div className="text-xs text-gray-600">{demand.vehicleYear}</div>}
                                                            {demand.vehiclePlate && <div className="text-xs text-gray-600">Placa: {demand.vehiclePlate}</div>}
                                                            {demand.vehicleColor && <div className="text-xs text-gray-600">{demand.vehicleColor}</div>}
                                                        </>
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
                                            <td className="p-2"><ReceiptText className="h-6 w-6 text-primary" /></td>
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
                                    
                                    {/* Información del vehículo en tarjetas móviles */}
                                    {(demand.vehicleBrand || demand.vehicleModel || demand.vehicleYear || 
                                      demand.vehiclePlate || demand.vehicleColor) && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                            <span className="font-medium text-xs block text-muted-foreground mb-1">Vehículo</span>
                                            <div className="text-sm">
                                                {demand.vehicleBrand && demand.vehicleModel && (
                                                    <div className="font-medium">{demand.vehicleBrand} {demand.vehicleModel}</div>
                                                )}
                                                <div className="text-xs text-gray-600 flex flex-wrap gap-2">
                                                    {demand.vehicleYear && <span>Año: {demand.vehicleYear}</span>}
                                                    {demand.vehiclePlate && <span>Placa: {demand.vehiclePlate}</span>}
                                                    {demand.vehicleColor && <span>Color: {demand.vehicleColor}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-end mt-1">
                                        <ReceiptText className="h-5 w-5 text-primary" />
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
                                            <p className="text-sm font-medium text-blue-600">Total Solicitudes</p>
                                            <p className="text-2xl font-bold text-blue-800">{stats.totalRequests}</p>
                                        </div>
                                        <Calendar className="h-8 w-8 text-blue-500" />
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

        </>
    );
}
