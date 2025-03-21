import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

export default function GeoLocation({ onLocationChange, onDestinationChange }) {
    const [location, setLocation] = useState(null);
    const [searchLocation, setSearchLocation] = useState(null);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const mapRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map("map").setView([51.505, -0.09], 13);

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
                L.marker([location.latitude, location.longitude], { icon: userIcon }).addTo(map)
                    .bindPopup("Tu ubicación actual").openPopup();
            }

            if (searchLocation) {
                L.marker([searchLocation.latitude, searchLocation.longitude], { icon: destinationIcon }).addTo(map)
                    .bindPopup(`Destino: ${searchQuery}`).openPopup();
            }

            if (location && searchLocation) {
                map.fitBounds([
                    [location.latitude, location.longitude],
                    [searchLocation.latitude, searchLocation.longitude]
                ]);
            }
        }
    }, [location, searchLocation, searchQuery]);

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError("La geolocalización no es compatible con este navegador.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const currentLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                };
                setLocation(currentLocation);
                setError(null);
                if (onLocationChange) {
                    onLocationChange(currentLocation);
                }
            },
            (err) => {
                setError("Error obteniendo ubicación: " + err.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    const searchPlace = async () => {
        if (!searchQuery) return;
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
            );
            const data = await response.json();
            if (data.length > 0) {
                const location = {
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon),
                };
                setSearchLocation(location);
                if (onDestinationChange) {
                    onDestinationChange(location);
                }
                setError(null);
            } else {
                setError("No se encontró la ubicación");
            }
        } catch {
            setError("Error en la búsqueda");
        }
    };

    return (
        <div className="flex flex-col items-center p-6 w-full max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Solicitud de Servicio de Grúa</h2>


            <button
                onClick={getLocation}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mb-4"
            >
                Obtener Ubicación Actual
            </button>

            <div className="mb-4 flex w-full">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar lugar de destino..."
                    className="flex-1 border px-2 py-1 rounded mr-2"
                />
                <button
                    onClick={searchPlace}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                    Destino
                </button>
            </div>

            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

            <div id="map" className="w-full h-96 mt-4 rounded shadow-lg"></div>
        </div>
    );
}
