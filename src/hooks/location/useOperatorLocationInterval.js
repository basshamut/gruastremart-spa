import {useState, useEffect, useRef, useCallback} from "react";

export function useOperatorLocationInterval(intervalSeconds = 10, craneDemandId = null) {
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
        console.log("🔍 Solicitando ubicación GPS...");

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

                console.log("📍 Localización del Operador:", {
                    Coordenadas: `${lat}, ${lon}`,
                    Precisión: `${position.coords.accuracy}m`,
                    Hora: new Date(timestamp).toLocaleString()
                });
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
                console.warn("⚠️ Geolocation Warning:", errorMsg);
                // No detener el tracking por errores temporales
                console.log("🔄 Continuando con el siguiente intento de localización...");
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

        console.log(`🚀 Iniciando seguimiento de localización del operador cada ${intervalSeconds} segundo(s)`);
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

        console.log("⏹️ Deteniendo seguimiento de localización del operador");
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
