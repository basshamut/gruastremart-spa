import { useState, useEffect } from "react";

import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ToastContainer from "../components/common/ToastContainer";
import { usePaginatedDemands } from "../hooks/data/usePaginatedDemands";
import { useOperatorActivity } from "../hooks/data/useOperatorActivity";
import { useOperatorLocationService } from "../hooks/location/useOperatorLocationService";
import { assignCraneDemandToOperator, cancelCraneDemandByOperator, completeCraneDemandByOperator } from "../services/CraneDemandService.js";
import { updateOperatorLocation } from "../services/OperatorLocationService.js";
import { formatDate } from "../utils/Utils.js";
import { LOCATION_UPDATE_INTERVAL } from "../config/constants.js";
import { useCranePricingDropdown } from "../hooks/data/useCranePricing.js";
import { calculateServicePrice } from "../services/CranePricingService.js";
import { useToast } from "../hooks/common/useToast.js";

export default function OperatorActivity() {
    // Estados específicos del componente
    const [selectedDemand, setSelectedDemand] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [showConfirmButton, setShowConfirmButton] = useState(true);
    const [previousLocation, setPreviousLocation] = useState(null);
    const [selectedWeightCategory, setSelectedWeightCategory] = useState('');
    const [priceCalculation, setPriceCalculation] = useState(null);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [demandToCancel, setDemandToCancel] = useState(null);
    const [completeModalOpen, setCompleteModalOpen] = useState(false);
    const [demandToComplete, setDemandToComplete] = useState(null);

    // Obtener el ID del operador directamente desde localStorage (no cambia durante la sesión)
    const assignedOperatorId = JSON.parse(localStorage.getItem("userDetail"))?.id;

    // Hook para notificaciones
    const { toasts, showSuccess, showError, removeToast } = useToast();

    // Hook para obtener las opciones de pricing
    const { pricingOptions, loading: loadingPricing } = useCranePricingDropdown();

    // Hook personalizado que maneja toda la lógica de actividad del operador
    const {
        countdown,
        pendingNotificationsForActiveDemands,
        refreshTrigger,
        refreshData,
    } = useOperatorActivity(30, 30, 30); // 30s ubicación, 30s countdown, 30s actualización de solicitudes

    // Hook para seguimiento de ubicación del operador usando endpoints REST
    const {
        location: operatorLocation,
        status: operatorStatus,
        error: locationError,
        isLoading: locationLoading,
        isUpdating: locationUpdating,
        startAutoUpdate,
        stopAutoUpdate
    } = useOperatorLocationService(assignedOperatorId, LOCATION_UPDATE_INTERVAL, !!assignedOperatorId); // Usar variable configurable

    const activeDemands = usePaginatedDemands("ACTIVE", refreshTrigger, 50, location?.latitude || null, location?.longitude || null);
    const takenDemands = usePaginatedDemands("TAKEN", refreshTrigger, 1); // Solo puede haber 1 solicitud asignada

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
        setSelectedWeightCategory('');
        setPriceCalculation(null);

        if (modalType === "SHOW") {
            setShowConfirmButton(false);
        }

        if (modalType === "ASSIGN") {
            setShowConfirmButton(true);
            // Sugerir categoría basada en el peso del vehículo si está disponible
            if (demand.vehicleWeight && pricingOptions.length > 0) {
                const suggested = pricingOptions.find(option =>
                    demand.vehicleWeight >= option.minWeightKg &&
                    demand.vehicleWeight <= option.maxWeightKg
                );
                if (suggested) {
                    setSelectedWeightCategory(suggested.weightCategory);
                }
            }
        }
    };

    const closeModal = () => {
        setSelectedDemand(null);
        setIsModalOpen(false);
        setModalError(null);
        setSelectedWeightCategory('');
        setPriceCalculation(null);
    };

    const takeDemand = async () => {
        if (!selectedWeightCategory) {
            setModalError('Debe seleccionar una categoría de peso');
            return;
        }

        // Validar que el operador tenga ubicación antes de tomar la demanda
        if (!operatorLocation || !operatorLocation.lat || !operatorLocation.lng) {
            setModalError('No se puede tomar la demanda sin ubicación GPS activa. Por favor, espera a que se obtenga tu ubicación.');
            return;
        }

        try {
            // Convertir la categoría a enum
            const weightCategoryEnum = getWeightCategoryEnum(selectedWeightCategory);
            
            // Paso 1: Asignar la demanda
            await assignCraneDemandToOperator(selectedDemand, weightCategoryEnum, operatorLocation, assignedOperatorId);

            // Paso 2: Actualizar la ubicación del operador usando el servicio existente
            if (assignedOperatorId && operatorLocation.lat && operatorLocation.lng) {
                await updateOperatorLocation(assignedOperatorId, operatorLocation);
            }
            
            setModalError(null);
            closeModal();
            document.location.reload();
        } catch (error) {
            console.error("❌ takeDemand: Error occurred", error);
            setModalError(`${error}`);
        }
    };

    const getWeightCategoryEnum = (weightCategory) => {
        const enumMap = {
            'Peso 1': 'PESO_1',
            'Peso 2': 'PESO_2',
            'Peso 3': 'PESO_3',
            'Peso 4': 'PESO_4'
        };
        return enumMap[weightCategory] || weightCategory;
    };

    const handleWeightCategoryChange = (category) => {
        setSelectedWeightCategory(category);

        // Calcular precio si hay distancia disponible
        if (category && selectedDemand && selectedDemand.distance) {
            const selectedPricing = pricingOptions.find(option =>
                option.weightCategory === category
            );

            if (selectedPricing) {
                try {
                    const calculation = calculateServicePrice(selectedPricing, selectedDemand.distance);
                    setPriceCalculation(calculation);
                } catch (error) {
                    console.error('Error calculating price:', error);
                    setPriceCalculation(null);
                }
            }
        } else {
            setPriceCalculation(null);
        }
    };

    const openCancelModal = (demand) => {
        setDemandToCancel(demand);
        setCancelModalOpen(true);
    };

    const closeCancelModal = () => {
        setCancelModalOpen(false);
        setDemandToCancel(null);
    };

    const confirmCancelDemand = async () => {
        if (!demandToCancel) return;

        try {
            await cancelCraneDemandByOperator(demandToCancel.id);
            
            // Actualizar la lista de solicitudes tomadas
            refreshData();
            
            // Cerrar el modal
            closeCancelModal();
            
            // Mostrar mensaje de éxito
            showSuccess("Solicitud cancelada exitosamente");
        } catch (error) {
            console.error("Error cancelando solicitud:", error);
            showError("Error al cancelar la solicitud: " + error.message);
        }
    };

    const openCompleteModal = (demand) => {
        setDemandToComplete(demand);
        setCompleteModalOpen(true);
    };

    const closeCompleteModal = () => {
        setCompleteModalOpen(false);
        setDemandToComplete(null);
    };

    const confirmCompleteDemand = async () => {
        if (!demandToComplete) return;

        try {
            await completeCraneDemandByOperator(demandToComplete.id);
            
            // Actualizar la lista de solicitudes tomadas
            refreshData();
            
            // Cerrar el modal
            closeCompleteModal();
            
            // Mostrar mensaje de éxito
            showSuccess("Solicitud completada exitosamente");
        } catch (error) {
            console.error("Error completando solicitud:", error);
            showError("Error al completar la solicitud: " + error.message);
        }
    };

    return (
        <>
            <h1 className="text-2xl font-bold text-foreground">Bienvenido de nuevo {userName} !</h1>

            {/* Panel flotante de coordenadas del operador */}
            <div className="mt-4 bg-white bg-opacity-95 rounded-lg shadow-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-gray-700 text-sm mb-2">📍 Ubicación Actual</h3>
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
                            <div className="text-xs text-green-600 space-y-1">
                                <div className="font-semibold">Obteniendo ubicación GPS...</div>
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-500 mr-2"></div>
                                    <span>Esperando respuesta del GPS</span>
                                </div>
                                <div className="text-[10px] text-gray-500 mt-1">
                                    Esto puede tomar unos segundos...
                                </div>
                            </div>
                        ) : !operatorLocation ? (
                            <>
                                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                                <p className="text-xs text-green-600 mt-1">Iniciando</p>
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
                                        <div className={`text-[10px] mt-1 h-4 ${locationUpdating ? 'text-green-600' : 'text-transparent'}`}>
                                            🔄 Actualizando ubicación...
                                        </div>
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
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-xs text-green-600 mt-1">Obteniendo</p>
                            </>
                        ) : !operatorLocation ? (
                            <>
                                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                                <p className="text-xs text-green-600 mt-1">Iniciando</p>
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
                                    className="bg-green-500 text-white text-xs px-3 py-1 rounded-full flex items-center hover:bg-green-600 transition-colors"
                                >
                                    {pendingNotificationsForActiveDemands.length} nueva{pendingNotificationsForActiveDemands.length > 1 ? 's' : ''} •
                                    Actualizar
                                </button>
                            )}
                            {activeDemands.demands.length > 0 && (
                                <div className="text-xs text-gray-500 space-y-1">
                                    <div>Última actualización: {new Date().toLocaleTimeString()}</div>
                                    <div className="flex items-center text-green-600">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                                        Actualización cada 30s
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {activeDemands.loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mr-3"></div>
                            <p className="text-sm text-muted-foreground">Buscando solicitudes activas...</p>
                        </div>
                    ) : activeDemands.error ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-red-500 mb-2">{activeDemands.error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-xs text-green-600 hover:text-blue-800 underline"
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
                                        <div key={demand.id} className={`border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow ${isUrgent ? 'border-orange-300 bg-orange-50' :
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
                                                        {/* Información del vehículo */}
                                                        {demand.vehicleBrand && (
                                                            <div>
                                                                <span className="font-medium">Marca:</span> {demand.vehicleBrand}
                                                            </div>
                                                        )}
                                                        {demand.vehicleModel && (
                                                            <div>
                                                                <span className="font-medium">Modelo:</span> {demand.vehicleModel}
                                                            </div>
                                                        )}
                                                        {demand.vehicleYear && (
                                                            <div>
                                                                <span className="font-medium">Año:</span> {demand.vehicleYear}
                                                            </div>
                                                        )}
                                                        {demand.vehiclePlate && (
                                                            <div>
                                                                <span className="font-medium">Placa:</span> {demand.vehiclePlate}
                                                            </div>
                                                        )}
                                                        {demand.vehicleColor && (
                                                            <div>
                                                                <span className="font-medium">Color:</span> {demand.vehicleColor}
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
                                                        className={`px-4 py-2 text-white rounded text-sm transition-colors ${isUrgent ? 'bg-red-500 hover:bg-red-600' :
                                                                isHighPriority ? 'bg-yellow-500 hover:bg-yellow-600' :
                                                                    'bg-green-500 hover:bg-green-600'
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
                            <div className="text-xs text-gray-500 space-y-1">
                                <div>Última actualización: {new Date().toLocaleTimeString()}</div>
                                <div className="flex items-center text-green-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                                    Actualización cada 30s
                                </div>
                            </div>
                        )}
                    </div>

                    {takenDemands.loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mr-3"></div>
                            <p className="text-sm text-muted-foreground">Cargando solicitudes asignadas...</p>
                        </div>
                    ) : takenDemands.error ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-red-500 mb-2">{takenDemands.error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-xs text-green-600 hover:text-blue-800 underline"
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
                                                            <span className={timeAgo > 60 ? 'text-green-600' : 'text-gray-600'}>
                                                                {timeAgo < 1 ? 'Menos de 1 min' :
                                                                    timeAgo < 60 ? `${timeAgo} min` :
                                                                        `${Math.floor(timeAgo / 60)}h ${timeAgo % 60}min`}
                                                            </span>
                                                        </div>
                                                        {/* Información del vehículo */}
                                                        {demand.vehicleBrand && (
                                                            <div>
                                                                <span className="font-medium">Marca:</span> {demand.vehicleBrand}
                                                            </div>
                                                        )}
                                                        {demand.vehicleModel && (
                                                            <div>
                                                                <span className="font-medium">Modelo:</span> {demand.vehicleModel}
                                                            </div>
                                                        )}
                                                        {demand.vehicleYear && (
                                                            <div>
                                                                <span className="font-medium">Año:</span> {demand.vehicleYear}
                                                            </div>
                                                        )}
                                                        {demand.vehiclePlate && (
                                                            <div>
                                                                <span className="font-medium">Placa:</span> {demand.vehiclePlate}
                                                            </div>
                                                        )}
                                                        {demand.vehicleColor && (
                                                            <div>
                                                                <span className="font-medium">Color:</span> {demand.vehicleColor}
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
                                                        onClick={() => openModal(demand, "SHOW")}
                                                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm transition-colors"
                                                    >
                                                        Ver detalles
                                                    </button>
                                                    <button
                                                        onClick={() => openCancelModal(demand)}
                                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition-colors"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        onClick={() => openCompleteModal(demand)}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors"
                                                    >
                                                        Finalizar solicitud
                                                    </button>
                                                    {timeAgo > 60 && (
                                                        <div className="text-xs text-green-600 text-center">
                                                            ⚠️ Pendiente
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* No se necesita paginación para solicitudes asignadas ya que solo puede haber una */}
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
                                        <span className={`px-2 py-1 rounded-full text-xs ${selectedDemand.state === 'TAKEN' ? 'bg-green-100 text-green-800' :
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

                        {/* Información del vehículo */}
                        {(selectedDemand.vehicleBrand || selectedDemand.vehicleModel || selectedDemand.vehicleYear ||
                            selectedDemand.vehiclePlate || selectedDemand.vehicleColor) && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-bold text-md text-gray-800 mb-3">Datos del Vehículo</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                        {selectedDemand.vehicleBrand && (
                                            <div>
                                                <span className="font-medium text-gray-700">Marca:</span>
                                                <p className="text-gray-800">{selectedDemand.vehicleBrand}</p>
                                            </div>
                                        )}
                                        {selectedDemand.vehicleModel && (
                                            <div>
                                                <span className="font-medium text-gray-700">Modelo:</span>
                                                <p className="text-gray-800">{selectedDemand.vehicleModel}</p>
                                            </div>
                                        )}
                                        {selectedDemand.vehicleYear && (
                                            <div>
                                                <span className="font-medium text-gray-700">Año:</span>
                                                <p className="text-gray-800">{selectedDemand.vehicleYear}</p>
                                            </div>
                                        )}
                                        {selectedDemand.vehiclePlate && (
                                            <div>
                                                <span className="font-medium text-gray-700">Placa:</span>
                                                <p className="text-gray-800">{selectedDemand.vehiclePlate}</p>
                                            </div>
                                        )}
                                        {selectedDemand.vehicleColor && (
                                            <div>
                                                <span className="font-medium text-gray-700">Color:</span>
                                                <p className="text-gray-800">{selectedDemand.vehicleColor}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

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

                        {/* Selección de categoría de peso para asignación */}
                        {showConfirmButton && (
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <h4 className="font-bold text-md text-gray-800 mb-3">⚖️ Categoría de Peso</h4>

                                {/* Peso del vehículo si está disponible */}
                                {selectedDemand.vehicleWeight && (
                                    <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
                                        <span className="font-medium text-blue-800">
                                            Peso informado: {selectedDemand.vehicleWeight} kg
                                        </span>
                                    </div>
                                )}

                                {/* Selector de categoría */}
                                <div className="mb-3">
                                    <label htmlFor="weightCategory" className="block text-sm font-medium text-gray-700 mb-2">
                                        Seleccionar categoría de peso *
                                    </label>
                                    {loadingPricing ? (
                                        <div className="text-sm text-gray-500">Cargando categorías...</div>
                                    ) : (
                                        <select
                                            id="weightCategory"
                                            value={selectedWeightCategory}
                                            onChange={(e) => handleWeightCategoryChange(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                                            required
                                        >
                                            <option value="">Seleccionar categoría...</option>
                                            {pricingOptions.map((option) => (
                                                <option key={option.id} value={option.weightCategory}>
                                                    {option.displayName} - Urbano: ${option.urbanPrice} | Extra: ${option.extraUrbanBasePrice} + ${option.extraUrbanPricePerKm}/km
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Información detallada de la categoría seleccionada */}
                                {selectedWeightCategory && (
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                        <h5 className="text-sm font-semibold text-blue-800 mb-2">
                                            📋 Detalles de la Categoría
                                        </h5>
                                        {(() => {
                                            const selectedPricing = pricingOptions.find(option =>
                                                option.weightCategory === selectedWeightCategory
                                            );
                                            return selectedPricing ? (
                                                <div className="text-sm text-green-700 space-y-1">
                                                    <p><strong>Categoría:</strong> {selectedPricing.weightCategory}</p>
                                                    <p><strong>Rango de peso:</strong> {selectedPricing.minWeightKg} - {selectedPricing.maxWeightKg} kg</p>
                                                    <p><strong>Servicio urbano (≤{selectedPricing.maxDistanceKm}km):</strong> ${selectedPricing.urbanPrice} USD</p>
                                                    <p><strong>Servicio extra urbano (&gt;{selectedPricing.maxDistanceKm}km):</strong> ${selectedPricing.extraUrbanBasePrice} USD base + ${selectedPricing.extraUrbanPricePerKm} USD/km adicional</p>
                                                    {selectedPricing.description && (
                                                        <p><strong>Descripción:</strong> {selectedPricing.description}</p>
                                                    )}
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>
                                )}

                                {/* Cálculo de precio */}
                                {priceCalculation && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                                        <h5 className="text-sm font-semibold text-green-800 mb-2">
                                            💰 Cálculo de Precio
                                        </h5>
                                        <div className="text-sm text-green-700">
                                            <p><strong>Tipo de servicio:</strong> {priceCalculation.serviceType}</p>
                                            <p><strong>Distancia:</strong> {priceCalculation.distance} km</p>
                                            <p><strong>Precio total:</strong> ${priceCalculation.totalPrice.toFixed(2)} USD</p>

                                            {priceCalculation.serviceType === 'extra_urbano' && (
                                                <div className="text-xs text-green-600 mt-1 space-y-1">
                                                    <p>• Base: ${priceCalculation.breakdown.basePrice}</p>
                                                    <p>• Extra ({priceCalculation.breakdown.extraDistance} km × ${priceCalculation.breakdown.pricePerKm}): ${priceCalculation.breakdown.extraCost.toFixed(2)}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

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

                        {/* Indicador de estado de ubicación del operador */}
                        {showConfirmButton && (
                            <div className={`p-3 rounded-lg border ${operatorLocation && operatorLocation.lat && operatorLocation.lng 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-yellow-50 border-yellow-200'
                            }`}>
                                <div className="flex items-center gap-2">
                                    {operatorLocation && operatorLocation.lat && operatorLocation.lng ? (
                                        <>
                                            <span className="text-green-600">📍</span>
                                            <span className="text-sm font-medium text-green-800">Ubicación GPS activa</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-yellow-600">⚠️</span>
                                            <span className="text-sm font-medium text-yellow-800">Esperando ubicación GPS</span>
                                        </>
                                    )}
                                </div>
                                {operatorLocation && operatorLocation.lat && operatorLocation.lng && (
                                    <div className="text-xs text-green-600 mt-1">
                                        📍 {operatorLocation.lat.toFixed(6)}, {operatorLocation.lng.toFixed(6)}
                                        {operatorLocation.accuracy && ` (±${operatorLocation.accuracy.toFixed(1)}m)`}
                                    </div>
                                )}
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
                                    disabled={!operatorLocation || !operatorLocation.lat || !operatorLocation.lng}
                                    className={`flex-1 py-2 px-4 rounded-md transition-colors text-sm ${
                                        operatorLocation && operatorLocation.lat && operatorLocation.lng
                                            ? 'bg-green-500 text-white hover:bg-green-600'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {operatorLocation && operatorLocation.lat && operatorLocation.lng
                                        ? 'Confirmar asignación'
                                        : 'Esperando GPS...'
                                    }
                                </button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {/* Modal de confirmación de cancelación */}
            {cancelModalOpen && demandToCancel && (
                <Modal
                    isOpen={cancelModalOpen}
                    onClose={closeCancelModal}
                    title="Cancelar solicitud"
                    showConfirmButton={true}
                    confirmText="Confirmar cancelación"
                    cancelText="No cancelar"
                    onConfirm={confirmCancelDemand}
                >
                    <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                            <h3 className="font-bold text-red-800 mb-2">¿Estás seguro?</h3>
                            <p className="text-red-700 text-sm">
                                Estás a punto de cancelar la solicitud para <strong>{demandToCancel.origin}</strong>.
                                Esta acción no se puede deshacer y el cliente será notificado.
                            </p>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="font-medium text-gray-700 mb-2">Detalles de la solicitud:</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                                <div><span className="font-medium">Origen:</span> {demandToCancel.origin}</div>
                                <div><span className="font-medium">Tipo de vehículo:</span> {demandToCancel.carType}</div>
                                <div><span className="font-medium">Fecha:</span> {formatDate(demandToCancel.createdAt)}</div>
                                {demandToCancel.description && (
                                    <div><span className="font-medium">Descripción:</span> {demandToCancel.description}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal de confirmación de finalización */}
            {completeModalOpen && demandToComplete && (
                <Modal
                    isOpen={completeModalOpen}
                    onClose={closeCompleteModal}
                    title="Finalizar solicitud"
                    showConfirmButton={true}
                    confirmText="Confirmar finalización"
                    cancelText="Cancelar"
                    onConfirm={confirmCompleteDemand}
                >
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <h3 className="font-bold text-blue-800 mb-2">¿Confirmar finalización?</h3>
                            <p className="text-blue-700 text-sm">
                                Estás a punto de marcar como completada la solicitud para <strong>{demandToComplete.origin}</strong>.
                                Esto indicará que el traslado ha finalizado exitosamente y el cliente será notificado.
                            </p>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="font-medium text-gray-700 mb-2">Detalles de la solicitud:</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                                <div><span className="font-medium">Origen:</span> {demandToComplete.origin}</div>
                                <div><span className="font-medium">Tipo de vehículo:</span> {demandToComplete.carType}</div>
                                <div><span className="font-medium">Fecha:</span> {formatDate(demandToComplete.createdAt)}</div>
                                {demandToComplete.destinationLocation?.name && (
                                    <div><span className="font-medium">Destino:</span> {demandToComplete.destinationLocation.name}</div>
                                )}
                                {demandToComplete.description && (
                                    <div><span className="font-medium">Descripción:</span> {demandToComplete.description}</div>
                                )}
                            </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="text-green-600">✅</span>
                                <span className="text-sm font-medium text-green-800">
                                    Al confirmar, la solicitud se marcará como completada
                                </span>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Toast Container para notificaciones */}
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </>
    );
}