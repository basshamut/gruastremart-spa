import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useState, useEffect, useRef } from "react";
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

// Componente para actualizar la vista del mapa sin refrescar
function MapUpdater({ operatorLocation, hasInitialized }) {
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
        }
    }, [operatorLocation, map, hasInitialized]);

    return null; // Este componente no renderiza nada
}

export default function LocationTracker({ craneDemandId, initialLocation, origin, destination, operatorLocation, onOperatorLocationUpdate }) {
    const [hasInitialized, setHasInitialized] = useState(false);
    const [mapCenter, setMapCenter] = useState(null);
    const [mapZoom, setMapZoom] = useState(13);

    console.log('📍 LocationTracker - operatorLocation:', operatorLocation);
    console.log('📍 LocationTracker - origin:', origin);
    console.log('📍 LocationTracker - destination:', destination);

    // Calcular el centro inicial del mapa
    useEffect(() => {
        if (operatorLocation && operatorLocation.lat && operatorLocation.lng) {
            // Prioridad 1: Ubicación del operador
            setMapCenter([operatorLocation.lat, operatorLocation.lng]);
            setMapZoom(15);
            setHasInitialized(true);
            console.log('🎯 Mapa inicializado con ubicación del operador');
        } else if (origin && typeof origin.lat === 'number' && typeof origin.lng === 'number') {
            // Prioridad 2: Origen
            setMapCenter([origin.lat, origin.lng]);
            setMapZoom(13);
            console.log('🎯 Mapa inicializado con ubicación de origen');
        } else if (initialLocation && typeof initialLocation.lat === 'number' && typeof initialLocation.lng === 'number') {
            // Prioridad 3: Ubicación inicial
            setMapCenter([initialLocation.lat, initialLocation.lng]);
            setMapZoom(13);
            console.log('🎯 Mapa inicializado con ubicación inicial');
        } else {
            // Prioridad 4: Coordenadas por defecto (CDMX)
            setMapCenter([19.4326, -99.1332]);
            setMapZoom(10);
            console.log('🎯 Mapa inicializado con coordenadas por defecto');
        }
    }, [operatorLocation, origin, initialLocation]);

    // Si no hay centro calculado, mostrar loading
    if (!mapCenter) {
        return (
            <div className="mt-4">
                <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-100">
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
            {/* Panel flotante de coordenadas */}
            <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded shadow-lg p-4 z-[1000] min-w-[220px]">
                <h5 className="font-bold mb-2 text-gray-700 text-sm">Coordenadas</h5>
                <div className="text-xs text-gray-800 space-y-1">
                    {operatorLocation && operatorLocation.lat && operatorLocation.lng && (
                        <div className="mb-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                            <div className="font-semibold text-blue-700">🚛 Operador:</div>
                            <div>{operatorLocation.lat.toFixed(6)}, {operatorLocation.lng.toFixed(6)}</div>
                            {operatorLocation.accuracy && (
                                <div className="text-[10px] text-blue-600">
                                    Precisión: {operatorLocation.accuracy.toFixed(1)}m
                                </div>
                            )}
                        </div>
                    )}
                    <div>
                        <span className="font-semibold">🎯 Destino:</span> {destination && typeof destination.lat === 'number' && typeof destination.lng === 'number' 
                            ? `${destination.lat.toFixed(6)}, ${destination.lng.toFixed(6)}` 
                            : 'Sin datos'}
                    </div>
                    <div>
                        <span className="font-semibold">📍 Origen:</span> {origin && typeof origin.lat === 'number' && typeof origin.lng === 'number'
                            ? `${origin.lat.toFixed(6)}, ${origin.lng.toFixed(6)}` 
                            : 'Sin datos'}
                    </div>
                </div>
            </div>

            <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-200">
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
                    
                    {/* Componente para actualizar la vista sin refrescar */}
                    <MapUpdater operatorLocation={operatorLocation} hasInitialized={hasInitialized} />
                    
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
                                </div>
                            </Popup>
                        </Marker>
                    )}
                    
                    {/* Marcador de origen */}
                    {origin && typeof origin.lat === 'number' && typeof origin.lng === 'number' && (
                        <Marker
                            position={[origin.lat, origin.lng]}
                            icon={originIcon}
                        >
                            <Popup>
                                <div className="text-center">
                                    <div className="font-bold text-green-600">📍 Punto de origen</div>
                                    <div className="text-xs text-gray-600">
                                        Lat: {origin.lat.toFixed(6)}<br/>
                                        Lng: {origin.lng.toFixed(6)}
                                    </div>
                                </div>
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
                                <div className="text-center">
                                    <div className="font-bold text-red-600">🎯 Punto de destino</div>
                                    <div className="text-xs text-gray-600">
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
