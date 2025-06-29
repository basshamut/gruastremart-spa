import React, {useState, useEffect} from "react";

import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import {usePaginatedDemands} from "../hooks/data/usePaginatedDemands";
import {useOperatorActivity} from "../hooks/data/useOperatorActivity";
import {useOperatorLocationInterval} from "../hooks/location/useOperatorLocationInterval";
import {assignCraneDemand} from "../services/CraneDemandService.js";
import {formatDate} from "../utils/Utils.js";

export default function OperatorActivity() {
    // Estados específicos del componente
    const [selectedDemand, setSelectedDemand] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [showConfirmButton, setShowConfirmButton] = useState(true);
    const [previousLocation, setPreviousLocation] = useState(null);

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

    // Extraer coordenadas de la localización para usePaginatedDemands
    // (La ubicación ahora la obtendremos del hook de ubicación, no de useOperatorActivity)
    // const lat = operatorLocation?.latitude || null;
    // const lng = operatorLocation?.longitude || null;

    const activeDemands = usePaginatedDemands("ACTIVE", refreshTrigger, 50);
    const takenDemands = usePaginatedDemands("TAKEN", refreshTrigger, 50);

    // Obtener el ID de la primera solicitud tomada (si existe)
    const takenDemandId = takenDemands.demands.length > 0 ? takenDemands.demands[0].id : null;

    // Hook para seguimiento de ubicación del operador SOLO para la solicitud tomada
    const {
        location: operatorLocation,
        error: locationError,
        isTracking,
        startTracking: startLocationTracking,
        stopTracking: stopLocationTracking
    } = useOperatorLocationInterval(10, takenDemandId);

    const userName = JSON.parse(localStorage.getItem("userDetail")).name
    console.log(userName);

    // Guardar la ubicación anterior cada vez que cambia la actual
    useEffect(() => {
        if (operatorLocation) {
            setPreviousLocation((prev) => {
                // Solo actualizar si la ubicación realmente cambió
                if (!prev || prev.latitude !== operatorLocation.latitude || prev.longitude !== operatorLocation.longitude) {
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
        console.log("Taking demand:", selectedDemand);
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
                                            style={{ width: `${((30 - countdown) / 30) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ) : !operatorLocation ? (
                            <div className="text-xs text-gray-600 space-y-1">
                                <div>Obteniendo ubicación...</div>
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-2"></div>
                                    <span>Esperando GPS</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-xs text-gray-800 space-y-1 mt-2">
                                <div>
                                    <span className="font-semibold">Latitud:</span> {operatorLocation.latitude.toFixed(6)}
                                </div>
                                <div>
                                    <span className="font-semibold">Longitud:</span> {operatorLocation.longitude.toFixed(6)}
                                </div>
                                <div>
                                    <span className="font-semibold">Precisión:</span> {operatorLocation.accuracy ? `${operatorLocation.accuracy.toFixed(1)}m` : 'N/A'}
                                </div>
                                <div>
                                    <span className="font-semibold">Ubicación:</span> {operatorLocation.name}
                                </div>
                                <div>
                                    <span className="font-semibold">Última actualización:</span> {new Date(operatorLocation.timestamp).toLocaleTimeString()}
                                </div>
                                {previousLocation &&
                                    (previousLocation.latitude !== operatorLocation.latitude || previousLocation.longitude !== operatorLocation.longitude) && (
                                        <div className="text-[11px] text-gray-400 mt-1">
                                            <span className="font-semibold">Anterior:</span> {previousLocation.latitude.toFixed(6)}, {previousLocation.longitude.toFixed(6)}
                                        </div>
                                    )
                                }
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        {locationError ? (
                            <>
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <p className="text-xs text-red-600 mt-1">Error</p>
                            </>
                        ) : !operatorLocation ? (
                            <>
                                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                                <p className="text-xs text-yellow-600 mt-1">Conectando</p>
                            </>
                        ) : (
                            <>
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-xs text-green-600 mt-1">En línea</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                <div className="bg-card p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-primary-foreground">Solicitudes Activas</h2>
                        {pendingNotificationsForActiveDemands.length > 0 && (
                            <button
                                onClick={refreshData}
                                className="bg-primary text-white text-xs px-3 py-1 rounded-full flex items-center"
                            >
                                {pendingNotificationsForActiveDemands.length} nueva{pendingNotificationsForActiveDemands.length > 1 ? 's' : ''} •
                                Ver
                            </button>
                        )}
                    </div>

                    {activeDemands.loading ? (
                        <p className="text-sm text-muted-foreground">Cargando...</p>
                    ) : activeDemands.error ? (
                        <p className="text-sm text-red-500">{activeDemands.error}</p>
                    ) : activeDemands.demands.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay solicitudes activas.</p>
                    ) : (
                        <>
                            <div className="mt-4 space-y-4">
                                {activeDemands.demands.map((demand) => (
                                    <div key={demand.id} className="border p-4 rounded">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold">{demand.origin}</h3>
                                                <p className="text-sm text-gray-600">
                                                    Tipo de vehículo: {demand.carType}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Fecha: {formatDate(demand.createdAt)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => openModal(demand, "ASSIGN")}
                                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            >
                                                Tomar
                                            </button>
                                        </div>
                                    </div>
                                ))}
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
                        <h2 className="text-lg font-bold text-primary-foreground">Solicitudes Asignadas</h2>
                    </div>

                    {takenDemands.loading ? (
                        <p className="text-sm text-muted-foreground">Cargando...</p>
                    ) : takenDemands.error ? (
                        <p className="text-sm text-red-500">{takenDemands.error}</p>
                    ) : takenDemands.demands.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay solicitudes asignadas.</p>
                    ) : (
                        <>
                            <div className="mt-4 space-y-4">
                                {takenDemands.demands.map((demand) => (
                                    <div key={demand.id} className="border p-4 rounded">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold">{demand.origin}</h3>
                                                <p className="text-sm text-gray-600">
                                                    Tipo de vehículo: {demand.carType}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Fecha: {formatDate(demand.createdAt)}
                                                </p>
                                            </div>
                                            <div className="space-x-2">
                                                <button
                                                    onClick={() => openModal(demand, "SHOW")}
                                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                >
                                                    Ver
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
                        <p><strong>Origen:</strong> {selectedDemand.origin}</p>
                        <p><strong>Tipo de vehículo:</strong> {selectedDemand.carType}</p>
                        <p><strong>Descripción:</strong> {selectedDemand.description || "N/A"}</p>
                        <p><strong>Fecha:</strong> {formatDate(selectedDemand.createdAt)}</p>

                        {modalError && (
                            <p className="text-red-500">{modalError}</p>
                        )}

                        {showConfirmButton && (
                            <button
                                onClick={takeDemand}
                                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                            >
                                Confirmar
                            </button>
                        )}
                    </div>
                </Modal>
            )}
        </>
    );
}