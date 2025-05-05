import {useState, useEffect, useRef} from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useOperatorLocation } from "../../hooks/common/useOperatorLocation";

const userIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const destinationIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const operatorIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

export default function CustomerGeoLocation({onLocationChange, onDestinationChange, craneDemandId, takenState}) {
    const [location, setLocation] = useState(null);
    const [searchLocation, setSearchLocation] = useState(null);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [operatorLocation, setOperatorLocation] = useState(null);
    const mapRef = useRef(null);

    // Suscribirse a la ubicación del operador si la solicitud está tomada
    useOperatorLocation(
        takenState === "TAKEN" ? craneDemandId : null,
        (location) => setOperatorLocation(location)
    );

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map("map").setView([10.4806, -66.9036], 12);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors"
            }).addTo(mapRef.current);
        }
    }, []);

    useEffect(() => {
        if (mapRef.current) {
            const map = mapRef.current;
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            if (location) {
                L.marker([location.latitude, location.longitude], {icon: userIcon}).addTo(map)
                    .bindPopup(location.name ? `Tu ubicación actual: ${location.name}` : "Tu ubicación actual")
                    .openPopup();
            }

            if (searchLocation) {
                L.marker([searchLocation.latitude, searchLocation.longitude], {icon: destinationIcon}).addTo(map)
                    .bindPopup(searchLocation.name ? `Destino: ${searchLocation.name}` : "Destino")
                    .openPopup();
            }

            // Mostrar ubicación del operador si está disponible y la solicitud está tomada
            if (takenState === "TAKEN" && operatorLocation) {
                L.marker([operatorLocation.lat, operatorLocation.lng], {icon: operatorIcon}).addTo(map)
                    .bindPopup("Ubicación actual del operador");
            }

            // Ajustar el mapa para mostrar todos los puntos
            const bounds = [];
            if (location) bounds.push([location.latitude, location.longitude]);
            if (searchLocation) bounds.push([searchLocation.latitude, searchLocation.longitude]);
            if (takenState === "TAKEN" && operatorLocation) bounds.push([operatorLocation.lat, operatorLocation.lng]);
            if (bounds.length > 1) {
                map.fitBounds(bounds);
            }
        }
    }, [location, searchLocation, operatorLocation, takenState]);

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError("La geolocalización no es compatible con este navegador.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
                    );
                    const data = await response.json();

                    const currentLocation = {
                        latitude: lat,
                        longitude: lon,
                        accuracy: position.coords.accuracy,
                        name: data.display_name || "Ubicación desconocida",
                    };

                    setLocation(currentLocation);
                    setError(null);

                    if (mapRef.current) {
                        mapRef.current.setView([lat, lon], 15);
                    }

                    if (onLocationChange) {
                        onLocationChange(currentLocation);
                    }
                } catch (err) {
                    setError("No se pudo obtener el nombre de la ubicación.");
                }
            },
            (err) => {
                setError("Error obteniendo ubicación. " + err.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    const searchPlace = async () => {
        if (!location) {
            setError("Primero debes obtener tu ubicación actual.");
            return;
        }

        if (!searchQuery) return;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
            );
            const data = await response.json();

            if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);

                const reverseResponse = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
                );
                const reverseData = await reverseResponse.json();

                const destinationLocation = {
                    latitude: lat,
                    longitude: lon,
                    name: reverseData.display_name || searchQuery,
                };

                setSearchLocation(destinationLocation);
                setError(null);

                if (onDestinationChange) {
                    onDestinationChange(destinationLocation);
                }
            } else {
                setError("No se encontró la ubicación");
            }
        } catch {
            setError("Error en la búsqueda");
        }
    };


    return (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Solicitud de Servicio de Grúa</h2>

            <div className="flex flex-col items-center w-fit mx-auto">
                <button
                    onClick={getLocation}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mb-4 min-w-[250px]"
                >
                    Obtener Ubicación Actual
                </button>

                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar lugar de destino..."
                    className="border px-2 py-1 rounded mb-4 min-w-[250px]"
                />

                <button
                    onClick={searchPlace}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors mb-4 min-w-[250px]"
                >
                    Destino
                </button>

                <div className="h-6 mt-2 text-center">
                    {error && <p className="text-red-500">{error}</p>}
                </div>
            </div>
            <div id="map" className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] mt-4 rounded shadow-lg"></div>
        </div>
    );
}
