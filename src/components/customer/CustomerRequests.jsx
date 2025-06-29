import {useEffect, useState, useRef} from "react";
import {formatDate} from "../../utils/Utils.js";
import Modal from "../common/Modal";
import {useOperatorLocationForDemand} from "../../hooks/location/useOperatorLocationForDemand";
import { DEMAND_POLL_INTERVAL } from "../../config/constants.js";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix para los íconos de Leaflet
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
function MapUpdater({ operatorLocation, origin, destination, hasInitialized }) {
    const map = useMap();
    const prevLocationRef = useRef(null);
    
    useEffect(() => {
        if (operatorLocation && operatorLocation.lat && operatorLocation.lng) {
            const newPosition = [operatorLocation.lat, operatorLocation.lng];
            
            if (!hasInitialized) {
                // Primera vez: centrar el mapa en la ubicación del operador
                map.setView(newPosition, 15);
                console.log('📍 Mapa centrado en ubicación del operador:', newPosition);
            } else if (prevLocationRef.current) {
                // Actualizaciones posteriores: solo mover el marcador suavemente
                const prevPosition = prevLocationRef.current;
                const distance = map.distance(prevPosition, newPosition);
                
                // Solo mover si hay un cambio significativo (más de 10 metros)
                if (distance > 10) {
                    // Mover suavemente el marcador sin cambiar la vista del mapa
                    console.log('🔄 Actualizando posición del operador:', newPosition, 'Distancia:', distance.toFixed(1) + 'm');
                }
            }
            
            prevLocationRef.current = newPosition;
        } else if (origin && origin.lat && origin.lng && !hasInitialized) {
            // Si no hay operador, centrar en el origen
            map.setView([origin.lat, origin.lng], 13);
            console.log('📍 Mapa centrado en ubicación de origen');
        }
    }, [operatorLocation, origin, map, hasInitialized]);

    return null;
}

