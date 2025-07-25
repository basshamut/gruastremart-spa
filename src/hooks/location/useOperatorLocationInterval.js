import {useState, useEffect, useRef, useCallback} from "react";

export function useOperatorLocationInterval(intervalSeconds = 10) {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const intervalRef = useRef(null);

    const getLocation = useCallback(() => {
        if (!navigator.geolocation) {
            const errorMsg = "La geolocalización no es compatible con este navegador.";
            setError(errorMsg);
            setIsLoading(false);
            console.error("❌ Operador Location Error:", errorMsg);
            return;
        }

        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const timestamp = new Date().toISOString();

                // Crear ubicación real
                const currentLocation = {
                    latitude: lat,
                    longitude: lon,
                    accuracy: position.coords.accuracy,
                    timestamp: timestamp,
                    name: "Ubicación GPS",
                };

                setLocation(currentLocation);
                setError(null);
                setIsLoading(false);

            },
            (err) => {
                let errorMsg = "Error obteniendo ubicación";
                // Manejar diferentes tipos de errores de geolocalización
                switch(err.code) {
                    case err.PERMISSION_DENIED:
                        errorMsg = "Permiso de ubicación denegado por el usuario";
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMsg = "Información de ubicación no disponible";
                        break;
                    case err.TIMEOUT:
                        errorMsg = "Tiempo de espera agotado al obtener ubicación";
                        break;
                    default:
                        errorMsg = `Error desconocido obteniendo ubicación: ${err.message}`;
                        break;
                }
                setError(errorMsg);
                setIsLoading(false);
                // No detener el tracking por errores temporales
                console.warn("⚠️ Geolocation Warning:", errorMsg);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000, // 15 segundos
                maximumAge: 0, // Forzar ubicación fresca
            }
        );
    }, []);

    const startTracking = useCallback(() => {
        if (isTracking) return;

        setIsTracking(true);
        setIsLoading(true);

        // Obtener ubicación inmediatamente
        getLocation();

        // Configurar intervalo
        intervalRef.current = setInterval(() => {
            getLocation();
        }, intervalSeconds * 1000); // Convertir segundos a milisegundos
    }, [isTracking, intervalSeconds, getLocation]);

    const stopTracking = useCallback(() => {
        if (!isTracking) return;

        setIsTracking(false);
        setIsLoading(false);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, [isTracking]);

    // Limpiar intervalo al desmontar el componente
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return {
        location,
        error,
        isTracking,
        isLoading,
        startTracking,
        stopTracking,
        getLocation
    };
}
