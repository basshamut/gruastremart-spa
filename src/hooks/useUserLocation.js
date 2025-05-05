import { useState } from "react";

export function useUserLocation(onLocationChange) {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);

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

    return { location, error, getLocation, setLocation };
} 