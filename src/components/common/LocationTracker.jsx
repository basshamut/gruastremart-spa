import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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
    console.log('origin:', origin);
    console.log('destination:', destination);
    console.log('initialLocation:', initialLocation);

    // Calcular el centro del mapa basado en los puntos disponibles
    const calculateMapCenter = () => {
        if (origin && typeof origin.lat === 'number' && typeof origin.lng === 'number') {
            return [origin.lat, origin.lng];
        }
        if (initialLocation && typeof initialLocation.lat === 'number' && typeof initialLocation.lng === 'number') {
            return [initialLocation.lat, initialLocation.lng];
        }
        return [19.4326, -99.1332]; // Coordenadas por defecto (CDMX)
    };

    return (
        <div className="mt-4">
            {/* Panel flotante de coordenadas */}
            <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded shadow-lg p-4 z-[1000] min-w-[220px]">
                <h5 className="font-bold mb-2 text-gray-700 text-sm">Coordenadas</h5>
                <div className="text-xs text-gray-800">
                    <div className="mb-1">
                        <span className="font-semibold">Destino:</span> {destination && typeof destination.lat === 'number' && typeof destination.lng === 'number' 
                            ? `${destination.lat.toFixed(6)}, ${destination.lng.toFixed(6)}` 
                            : 'Sin datos'}
                    </div>
                    <div>
                        <span className="font-semibold">Origen:</span> {origin && typeof origin.lat === 'number' && typeof origin.lng === 'number'
                            ? `${origin.lat.toFixed(6)}, ${origin.lng.toFixed(6)}` 
                            : 'Sin datos'}
                    </div>
                </div>
            </div>

            <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-200">
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
                    {origin && typeof origin.lat === 'number' && typeof origin.lng === 'number' && (
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
                    {destination && typeof destination.lat === 'number' && typeof destination.lng === 'number' && (
                        <Marker
                            position={[destination.lat, destination.lng]}
                            icon={destinationIcon}
                        >
                            <Popup>
                                Punto de destino
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
        </div>
    );
}
