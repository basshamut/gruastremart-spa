import React, {useState, useEffect} from "react";

import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import {usePaginatedDemands} from "../hooks/data/usePaginatedDemands";
import {useOperatorActivity} from "../hooks/data/useOperatorActivity";
import {useOperatorLocationService} from "../hooks/location/useOperatorLocationService";
import {assignCraneDemand} from "../services/CraneDemandService.js";
import {formatDate} from "../utils/Utils.js";
import { LOCATION_UPDATE_INTERVAL } from "../config/constants.js";

export default function OperatorActivity() {
    // Estados específicos del componente
    const [selectedDemand, setSelectedDemand] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [showConfirmButton, setShowConfirmButton] = useState(true);
    const [previousLocation, setPreviousLocation] = useState(null);
    const [assignedOperatorId, setAssignedOperatorId] = useState(null);

    // Obtener el ID del usuario desde localStorage
    const userId = JSON.parse(localStorage.getItem("userDetail"))?.id;
    
    // Debug: verificar qué ID se está usando
    console.log("🔍 Debug - userDetail:", JSON.parse(localStorage.getItem("userDetail")));
    console.log("🔍 Debug - userId:", userId);

    // Función para obtener el assignedOperatorId de las demandas tomadas
    const fetchAssignedOperatorId = async () => {
        try {
            const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
            const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

            // Buscar demandas tomadas por este operador
            const response = await fetch(`${apiDomain}/v1/crane-demands?page=0&size=10&state=TAKEN&assignedOperatorId=${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.content && data.content.length > 0) {
                    const takenDemand = data.content[0];
                    console.log("🔍 Debug - Demanda tomada encontrada:", takenDemand);
                    console.log("🔍 Debug - assignedOperatorId:", takenDemand.assignedOperatorId);
                    return takenDemand.assignedOperatorId;
                }
            }
            
            // Si no hay demandas tomadas, usar el ID del usuario como fallback
            console.log("⚠️ No hay demandas tomadas, usando ID de usuario como fallback:", userId);
            return userId;
        } catch (err) {
            console.error("❌ Error obteniendo assignedOperatorId:", err);
            return userId;
        }
    };

    // Obtener el assignedOperatorId cuando se monta el componente
    useEffect(() => {
        const getAssignedOperatorId = async () => {
            const id = await fetchAssignedOperatorId();
            setAssignedOperatorId(id);
            console.log("🔍 Debug - assignedOperatorId final:", id);
        };
        
        if (userId) {
            getAssignedOperatorId();
        }
    }, [userId]);

    // Hook personalizado que maneja toda la lógica de actividad del operador
    const {
        countdown,
        pendingNotificationsForActiveDemands,
        hasNewNotifications,
        refreshTrigger,
        refreshData,
        startTracking,
        stopTracking
    } = useOperatorActivity(30, 30, 5000); // 30s intervalo, 30s countdown, 5s delay

    const activeDemands = usePaginatedDemands("ACTIVE", refreshTrigger, 50);
    const takenDemands = usePaginatedDemands("TAKEN", refreshTrigger, 50);

    // Obtener el ID de la primera solicitud tomada (si existe)
    const takenDemandId = takenDemands.demands.length > 0 ? takenDemands.demands[0].id : null;

    // Hook para seguimiento de ubicación del operador usando endpoints REST
    const {
        location: operatorLocation,
        status: operatorStatus,
        error: locationError,
        isLoading: locationLoading,
        isUpdating: locationUpdating,
        updateLocationFromGPS,
        startAutoUpdate,
        stopAutoUpdate
    } = useOperatorLocationService(assignedOperatorId, LOCATION_UPDATE_INTERVAL, assignedOperatorId ? true : false); // Usar variable configurable

    const userName = JSON.parse(localStorage.getItem("userDetail")).name

    // Iniciar automáticamente el tracking cuando el operador se logea
    useEffect(() => {
        if (assignedOperatorId) {
            startAutoUpdate();
        }
    }, [assignedOperatorId, startAutoUpdate]);

    // Detener el tracking solo cuando el operador se desconecta
    useEffect(() => {
        return () => {
            if (assignedOperatorId) {
                stopAutoUpdate();
            }
        };
    }, [assignedOperatorId, stopAutoUpdate]);

    // Guardar la ubicación anterior cada vez que cambia la actual
    useEffect(() => {
        if (operatorLocation && operatorLocation.lat && operatorLocation.lng) {
            setPreviousLocation((prev) => {
                // Solo actualizar si la ubicación realmente cambió
                if (!prev || !prev.lat || !prev.lng || prev.lat !== operatorLocation.lat || prev.lng !== operatorLocation.lng) {
                    return operatorLocation;
                }
                return prev;
            });
        }
    }, [operatorLocation]);

    const openModal = (demand, modalType) => {
        setSelectedDemand(demand);
        setIsModalOpen(true);
        if (modalType === "SHOW") {
            setShowConfirmButton(false);
        }

        if (modalType === "ASSIGN") {
            setShowConfirmButton(true);
        }
    };

    const closeModal = () => {
        setSelectedDemand(null);
        setIsModalOpen(false);
        setModalError(null);
    };

    const takeDemand = async () => {
        try {
            await assignCraneDemand(selectedDemand)
            setModalError(null);
            closeModal();
            document.location.reload();
        } catch (error) {
            console.error(error);
            setModalError(`${error}`);
        }
    };

    return (
        <>
            <h1 className="text-2xl font-bold text-foreground">Bienvenido de nuevo {userName} !</h1>

            {/* Panel flotante de coordenadas del operador */}
            <div className="mt-4 bg-white bg-opacity-95 rounded-lg shadow-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-gray-700 text-sm mb-2">📍 Ubicación Actual del Operador</h3>
                        <div className="text-[10px] text-green-600 mb-2">
                            ✅ Tracking activo desde el login - Ubicación se actualiza cada {LOCATION_UPDATE_INTERVAL}s
                        </div>
                        
                        {locationError ? (
                            <div className="text-xs text-red-600 space-y-1">
                                <div className="font-semibold">Error de ubicación:</div>
                                <div>{locationError}</div>
                                <div className="mt-2 pt-2 border-t border-red-200">
                                    <div className="font-semibold text-red-700">
                                        Próximo intento en: {countdown}s
                                    </div>
                                    <div className="w-full bg-red-200 rounded-full h-1 mt-1">
                                        <div 
                                            className="bg-red-500 h-1 rounded-full transition-all duration-1000"
                                            style={{ width: `${((LOCATION_UPDATE_INTERVAL - countdown) / LOCATION_UPDATE_INTERVAL) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ) : locationLoading ? (
                            <div className="text-xs text-blue-600 space-y-1">
                                <div className="font-semibold">Obteniendo ubicación GPS...</div>
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-2"></div>
                                    <span>Esperando respuesta del GPS</span>
                                </div>
                                <div className="text-[10px] text-gray-500 mt-1">
                                    Esto puede tomar unos segundos...
                                </div>
                            </div>
                        ) : !operatorLocation ? (
                            <>
                                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                                <p className="text-xs text-blue-600 mt-1">Iniciando</p>
                            </>
                        ) : (
                            <div className="text-xs text-gray-800 space-y-1 mt-2">
                                {operatorLocation.lat && operatorLocation.lng ? (
                                    <>
                                <div>
                                            <span className="font-semibold">Latitud:</span> {operatorLocation.lat.toFixed(6)}
                                </div>
                                <div>
                                            <span className="font-semibold">Longitud:</span> {operatorLocation.lng.toFixed(6)}
                                </div>
                                <div>
                                    <span className="font-semibold">Precisión:</span> {operatorLocation.accuracy ? `${operatorLocation.accuracy.toFixed(1)}m` : 'N/A'}
                                </div>
                                <div>
                                    <span className="font-semibold">Última actualización:</span> {new Date(operatorLocation.timestamp).toLocaleTimeString()}
                                </div>
                                        {locationUpdating && (
                                            <div className="text-[10px] text-blue-600 mt-1">
                                                🔄 Actualizando ubicación...
                                            </div>
                                        )}
                                {previousLocation &&
                                            previousLocation.lat && previousLocation.lng &&
                                            (previousLocation.lat !== operatorLocation.lat || previousLocation.lng !== operatorLocation.lng) && (
                                        <div className="text-[11px] text-gray-400 mt-1">
                                                    <span className="font-semibold">Anterior:</span> {previousLocation.lat.toFixed(6)}, {previousLocation.lng.toFixed(6)}
                                        </div>
                                    )
                                }
                                    </>
                                ) : (
                                    <div className="text-xs text-gray-600 space-y-1">
                                        <div className="font-semibold">Estado del GPS:</div>
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                                            <span>Esperando coordenadas GPS</span>
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-1">
                                            {operatorLocation.timestamp && (
                                                <>Última actividad: {new Date(operatorLocation.timestamp).toLocaleTimeString()}</>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {operatorStatus && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                        <div className="font-semibold text-gray-700">Estado del operador:</div>
                                        <div className="text-[10px] text-gray-600">
                                            {operatorStatus.isOnline ? '🟢 En línea' : '🔴 Desconectado'}
                                        </div>
                                        {operatorStatus.lastSeen && (
                                            <div className="text-[10px] text-gray-500">
                                                Última actividad: {new Date(operatorStatus.lastSeen).toLocaleTimeString()}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        {locationError ? (
                            <>
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <p className="text-xs text-red-600 mt-1">Error</p>
                            </>
                        ) : locationLoading ? (
                            <>
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                <p className="text-xs text-blue-600 mt-1">Obteniendo</p>
                            </>
                        ) : !operatorLocation ? (
                            <>
                                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                                <p className="text-xs text-blue-600 mt-1">Iniciando</p>
                            </>
                        ) : operatorLocation.lat && operatorLocation.lng ? (
                            <>
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-xs text-green-600 mt-1">En línea</p>
                            </>
                        ) : (
                            <>
                                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                                <p className="text-xs text-yellow-600 mt-1">Esperando GPS</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                <div className="bg-card p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-primary-foreground">
                            Solicitudes Activas
                            {activeDemands.demands.length > 0 && (
                                <span className="ml-2 text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                    {activeDemands.demands.length}
                                </span>
                            )}
                        </h2>
                        <div className="flex items-center gap-2">
                        {pendingNotificationsForActiveDemands.length > 0 && (
                            <button
                                onClick={refreshData}
                                    className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full flex items-center hover:bg-orange-600 transition-colors"
                            >
                                {pendingNotificationsForActiveDemands.length} nueva{pendingNotificationsForActiveDemands.length > 1 ? 's' : ''} •
                                    Actualizar
                            </button>
                        )}
                            {activeDemands.demands.length > 0 && (
                                <div className="text-xs text-gray-500">
                                    Última actualización: {new Date().toLocaleTimeString()}
                                </div>
                            )}
                        </div>
                    </div>

                    {activeDemands.loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mr-3"></div>
                            <p className="text-sm text-muted-foreground">Buscando solicitudes activas...</p>
                        </div>
                    ) : activeDemands.error ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-red-500 mb-2">{activeDemands.error}</p>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : activeDemands.demands.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">📋</div>
                            <p className="text-sm text-muted-foreground">No hay solicitudes activas disponibles.</p>
                            <p className="text-xs text-gray-500 mt-1">Las nuevas solicitudes aparecerán aquí automáticamente.</p>
                        </div>
                    ) : (
                        <>
                            <div className="mt-4 space-y-4">
                                {activeDemands.demands.map((demand) => {
                                    const createdAt = new Date(demand.createdAt);
                                    const timeAgo = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60)); // minutos
                                    
                                    // Determinar prioridad basada en el tiempo transcurrido
                                    const isUrgent = timeAgo > 30; // Más de 30 minutos
                                    const isHighPriority = timeAgo > 15; // Más de 15 minutos
                                    
                                    return (
                                        <div key={demand.id} className={`border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow ${
                                            isUrgent ? 'border-orange-300 bg-orange-50' : 
                                            isHighPriority ? 'border-yellow-300 bg-yellow-50' : ''
                                        }`}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-bold text-gray-800">{demand.origin}</h3>
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                            Disponible
                                                        </span>
                                                        {isUrgent && (
                                                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                                                ⚠️ Urgente
                                                            </span>
                                                        )}
                                                        {isHighPriority && !isUrgent && (
                                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                                                ⏰ Prioritaria
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                        <div>
                                                            <span className="font-medium">Tipo de vehículo:</span> {demand.carType}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Fecha:</span> {formatDate(demand.createdAt)}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Tiempo transcurrido:</span> 
                                                            <span className={isUrgent ? 'text-red-600 font-semibold' : 
                                                                           isHighPriority ? 'text-yellow-600' : 'text-gray-600'}>
                                                                {timeAgo < 1 ? 'Menos de 1 min' : 
                                                                 timeAgo < 60 ? `${timeAgo} min` : 
                                                                 `${Math.floor(timeAgo / 60)}h ${timeAgo % 60}min`}
                                                            </span>
                                                        </div>
                                                        {demand.breakdown && (
                                            <div>
                                                                <span className="font-medium">Avería:</span> {demand.breakdown}
                                                            </div>
                                                        )}
                                                        {demand.description && (
                                                            <div className="md:col-span-2">
                                                                <span className="font-medium">Descripción:</span> 
                                                                <span className="text-gray-700 ml-1">{demand.description}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                            </div>
                                                <div className="flex flex-col gap-2 ml-4">
                                            <button
                                                onClick={() => openModal(demand, "ASSIGN")}
                                                        className={`px-4 py-2 text-white rounded text-sm transition-colors ${
                                                            isUrgent ? 'bg-red-500 hover:bg-red-600' :
                                                            isHighPriority ? 'bg-yellow-500 hover:bg-yellow-600' :
                                                            'bg-blue-500 hover:bg-blue-600'
                                                        }`}
                                                    >
                                                        {isUrgent ? '🚨 Tomar Urgente' : 
                                                         isHighPriority ? '⏰ Tomar Ahora' : 'Tomar'}
                                            </button>
                                                    {demand.currentLocation && (
                                                        <div className="text-xs text-gray-500 text-center">
                                                            📍 Con ubicación
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <Pagination
                                page={activeDemands.page}
                                totalPages={activeDemands.totalPages}
                                pageSize={activeDemands.pageSize}
                                onPageChange={activeDemands.handlePageChange}
                                onPageSizeChange={activeDemands.handlePageSizeChange}
                            />
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                <div className="bg-card p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-primary-foreground">
                            Solicitudes Asignadas
                            {takenDemands.demands.length > 0 && (
                                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    {takenDemands.demands.length}
                                </span>
                            )}
                        </h2>
                        {takenDemands.demands.length > 0 && (
                            <div className="text-xs text-gray-500">
                                Última actualización: {new Date().toLocaleTimeString()}
                            </div>
                        )}
                    </div>

                    {takenDemands.loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                            <p className="text-sm text-muted-foreground">Cargando solicitudes asignadas...</p>
                        </div>
                    ) : takenDemands.error ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-red-500 mb-2">{takenDemands.error}</p>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : takenDemands.demands.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">📋</div>
                            <p className="text-sm text-muted-foreground">No hay solicitudes asignadas actualmente.</p>
                            <p className="text-xs text-gray-500 mt-1">Las solicitudes que tomes aparecerán aquí.</p>
                        </div>
                    ) : (
                        <>
                            <div className="mt-4 space-y-4">
                                {takenDemands.demands.map((demand) => {
                                    const createdAt = new Date(demand.createdAt);
                                    const timeAgo = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60)); // minutos
                                    
                                    return (
                                        <div key={demand.id} className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-bold text-gray-800">{demand.origin}</h3>
                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                            Asignada
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                        <div>
                                                            <span className="font-medium">Tipo de vehículo:</span> {demand.carType}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Fecha:</span> {formatDate(demand.createdAt)}
                                                        </div>
                                            <div>
                                                            <span className="font-medium">Tiempo transcurrido:</span> 
                                                            <span className={timeAgo > 60 ? 'text-orange-600' : 'text-gray-600'}>
                                                                {timeAgo < 1 ? 'Menos de 1 min' : 
                                                                 timeAgo < 60 ? `${timeAgo} min` : 
                                                                 `${Math.floor(timeAgo / 60)}h ${timeAgo % 60}min`}
                                                            </span>
                                                        </div>
                                                        {demand.description && (
                                                            <div className="md:col-span-2">
                                                                <span className="font-medium">Descripción:</span> 
                                                                <span className="text-gray-700 ml-1">{demand.description}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                            </div>
                                                <div className="flex flex-col gap-2 ml-4">
                                                <button
                                                    onClick={() => openModal(demand, "SHOW")}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors"
                                                >
                                                        Ver detalles
                                                </button>
                                                    {timeAgo > 60 && (
                                                        <div className="text-xs text-orange-600 text-center">
                                                            ⚠️ Pendiente
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <Pagination
                                page={takenDemands.page}
                                totalPages={takenDemands.totalPages}
                                pageSize={takenDemands.pageSize}
                                onPageChange={takenDemands.handlePageChange}
                                onPageSizeChange={takenDemands.handlePageSizeChange}
                            />
                        </>
                    )}
                </div>
            </div>

            {isModalOpen && selectedDemand && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={showConfirmButton ? "Tomar solicitud" : "Detalles de la solicitud"}
                >
                    <div className="space-y-4">
                        {/* Información principal */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-bold text-lg text-gray-800 mb-3">{selectedDemand.origin}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Tipo de vehículo:</span>
                                    <p className="text-gray-800">{selectedDemand.carType}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Estado:</span>
                                    <p className="text-gray-800">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            selectedDemand.state === 'TAKEN' ? 'bg-green-100 text-green-800' :
                                            selectedDemand.state === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {selectedDemand.state === 'TAKEN' ? 'Asignada' :
                                             selectedDemand.state === 'ACTIVE' ? 'Activa' :
                                             selectedDemand.state}
                                        </span>
                                    </p>
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
                                        {selectedDemand.currentLocation.accuracy && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Precisión: {selectedDemand.currentLocation.accuracy.toFixed(1)}m
                                            </p>
                                        )}
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
                        </div>

                        {modalError && (
                            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                                <p className="text-red-600 text-sm">{modalError}</p>
                            </div>
                        )}

                        {showConfirmButton && (
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={takeDemand}
                                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors text-sm"
                                >
                                    Confirmar asignación
                                </button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </>
    );
}