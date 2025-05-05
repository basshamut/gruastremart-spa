import { useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useOperatorLocation } from "../../hooks/common/useOperatorLocation";
import { useUserLocation } from "../../hooks/customer/useUserLocation";
import { useDestinationSearch } from "../../hooks/customer/useDestinationSearch";
import { useLeafletMap } from "../../hooks/customer/useLeafletMap";

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
    const mapRef = useRef(null);
    const [operatorLocation, setOperatorLocation] = useState(null);

    // Hook para ubicación del usuario
    const { location, error: userError, getLocation, setLocation } = useUserLocation(onLocationChange);
    // Hook para búsqueda de destino
    const { searchLocation, setSearchLocation, error: destError, setError: setDestError, searchQuery, setSearchQuery, searchPlace } = useDestinationSearch(location, onDestinationChange);
    // Hook para el mapa
    useLeafletMap(mapRef, location, searchLocation, operatorLocation, takenState, userIcon, destinationIcon, operatorIcon);
    // Hook para ubicación del operador
    useOperatorLocation(
        takenState === "TAKEN" ? craneDemandId : null,
        (location) => setOperatorLocation(location)
    );

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
                    {(userError || destError) && <p className="text-red-500">{userError || destError}</p>}
                </div>
            </div>
            <div id="map" className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] mt-4 rounded shadow-lg"></div>
        </div>
    );
}
