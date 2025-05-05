import { useState } from "react";

export function useDestinationSearch(location, onDestinationChange) {
    const [searchLocation, setSearchLocation] = useState(null);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

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

    return {
        searchLocation,
        setSearchLocation,
        error,
        setError,
        searchQuery,
        setSearchQuery,
        searchPlace
    };
} 