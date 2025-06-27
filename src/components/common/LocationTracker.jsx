import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useLocationTracking } from "../../hooks/useLocationTracking";
import { useOperatorLocation } from "../../hooks/useOperatorLocation";
import { useState } from "react";
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

const operatorIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/9614/9614333.png", // Icono de grúa
    iconSize: [32, 37],
    iconAnchor: [16, 37],
    popupAnchor: [0, -28],
});

export default function LocationTracker({ craneDemandId, initialLocation, origin, destination, onOperatorLocationUpdate }) {
    const [operatorLocation, setOperatorLocation] = useState(null);
    const { isTracking, setIsTracking, error } = useLocationTracking(craneDemandId);

    console.log('origin:', origin);
    console.log('destination:', destination);
    console.log('initialLocation:', initialLocation);

    // Suscribirse a la ubicación del operador
    useOperatorLocation(craneDemandId, (location) => {
        setOperatorLocation(location);
        if (onOperatorLocationUpdate) onOperatorLocationUpdate(location);
    });

    // Calcular el centro del mapa basado en los puntos disponibles
    const calculateMapCenter = () => {
        if (operatorLocation) {
            return [operatorLocation.lat, operatorLocation.lng];
        }
        if (origin) {
            return [origin.lat, origin.lng];
        }
        if (initialLocation) {
            return [initialLocation.lat, initialLocation.lng];
        }
        // Coordenadas por defecto (puedes ajustarlas según tu ubicación)
        return [19.4326, -99.1332];
    };

    return (
        <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold">Seguimiento de ubicación</h4>
                <button
                    onClick={() => setIsTracking(!isTracking)}
                    className={`px-4 py-2 rounded font-medium ${
                        isTracking
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                >
                    {isTracking ? 'Detener seguimiento' : 'Iniciar seguimiento'}
                </button>
            </div>
            {/* Panel flotante de coordenadas */}
            <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded shadow-lg p-4 z-[1000] min-w-[220px]">
                <h5 className="font-bold mb-2 text-gray-700 text-sm">Flujo de coordenadas</h5>
                <div className="text-xs text-gray-800">
                    <div className="mb-1">
                        <span className="font-semibold">Operador:</span> {operatorLocation ? `${operatorLocation.lat.toFixed(6)}, ${operatorLocation.lng.toFixed(6)}` : 'Sin datos'}
                    </div>
                    <div className="mb-1">
                        <span className="font-semibold">Destino:</span> {destination ? `${destination.lat.toFixed(6)}, ${destination.lng.toFixed(6)}` : 'Sin datos'}
                    </div>
                    <div>
                        <span className="font-semibold">Origen:</span> {origin ? `${origin.lat.toFixed(6)}, ${origin.lng.toFixed(6)}` : 'Sin datos'}
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {isTracking && (
                <p className="text-sm text-gray-600 mb-4">
                    Compartiendo ubicación en tiempo real...
                </p>
            )}

            <div className="h-[400px] w-full rounded-lg overflow-hidden">
                <MapContainer
                    center={calculateMapCenter()}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {/* Marcador de origen */}
                    {origin && (
                        <Marker
                            position={[origin.lat, origin.lng]}
                            icon={originIcon}
                        >
                            <Popup>
                                Punto de origen
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
                                Punto de destino
                            </Popup>
                        </Marker>
                    )}

                    {/* Marcador del operador */}
                    {operatorLocation && (
                        <Marker
                            position={[operatorLocation.lat, operatorLocation.lng]}
                            icon={operatorIcon}
                        >
                            <Popup>
                                Ubicación actual del operador
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
        </div>
    );
}