// Componente del mapa con seguimiento del operador
function TrackingMap({ demand, operatorLocation, operatorLoading }) {
    const [hasInitialized, setHasInitialized] = useState(false);
    const [mapCenter, setMapCenter] = useState(null);
    const [mapZoom, setMapZoom] = useState(13);

    const origin = demand.currentLocation ? {
        lat: demand.currentLocation.latitude,
        lng: demand.currentLocation.longitude
    } : null;

    const destination = demand.destinationLocation ? {
        lat: demand.destinationLocation.latitude,
        lng: demand.destinationLocation.longitude
    } : null;

    // Calcular el centro inicial del mapa
    useEffect(() => {
        if (operatorLocation && operatorLocation.lat && operatorLocation.lng) {
            // Prioridad 1: Ubicación del operador
            setMapCenter([operatorLocation.lat, operatorLocation.lng]);
            setMapZoom(15);
            setHasInitialized(true);
            console.log('🎯 Mapa inicializado con ubicación del operador');
        } else if (origin) {
            // Prioridad 2: Origen
            setMapCenter([origin.lat, origin.lng]);
            setMapZoom(13);
            console.log('🎯 Mapa inicializado con ubicación de origen');
        } else {
            // Prioridad 3: Coordenadas por defecto (Caracas)
            setMapCenter([10.4806, -66.9036]);
            setMapZoom(10);
            console.log('🎯 Mapa inicializado con coordenadas por defecto');
        }
    }, [operatorLocation, origin]);

    // Si no hay centro calculado, mostrar loading
    if (!mapCenter) {
        return (
            <div className="mt-4">
                <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Cargando mapa...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4">
            {/* Panel flotante de información */}
            <div className="absolute top-4 right-4 bg-white bg-opacity-95 rounded-lg shadow-lg p-3 z-[1000] min-w-[200px]">
                <h5 className="font-bold mb-2 text-gray-700 text-sm">Información de ruta</h5>
                <div className="text-xs text-gray-800 space-y-1">
                    {operatorLocation && operatorLocation.lat && operatorLocation.lng ? (
                        <div className="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                            <div className="font-semibold text-blue-700">🚛 Operador:</div>
                            <div className="text-gray-600">
                                {operatorLocation.lat.toFixed(6)}, {operatorLocation.lng.toFixed(6)}
                            </div>
                            {operatorLocation.accuracy && (
                                <div className="text-[10px] text-blue-600">
                                    Precisión: {operatorLocation.accuracy.toFixed(1)}m
                                </div>
                            )}
                        </div>
                    ) : operatorLoading ? (
                        <div className="text-blue-600">⏳ Obteniendo ubicación...</div>
                    ) : (
                        <div className="text-gray-500">❓ Sin ubicación</div>
                    )}
                    {origin && (
                        <div>
                            <span className="font-semibold text-green-600">📍 Origen:</span>
                            <div className="text-gray-600">
                                {origin.lat.toFixed(6)}, {origin.lng.toFixed(6)}
                            </div>
                        </div>
                    )}
                    {destination && (
                        <div>
                            <span className="font-semibold text-red-600">🎯 Destino:</span>
                            <div className="text-gray-600">
                                {destination.lat.toFixed(6)}, {destination.lng.toFixed(6)}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200">
                <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: "100%", width: "100%" }}
                    key={`map-${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    <MapUpdater 
                        operatorLocation={operatorLocation} 
                        origin={origin} 
                        destination={destination}
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
                                    <div className="font-bold text-blue-600">🚛 Operador</div>
                                    <div className="text-xs text-gray-600">
                                        Lat: {operatorLocation.lat.toFixed(6)}<br/>
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
                    {origin && (
                        <Marker
                            position={[origin.lat, origin.lng]}
                            icon={originIcon}
                        >
                            <Popup>
                                <div className="text-center">
                                    <div className="font-bold text-green-600">📍 Punto de origen</div>
                                    <div className="text-xs text-gray-600">
                                        {demand.currentLocation?.name || 'Ubicación actual'}<br/>
                                        Lat: {origin.lat.toFixed(6)}<br/>
                                        Lng: {origin.lng.toFixed(6)}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Marcador de destino */}
                    {destination && (
                        <Marker
                            position={[destination.lat, destination.lng]}
                            icon={destinationIcon}
                        >
                            <Popup>
                                <div className="text-center">
                                    <div className="font-bold text-red-600">🎯 Punto de destino</div>
                                    <div className="text-xs text-gray-600">
                                        {demand.destinationLocation?.name || 'Destino'}<br/>
                                        Lat: {destination.lat.toFixed(6)}<br/>
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
}

export default function CustomerRequests() {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stateFilter, setStateFilter] = useState("");
    const [page, setPage] = useState(0);
    const [size] = useState(5);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState("details"); // "details" o "cancel"

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

    const fetchRequests = async () => {
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
            setRequests(data.content || []);
        } catch (err) {
            console.error(err);
            setError("Error cargando solicitudes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [page, size, stateFilter]);

    const handleFilterChange = (e) => {
        setStateFilter(e.target.value);
        setPage(0);
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

            if (!response.ok) throw new Error("No se pudo cancelar");

            setRequests((prev) =>
                prev.map((r) => (r.id === selectedRequest.id ? {...r, state: "CANCELLED"} : r))
            );
            setModalOpen(false);
        } catch (err) {
            console.error("Error cancelando solicitud:", err);
            alert("Error al cancelar la solicitud");
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
                {takenRequest && (
                    <div className="text-xs text-green-600">
                        🚗 Operador en camino
                    </div>
                )}
            </div>

            {/* Filtro de estado */}
            <div className="mb-4">
                <select
                    value={stateFilter}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                    <p className="text-sm text-muted-foreground">Cargando solicitudes...</p>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-sm text-red-500 mb-2">{error}</p>
                    <button 
                        onClick={fetchRequests} 
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
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
                        
                        return (
                            <div key={req.id} className={`border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow ${
                                isTaken ? 'border-green-300 bg-green-50' : 
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
                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors"
                                        >
                                            {isTaken ? 'Seguir' : 'Ver'}
                                        </button>
                                        {isActive && (
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

                        {/* Seguimiento del operador (solo para solicitudes tomadas) */}
                        {selectedRequest.state === "TAKEN" && (
                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="font-medium text-gray-700 mb-3">🚗 Seguimiento del operador</h4>
                                
                                {/* Mapa con seguimiento del operador */}
                                <TrackingMap 
                                    demand={selectedRequest}
                                    operatorLocation={operatorLocation}
                                    operatorLoading={operatorLoading}
                                />

                                {/* Información adicional del operador */}
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {operatorLoading ? (
                                        <div className="flex items-center justify-center py-4 col-span-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
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
                                                        <span className="text-blue-600">📱</span>
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
                                            ) : operatorLocation.lat && operatorLocation.lng ? (
                                                // Tenemos coordenadas reales
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
                                            ) : (
                                                // No hay información de ubicación
                                                <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg col-span-2">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-gray-600">❓</span>
                                                        <span className="font-medium text-gray-800">Información limitada</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        No hay información de ubicación disponible del operador en este momento.
                                                    </p>
                                                </div>
                                            )}

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
        </div>
    );
}