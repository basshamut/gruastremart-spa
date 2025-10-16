import { useEffect, useState, useRef, useCallback } from "react";
import { formatDate, calculateDistanceFromLocations } from "../../utils/Utils.js";
import Modal from "../common/Modal";
import PaymentModal from "../common/PaymentModal";
import ToastContainer from "../common/ToastContainer";
import { useOperatorLocationForDemand } from "../../hooks/location/useOperatorLocationForDemand";
import { DEMAND_POLL_INTERVAL } from "../../config/constants.js";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React from "react";
import { useToast } from "../../hooks/common/useToast.js";
import { usePriceCalculation } from "../../hooks/data/usePriceCalculation.js";
import PaymentService from "../../services/PaymentService.js";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Íconos personalizados
const originIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const operatorIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/9614/9614333.png", // Icono de grúa
    iconSize: [32, 37],
    iconAnchor: [16, 37],
    popupAnchor: [0, -28],
});

// Componente para actualizar el mapa cuando cambia la ubicación del operador
function MapUpdater({ operatorLocation, origin, hasInitialized }) {
    const map = useMap();
    const prevLocationRef = useRef(null);
    const updateTimeoutRef = useRef(null);

    useEffect(() => {
        if (operatorLocation && operatorLocation.lat && operatorLocation.lng) {
            const newPosition = [operatorLocation.lat, operatorLocation.lng];

            if (!hasInitialized) {
                // Primera vez: centrar el mapa en la ubicación del operador
                map.setView(newPosition, 15);
            } else if (prevLocationRef.current) {
                // Actualizaciones posteriores: solo mover el marcador suavemente
                const prevPosition = prevLocationRef.current;
                const distance = map.distance(prevPosition, newPosition);

                // Solo mover si hay un cambio significativo (más de 10 metros)
                if (distance > 10) {
                    // Usar debounce para evitar actualizaciones muy frecuentes
                    if (updateTimeoutRef.current) {
                        clearTimeout(updateTimeoutRef.current);
                    }

                    updateTimeoutRef.current = setTimeout(() => {
                        // Mover suavemente el marcador sin cambiar la vista del mapa
                    }, 100); // 100ms debounce
                }
            }

            prevLocationRef.current = newPosition;
        } else if (origin && origin.lat && origin.lng && !hasInitialized) {
            // Si no hay operador, centrar en el origen
            map.setView([origin.lat, origin.lng], 13);
        }
    }, [operatorLocation, origin, map, hasInitialized]);

    // Limpiar timeout al desmontar
    useEffect(() => {
        return () => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, []);

    return null;
}

// Componente del mapa con seguimiento del operador
const TrackingMap = React.memo(function TrackingMap({ demand, operatorLocation }) {
    const [hasInitialized, setHasInitialized] = useState(false);
    const [mapCenter, setMapCenter] = useState(null);
    const [mapZoom, setMapZoom] = useState(13);
    const [mapKey, setMapKey] = useState(null);

    const origin = demand.currentLocation ? {
        lat: demand.currentLocation.latitude,
        lng: demand.currentLocation.longitude
    } : null;

    const destination = demand.destinationLocation ? {
        lat: demand.destinationLocation.latitude,
        lng: demand.destinationLocation.longitude
    } : null;

    // Calcular el centro inicial del mapa (solo una vez)
    useEffect(() => {
        if (!mapCenter) {
            if (operatorLocation && operatorLocation.lat && operatorLocation.lng) {
                // Prioridad 1: Ubicación del operador
                setMapCenter([operatorLocation.lat, operatorLocation.lng]);
                setMapZoom(15);
                setHasInitialized(true);
                setMapKey(`map-${operatorLocation.lat}-${operatorLocation.lng}-15`);
            } else if (origin) {
                // Prioridad 2: Origen
                setMapCenter([origin.lat, origin.lng]);
                setMapZoom(13);
                setMapKey(`map-${origin.lat}-${origin.lng}-13`);
            } else {
                // Prioridad 3: Coordenadas por defecto (Caracas)
                setMapCenter([10.4806, -66.9036]);
                setMapZoom(10);
                setMapKey('map-default-10');
            }
        }
    }, [operatorLocation, origin, mapCenter]);

    // Si no hay centro calculado, mostrar loading
    if (!mapCenter) {
        return (
            <div className="mt-4">
                <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Cargando mapa...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4">
            <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200">
                <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: "100%", width: "100%" }}
                    key={mapKey}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    <MapUpdater
                        operatorLocation={operatorLocation}
                        origin={origin}
                        hasInitialized={hasInitialized}
                    />

                    {/* Marcador del operador (prioridad máxima) */}
                    {operatorLocation && operatorLocation.lat && operatorLocation.lng && (
                        <Marker
                            position={[operatorLocation.lat, operatorLocation.lng]}
                            icon={operatorIcon}
                            key={`operator-${operatorLocation.lat}-${operatorLocation.lng}`}
                        >
                            <Popup>
                                <div className="text-center">
                                    <div className="font-bold text-green-600">🚛 Operador</div>
                                    <div className="text-xs text-gray-600">
                                        Lat: {operatorLocation.lat.toFixed(6)}<br />
                                        Lng: {operatorLocation.lng.toFixed(6)}
                                    </div>
                                    {operatorLocation.accuracy && (
                                        <div className="text-xs text-gray-500">
                                            Precisión: {operatorLocation.accuracy.toFixed(1)}m
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-1">
                                        Última actualización: {new Date(operatorLocation.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Marcador de origen */}
                    {origin && origin.lat !== undefined && origin.lng !== undefined && (
                        <Marker
                            position={[origin.lat, origin.lng]}
                            icon={originIcon}
                        >
                            <Popup>
                                <div className="text-center">
                                    <div className="font-bold text-green-600">📍 Punto de origen</div>
                                    <div className="text-xs text-gray-600">
                                        {demand.currentLocation?.name || 'Ubicación actual'}<br />
                                        Lat: {origin.lat.toFixed(6)}<br />
                                        Lng: {origin.lng.toFixed(6)}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Marcador de destino */}
                    {destination && destination.lat !== undefined && destination.lng !== undefined && (
                        <Marker
                            position={[destination.lat, destination.lng]}
                            icon={destinationIcon}
                        >
                            <Popup>
                                <div className="text-center">
                                    <div className="font-bold text-red-600">🎯 Punto de destino</div>
                                    <div className="text-xs text-gray-600">
                                        {demand.destinationLocation?.name || 'Destino'}<br />
                                        Lat: {destination.lat.toFixed(6)}<br />
                                        Lng: {destination.lng.toFixed(6)}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
        </div>
    );
});

export default function CustomerRequests({ refreshTrigger = 0 }) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    // Hook para notificaciones
    const { toasts, showSuccess, showError, removeToast } = useToast();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stateFilter, setStateFilter] = useState("");
    const [page, setPage] = useState(0);
    const [size] = useState(1000); // Número grande para obtener todas las solicitudes posibles
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState("details"); // "details" o "cancel"
    
    // Estados para modal de pago
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    // Estados para polling y notificaciones
    const [pollingInterval, setPollingInterval] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [hasActiveRequests, setHasActiveRequests] = useState(false);
    const [notificationShown, setNotificationShown] = useState(() => {
        // Si hay un ID de solicitud notificada, significa que ya se notificó
        return localStorage.getItem('lastNotifiedRequestId') !== null;
    });
    const [lastNotifiedRequestId, setLastNotifiedRequestId] = useState(() => {
        // Recuperar del localStorage para persistir entre recargas
        return localStorage.getItem('lastNotifiedRequestId') || null;
    });

    // Hook centralizado para cálculos de precios
    const { calculateAutomaticPrice, formatPrice, getPriceSourceText } = usePriceCalculation();

    // Hook para seguimiento del operador (solo para solicitudes tomadas)
    const takenRequest = requests.find(r => r.state === "TAKEN");
    const {
        operatorLocation: takenOperatorLocation,
        operatorStatus: takenOperatorStatus,
        operatorId: takenOperatorId,
        error: takenOperatorError,
        isLoading: takenOperatorLoading
    } = useOperatorLocationForDemand(takenRequest?.id, DEMAND_POLL_INTERVAL, true);

    // Hook para seguimiento del operador de la demanda seleccionada en la modal
    const {
        operatorLocation,
        operatorStatus,
        operatorId,
        error: operatorError,
        isLoading: operatorLoading
    } = useOperatorLocationForDemand(selectedRequest?.id, DEMAND_POLL_INTERVAL, modalOpen && selectedRequest?.state === "TAKEN");

    // Función para mostrar notificaciones
    const showNotification = useCallback((title, message) => {
        // Verificar si el navegador soporta notificaciones
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, {
                body: message,
                icon: "/favicon.svg",
                badge: "/favicon.svg"
            });
        }

        // También mostrar una notificación en la página
        const notificationDiv = document.createElement('div');
        notificationDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
        notificationDiv.innerHTML = `
            <div class="flex items-center">
                <div class="mr-3">🚗</div>
                <div>
                    <div class="font-bold">${title}</div>
                    <div class="text-sm">${message}</div>
                </div>
            </div>
        `;

        document.body.appendChild(notificationDiv);

        // Animar entrada
        setTimeout(() => {
            notificationDiv.classList.remove('translate-x-full');
        }, 100);

        // Remover después de 5 segundos
        setTimeout(() => {
            notificationDiv.classList.add('translate-x-full');
            setTimeout(() => {
                if (notificationDiv.parentNode) {
                    notificationDiv.parentNode.removeChild(notificationDiv);
                }
            }, 300);
        }, 5000);
    }, []);



    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const createdByUserId = JSON.parse(localStorage.getItem("userDetail")).id;
            const params = new URLSearchParams({
                page,
                size,
                createdByUserId
            });
            if (stateFilter) {
                params.append("state", stateFilter);
            }

            const response = await fetch(`${apiDomain}/v1/crane-demands?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Error al obtener las solicitudes");

            const data = await response.json();
            const newRequests = data.content || [];
            

            // Usar función de setState para acceder al estado anterior sin crear dependencias
            setRequests(prevRequests => {
                // Detectar cambios de estado para notificaciones automáticas
                if (prevRequests.length > 0) {
                    newRequests.forEach(newRequest => {
                        const previousRequest = prevRequests.find(r => r.id === newRequest.id);
                        
                        if (previousRequest && previousRequest.state !== newRequest.state) {
                            
                            // Obtener el último ID notificado del localStorage para evitar dependencias
                            const currentLastNotified = localStorage.getItem('lastNotifiedRequestId');
                            
                            // Caso 1: Solicitud fue tomada por operador
                            if (previousRequest.state === "ACTIVE" && newRequest.state === "TAKEN") {
                                if (currentLastNotified !== newRequest.id) {
                                    showNotification("¡Operador asignado!", "Un operador ha tomado tu solicitud y está en camino.");
                                    setNotificationShown(true);
                                    setLastNotifiedRequestId(newRequest.id);
                                    localStorage.setItem('lastNotifiedRequestId', newRequest.id);
                                }
                            }
                            
                            // Caso 2: Solicitud fue completada
                            else if (previousRequest.state === "TAKEN" && newRequest.state === "COMPLETED") {
                                showNotification("¡Solicitud completada!", "Tu solicitud ha sido completada exitosamente. El servicio ha finalizado.");
                                setNotificationShown(false);
                                setLastNotifiedRequestId(null);
                                localStorage.removeItem('lastNotifiedRequestId');
                            }
                            
                            // Caso 3: Solicitud fue cancelada
                            else if (previousRequest.state === "TAKEN" && newRequest.state === "CANCELLED") {
                                showNotification("Solicitud cancelada", "Tu solicitud ha sido cancelada por el operador. Puedes crear una nueva solicitud si lo necesitas.");
                                setNotificationShown(false);
                                setLastNotifiedRequestId(null);
                                localStorage.removeItem('lastNotifiedRequestId');
                            }
                            
                            // Caso 4: Solicitud activa fue cancelada directamente
                            else if (previousRequest.state === "ACTIVE" && newRequest.state === "CANCELLED") {
                                showNotification("Solicitud cancelada", "Tu solicitud ha sido cancelada.");
                            }
                        }
                    });
                }
                return newRequests;
            });
            
            setLastUpdate(new Date());

            // Verificar si hay solicitudes activas para determinar si continuar polling
            const hasActive = newRequests.some(r => r.state === "ACTIVE");
            const hasTaken = newRequests.some(r => r.state === "TAKEN");
            const shouldPoll = hasActive || hasTaken;
            
            // Usar función de setState para evitar dependencias
            setHasActiveRequests(prev => {
                return shouldPoll;
            });

        } catch (err) {
            console.error(err);
            setError("Error cargando solicitudes.");
        } finally {
            setLoading(false);
        }
    }, [page, size, stateFilter, apiDomain, token, showNotification]);

    // Solicitar permisos de notificación al cargar
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    // Configurar polling automático - solo cuando realmente sea necesario
    useEffect(() => {
        // Limpiar intervalo anterior si existe
        if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
        }

        // Solo hacer polling si hasActiveRequests es true
        if (hasActiveRequests) {
            const hasTaken = requests.some(r => r.state === "TAKEN");
            const hasActive = requests.some(r => r.state === "ACTIVE");
            
            // Determinar intervalo basado en el estado
            let intervalTime;
            if (hasTaken) {
                // Solicitud tomada: polling moderado (para detectar finalización/cancelación)
                intervalTime = DEMAND_POLL_INTERVAL * 2; // 2x más lento (20s si DEMAND_POLL_INTERVAL es 10s)
            } else if (hasActive) {
                // Solicitud activa: polling normal (para detectar cuando sea tomada)
                intervalTime = DEMAND_POLL_INTERVAL;
            }
            
            if (intervalTime) {
                const minutes = Math.floor(intervalTime / 60);
                const seconds = intervalTime % 60;
                const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
                
                const interval = setInterval(() => {
                    fetchRequests();
                }, intervalTime * 1000);
                setPollingInterval(interval);
            }
        }

        // Limpiar al desmontar
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [hasActiveRequests]); // Solo cuando cambie hasActiveRequests

    useEffect(() => {
        fetchRequests();
    }, [page, size, stateFilter]);

    // Efecto para refrescar automáticamente cuando cambia refreshTrigger
    useEffect(() => {
        if (refreshTrigger > 0) {
            fetchRequests();
        }
    }, [refreshTrigger]);

    // Limpiar notificaciones al desmontar el componente
    useEffect(() => {
        return () => {
            // Limpiar intervalo si existe
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
            // No limpiar localStorage aquí para mantener persistencia entre navegación
        };
    }, [pollingInterval]);

    const handleFilterChange = (e) => {
        setStateFilter(e.target.value);
        setPage(0);
    };

    // Función para detener polling manualmente
    const stopPolling = () => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
        }
    };

    // Función para reiniciar polling manualmente
    const startPolling = () => {
        if (!pollingInterval && hasActiveRequests) {
            // Trigger del useEffect
            setHasActiveRequests(prev => !prev);
            setTimeout(() => setHasActiveRequests(prev => !prev), 100);
        }
    };

    // Función para limpiar el estado de notificaciones (solo en caso de problemas)
    const resetNotificationState = () => {
        setNotificationShown(false);
        setLastNotifiedRequestId(null);
        localStorage.removeItem('lastNotifiedRequestId');
        showNotification("Estado reiniciado", "El estado de notificaciones ha sido reiniciado.");
    };

    const cancelRequest = async (id) => {
        setSelectedRequest(requests.find(r => r.id === id));
        setModalType("cancel");
        setModalOpen(true);
    };

    const confirmCancelRequest = async () => {
        if (!selectedRequest) return;

        try {
            const response = await fetch(`${apiDomain}/v1/crane-demands/${selectedRequest.id}/cancel`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                let errorMessage = "No se pudo cancelar la solicitud";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    errorMessage = `Error ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            // Verificar si la respuesta tiene contenido JSON
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                await response.json(); // Parse response but ignore result since we don't need it
            }

            setRequests((prev) =>
                prev.map((r) => (r.id === selectedRequest.id ? { ...r, state: "CANCELLED" } : r))
            );
            setModalOpen(false);
            showSuccess("Solicitud cancelada exitosamente");
        } catch (err) {
            console.error("Error cancelando solicitud:", err);
            showError(err.message || "Error al cancelar la solicitud");
        }
    };

    const viewDetails = (req) => {
        setSelectedRequest(req);
        setModalType("details");
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedRequest(null);
    };

    const handleRegisterPayment = (request) => {
        setSelectedRequest(request);
        setPaymentModalOpen(true);
    };

    const handlePaymentSubmit = async (paymentData) => {
        setPaymentLoading(true);
        try {
            const result = await PaymentService.registerPayment(paymentData);
            
            if (result.success) {
                showSuccess("Pago registrado exitosamente. Será verificado por nuestro equipo.");
                setPaymentModalOpen(false);
                
                // Actualizar la lista de solicitudes para reflejar el cambio
                fetchRequests();
            } else {
                showError(result.message || "Error al registrar el pago");
            }
        } catch (error) {
            console.error("Error al registrar pago:", error);
            showError("Error al registrar el pago. Por favor, intente nuevamente.");
        } finally {
            setPaymentLoading(false);
        }
    };

    const handlePaymentModalClose = () => {
        setPaymentModalOpen(false);
        setSelectedRequest(null);
    };

    const getStatusBadge = (state) => {
        const badges = {
            ACTIVE: { text: "Activa", class: "bg-blue-100 text-blue-800" },
            TAKEN: { text: "En camino", class: "bg-green-100 text-green-800" },
            CANCELLED: { text: "Cancelada", class: "bg-red-100 text-red-800" },
            COMPLETED: { text: "Completada", class: "bg-gray-100 text-gray-800" }
        };
        const badge = badges[state] || { text: state, class: "bg-gray-100 text-gray-800" };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.class}`}>
                {badge.text}
            </span>
        );
    };

    return (
        <div className="bg-card p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-primary-foreground">
                    Mis Solicitudes
                    {requests.length > 0 && (
                        <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {requests.length}
                        </span>
                    )}
                </h2>
                <div className="flex items-center gap-4">
                    {takenRequest && (
                        <div className="text-xs text-green-600 flex items-center">
                            🚗 <span className="ml-1">Operador en camino</span>
                        </div>
                    )}
                    
                    {/* Indicador de polling */}
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                        {lastUpdate && (
                            <span>Última actualización: {lastUpdate.toLocaleTimeString()}</span>
                        )}
                        
                        {pollingInterval ? (
                            <div className="flex items-center text-green-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                                <span>Auto-actualización activa</span>
                                <button
                                    onClick={stopPolling}
                                    className="ml-2 text-xs text-red-600 hover:text-red-800 underline"
                                    title="Detener actualización automática"
                                >
                                    Pausar
                                </button>
                                <button
                                    onClick={resetNotificationState}
                                    className="ml-2 text-xs text-gray-600 hover:text-gray-800 underline"
                                    title="Reiniciar estado de notificaciones"
                                >
                                    Reset
                                </button>
                            </div>
                        ) : hasActiveRequests ? (
                            <div className="flex items-center text-orange-600">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mr-1"></div>
                                <span>Auto-actualización pausada</span>
                                <button
                                    onClick={startPolling}
                                    className="ml-2 text-xs text-green-600 hover:text-green-800 underline"
                                    title="Reanudar actualización automática"
                                >
                                    Reanudar
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center text-gray-400">
                                <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                                <span>Sin seguimiento activo</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Filtro de estado */}
            <div className="mb-4">
                <select
                    value={stateFilter}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                    <option value="">Todos los estados</option>
                    <option value="ACTIVE">Activas</option>
                    <option value="TAKEN">En camino</option>
                    <option value="CANCELLED">Canceladas</option>
                    <option value="COMPLETED">Completadas</option>
                </select>
            </div>

            {/* Lista de solicitudes */}
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mr-3"></div>
                    <p className="text-sm text-muted-foreground">Cargando solicitudes...</p>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-sm text-red-500 mb-2">{error}</p>
                    <button
                        onClick={fetchRequests}
                        className="text-xs text-green-600 hover:text-blue-800 underline"
                    >
                        Reintentar
                    </button>
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">📋</div>
                    <p className="text-sm text-muted-foreground">No hay solicitudes.</p>
                    <p className="text-xs text-gray-500 mt-1">Crea una nueva solicitud para comenzar.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => {
                        const isTaken = req.state === "TAKEN";
                        const isActive = req.state === "ACTIVE";
                        const canCancel = isActive || isTaken;

                        return (
                            <div key={req.id} className={`border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow ${isTaken ? 'border-green-300 bg-green-50' :
                                isActive ? 'border-blue-300 bg-blue-50' : ''
                                }`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-bold text-gray-800">{req.origin}</h3>
                                            {getStatusBadge(req.state)}
                                            {isTaken && (
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                    🚗 En camino
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                            <div>
                                                <span className="font-medium">Tipo de vehículo:</span> {req.carType}
                                            </div>
                                            <div>
                                                <span className="font-medium">Fecha:</span> {formatDate(req.createdAt)}
                                            </div>
                                            {req.description && (
                                                <div className="sm:col-span-2">
                                                    <span className="font-medium">Descripción:</span>
                                                    <span className="text-gray-700 ml-1">{req.description}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 ml-4">
                                        <button
                                            onClick={() => viewDetails(req)}
                                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm transition-colors"
                                        >
                                            {isTaken ? 'Seguir' : 'Ver'}
                                        </button>
                                        {canCancel && (
                                            <button
                                                onClick={() => cancelRequest(req.id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal de detalles */}
            {modalOpen && selectedRequest && modalType === "details" && (
                <Modal
                    isOpen={modalOpen}
                    onClose={closeModal}
                    title="Detalles de la solicitud"
                >
                    <div className="space-y-4">
                        {/* Información principal */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-bold text-lg text-gray-800 mb-3">{selectedRequest.origin}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Estado:</span>
                                    <div className="mt-1">{getStatusBadge(selectedRequest.state)}</div>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Tipo de vehículo:</span>
                                    <p className="text-gray-800">{selectedRequest.carType}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Fecha:</span>
                                    <p className="text-gray-800">{formatDate(selectedRequest.createdAt)}</p>
                                </div>
                                {selectedRequest.assignedOperatorId && (
                                    <div>
                                        <span className="font-medium text-gray-700">Operador:</span>
                                        <p className="text-gray-800">{selectedRequest.assignedOperatorId}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Descripción y avería */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selectedRequest.description && (
                                <div>
                                    <span className="font-medium text-gray-700 text-sm">Descripción:</span>
                                    <p className="text-gray-800 mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                                        {selectedRequest.description}
                                    </p>
                                </div>
                            )}
                            {selectedRequest.breakdown && (
                                <div>
                                    <span className="font-medium text-gray-700 text-sm">Tipo de avería:</span>
                                    <p className="text-gray-800 mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                                        {selectedRequest.breakdown}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Ubicaciones */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selectedRequest.currentLocation && (
                                <div>
                                    <span className="font-medium text-gray-700 text-sm">📍 Ubicación actual:</span>
                                    <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-gray-800 text-sm font-medium">{selectedRequest.currentLocation.name || 'Sin nombre'}</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {selectedRequest.currentLocation.latitude?.toFixed(6)}, {selectedRequest.currentLocation.longitude?.toFixed(6)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {selectedRequest.destinationLocation && (
                                <div>
                                    <span className="font-medium text-gray-700 text-sm">🎯 Destino:</span>
                                    <div className="mt-1 p-3 bg-green-50 rounded-lg">
                                        <p className="text-gray-800 text-sm font-medium">{selectedRequest.destinationLocation.name || 'Sin nombre'}</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {selectedRequest.destinationLocation.latitude?.toFixed(6)}, {selectedRequest.destinationLocation.longitude?.toFixed(6)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mostrar distancia calculada si tenemos ambas ubicaciones */}
                        {selectedRequest.currentLocation && selectedRequest.destinationLocation && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <span className="font-medium text-blue-700 text-sm">📏 Distancia:</span>
                                <p className="text-blue-800 mt-1">
                                    {selectedRequest.distance || calculateDistanceFromLocations(
                                        selectedRequest.currentLocation,
                                        selectedRequest.destinationLocation
                                    )} km
                                    {!selectedRequest.distance && (
                                        <span className="text-xs text-blue-600 ml-2">(calculada automáticamente)</span>
                                    )}
                                </p>
                            </div>
                        )}

                        {/* Mostrar precio calculado automáticamente */}
                        {(() => {
                            const priceCalculation = calculateAutomaticPrice(selectedRequest);
                            if (priceCalculation && priceCalculation.isValid) {
                                return (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <span className="font-medium text-green-700 text-sm">💰 Precio estimado:</span>
                                        <p className="text-green-800 mt-1 font-semibold">
                                            {formatPrice(priceCalculation.totalPrice)}
                                            <span className="text-xs text-green-600 ml-2 font-normal">
                                                ({getPriceSourceText(priceCalculation.priceSource)})
                                            </span>
                                        </p>
                                        <div className="text-xs text-green-600 mt-1">
                                            <span>Distancia: {priceCalculation.distance?.toFixed(2)} km</span>
                                            <span className="ml-3">Categoría: {priceCalculation.weightCategory}</span>
                                            <span className="ml-3">Tipo: {priceCalculation.serviceType}</span>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {/* Botón de Registrar Pago (solo para solicitudes completadas) */}
                        {selectedRequest.state === "COMPLETED" && (
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => handleRegisterPayment(selectedRequest)}
                                        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 shadow-md"
                                    >
                                        <span>💳</span>
                                        Registrar Pago
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Seguimiento del operador (solo para solicitudes tomadas) */}
                        {selectedRequest.state === "TAKEN" && (
                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="font-medium text-gray-700 mb-3">🚗 Seguimiento del operador</h4>
                                {/* Información adicional del operador: Operador en ruta antes del mapa */}
                                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {operatorLocation && operatorLocation.lat && operatorLocation.lng && (
                                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg col-span-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-green-600">📍</span>
                                                <span className="font-medium text-green-800">Operador en ruta</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-700">Latitud:</span> {operatorLocation.lat.toFixed(6)}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Longitud:</span> {operatorLocation.lng.toFixed(6)}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Última actualización:</span> {new Date(operatorLocation.timestamp).toLocaleTimeString()}
                                                </div>
                                                {operatorLocation.accuracy && (
                                                    <div>
                                                        <span className="font-medium text-gray-700">Precisión:</span> {operatorLocation.accuracy.toFixed(1)}m
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Mapa con seguimiento del operador */}
                                <TrackingMap
                                    demand={selectedRequest}
                                    operatorLocation={operatorLocation}
        
                                />
                                {/* El resto de la información adicional del operador (loading, error, etc.) */}
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {operatorLoading ? (
                                        <div className="flex items-center justify-center py-4 col-span-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mr-2"></div>
                                            <span className="text-sm text-gray-600">Obteniendo información del operador...</span>
                                        </div>
                                    ) : operatorError ? (
                                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg col-span-2">
                                            <p className="text-red-600 text-sm">Error obteniendo información del operador</p>
                                            <p className="text-xs text-red-500 mt-1">El operador puede estar desconectado o no tener GPS activo</p>
                                        </div>
                                    ) : operatorLocation ? (
                                        <>
                                            {operatorLocation.hasLocation === false ? (
                                                // Solo tenemos estado, no coordenadas
                                                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg col-span-2">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-green-600">📱</span>
                                                        <span className="font-medium text-blue-800">Operador conectado</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                                        <div>
                                                            <span className="font-medium text-gray-700">Estado:</span>
                                                            <span className="text-green-600 ml-1">🟢 En línea</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-700">Última actividad:</span>
                                                            <span className="text-gray-600 ml-1">
                                                                {operatorLocation.timestamp ? new Date(operatorLocation.timestamp).toLocaleTimeString() : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                                                        <p className="text-xs text-yellow-700">
                                                            ℹ️ El operador está conectado pero no ha compartido su ubicación GPS.
                                                            Esto es normal si está en movimiento o en una zona con poca señal.
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : null}
                                            {/* Información adicional del estado del operador */}
                                            {operatorStatus && (
                                                <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200 col-span-2">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-600">Estado de conexión:</span>
                                                        <span className={operatorStatus.isOnline ? 'text-green-600' : 'text-red-600'}>
                                                            {operatorStatus.isOnline ? '🟢 En línea' : '🔴 Desconectado'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg col-span-2">
                                            <p className="text-yellow-700 text-sm">⏳ Esperando información del operador...</p>
                                            <p className="text-xs text-yellow-600 mt-1">
                                                El operador puede estar iniciando su servicio o configurando su GPS.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {/* Modal de confirmación de cancelación */}
            {modalOpen && selectedRequest && modalType === "cancel" && (
                <Modal
                    isOpen={modalOpen}
                    onClose={closeModal}
                    title="Cancelar solicitud"
                    showConfirmButton={true}
                    confirmText="Confirmar cancelación"
                    cancelText="No cancelar"
                    onConfirm={confirmCancelRequest}
                >
                    <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                            <h3 className="font-bold text-red-800 mb-2">¿Estás seguro?</h3>
                            <p className="text-red-700 text-sm">
                                Estás a punto de cancelar la solicitud para <strong>{selectedRequest.origin}</strong>.
                                Esta acción no se puede deshacer.
                            </p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="font-medium text-gray-700 mb-2">Detalles de la solicitud:</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                                <div><span className="font-medium">Origen:</span> {selectedRequest.origin}</div>
                                <div><span className="font-medium">Tipo de vehículo:</span> {selectedRequest.carType}</div>
                                <div><span className="font-medium">Fecha:</span> {formatDate(selectedRequest.createdAt)}</div>
                                {selectedRequest.description && (
                                    <div><span className="font-medium">Descripción:</span> {selectedRequest.description}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Modal de registro de pago */}
            {paymentModalOpen && selectedRequest && (
                <PaymentModal
                    isOpen={paymentModalOpen}
                    onClose={handlePaymentModalClose}
                    onSubmit={handlePaymentSubmit}
                    requestData={selectedRequest}
                    isLoading={paymentLoading}
                />
            )}

            {/* Toast Container para notificaciones */}
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </div>
    );
}