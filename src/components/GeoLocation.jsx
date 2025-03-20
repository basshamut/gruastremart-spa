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

export default function GeoLocation() {
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
                L.marker([location.latitud, location.longitud], { icon: userIcon }).addTo(map)
                    .bindPopup("Tu ubicación actual").openPopup();
            }

            if (searchLocation) {
                L.marker([searchLocation.lat, searchLocation.lon], { icon: destinationIcon }).addTo(map)
                    .bindPopup(`Destino: ${searchQuery}`).openPopup();
            }

            if (location && searchLocation) {
                map.fitBounds([
                    [location.latitud, location.longitud],
                    [searchLocation.lat, searchLocation.lon]
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
                setLocation({
                    latitud: position.coords.latitude,
                    longitud: position.coords.longitude,
                    precision: position.coords.accuracy,
                });
                setError(null);
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
                setSearchLocation({ lat: data[0].lat, lon: data[0].lon });
            } else {
                setError("No se encontró la ubicación");
            }
        } catch {
            setError("Error en la búsqueda");
        }
    };

    const clearLocations = () => {
        setLocation(null);
        setSearchLocation(null);
        setSearchQuery("");
        if (mapRef.current) {
            mapRef.current.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    mapRef.current.removeLayer(layer);
                }
            });
            mapRef.current.setView([51.505, -0.09], 13);
        }
    };

    return (
        <div className="flex flex-col items-center p-6 w-full max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-center">Mini App de Geolocalización</h1>

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
                    placeholder="Buscar lugar..."
                    className="flex-1 border px-2 py-1 rounded mr-2"
                />
                <button 
                    onClick={searchPlace} 
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                    Destino
                </button>
            </div>

            <button
                onClick={clearLocations}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors mb-4"
            >
                Limpiar Ubicaciones
            </button>

            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

            <div id="map" className="w-full h-96 mt-4 rounded shadow-lg"></div>
        </div>
    );
}
