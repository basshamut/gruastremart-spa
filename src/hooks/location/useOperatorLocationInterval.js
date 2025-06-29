import {useState, useEffect, useRef, useCallback} from "react";
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export function useOperatorLocationInterval(intervalSeconds = 30) {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const intervalRef = useRef(null);
    const stompClientRef = useRef(null);
    const [activeDemandIds, setActiveDemandIds] = useState([]);
    
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    // Obtener las demandas activas del operador
    const fetchActiveDemands = useCallback(async () => {
        try {
            const userId = JSON.parse(localStorage.getItem("userDetail")).id;
            const response = await fetch(`${apiDomain}/v1/crane-demands?state=TAKEN&assignedToUserId=${userId}&page=0&size=100`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                const demandIds = data.content?.map(demand => demand.id) || [];
                setActiveDemandIds(demandIds);
                console.log("📋 Demandas activas del operador:", demandIds);
            }
        } catch (err) {
            console.error("❌ Error obteniendo demandas activas:", err);
        }
    }, [apiDomain, token]);

    // Inicializar cliente WebSocket
    useEffect(() => {
        stompClientRef.current = new Client({
            webSocketFactory: () => new SockJS(`${apiDomain}/ws`),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
        });

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [apiDomain, token]);

    const getLocation = useCallback(() => {
        if (!navigator.geolocation) {
            const errorMsg = "La geolocalización no es compatible con este navegador.";
            setError(errorMsg);
            console.error("❌ Operador Location Error:", errorMsg);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const timestamp = new Date().toISOString();

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
                    );
                    const data = await response.json();

                    const currentLocation = {
                        latitude: lat,
                        longitude: lon,
                        accuracy: position.coords.accuracy,
                        timestamp: timestamp,
                        name: data.display_name || "Ubicación desconocida",
                    };

                    setLocation(currentLocation);
                    setError(null);

                    // Enviar ubicación al servidor vía WebSocket a todas las demandas activas
                    if (stompClientRef.current && stompClientRef.current.connected && activeDemandIds.length > 0) {
                        const locationData = {
                            lat: lat,
                            lng: lon,
                            timestamp: timestamp,
                            accuracy: position.coords.accuracy
                        };
                        
                        // Enviar a cada demanda activa
                        activeDemandIds.forEach(demandId => {
                            stompClientRef.current.publish({
                                destination: `/app/operator-location/${demandId}`,
                                body: JSON.stringify(locationData)
                            });
                        });
                        
                        console.log("📡 Ubicación enviada a demandas activas:", activeDemandIds, locationData);
                    }

                    // Log en consola con formato claro
                    console.log("📍 Localización del Operador:", {
                        Coordenadas: `${lat}, ${lon}`,
                        Precisión: `${position.coords.accuracy}m`,
                        Ubicación: currentLocation.name,
                        Hora: new Date(timestamp).toLocaleString()
                    });

                } catch (err) {
                    const errorMsg = "No se pudo obtener el nombre de la ubicación.";
                    setError(errorMsg);
                    console.error("❌ Error obteniendo nombre de ubicación:", err);

                    // Aún así guardamos las coordenadas
                    const currentLocation = {
                        latitude: lat,
                        longitude: lon,
                        accuracy: position.coords.accuracy,
                        timestamp: timestamp,
                        name: "Ubicación sin nombre",
                    };
                    setLocation(currentLocation);

                    // Enviar ubicación al servidor vía WebSocket (sin nombre)
                    if (stompClientRef.current && stompClientRef.current.connected && activeDemandIds.length > 0) {
                        const locationData = {
                            lat: lat,
                            lng: lon,
                            timestamp: timestamp,
                            accuracy: position.coords.accuracy
                        };
                        
                        // Enviar a cada demanda activa
                        activeDemandIds.forEach(demandId => {
                            stompClientRef.current.publish({
                                destination: `/app/operator-location/${demandId}`,
                                body: JSON.stringify(locationData)
                            });
                        });
                        
                        console.log("📡 Ubicación enviada a demandas activas (sin nombre):", activeDemandIds, locationData);
                    }

                    console.log("📍 Localización del Operador (sin nombre):", {
                        Coordenadas: `${lat}, ${lon}`,
                        Precisión: `${position.coords.accuracy}m`,
                        Hora: new Date(timestamp).toLocaleString()
                    });
                }
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
                console.warn("⚠️ Geolocation Warning:", errorMsg);
                
                // No detener el tracking por errores temporales
                console.log("🔄 Continuando con el siguiente intento de localización...");
            },
            {
                enableHighAccuracy: true,
                timeout: 15000, // Aumentar timeout a 15 segundos
                maximumAge: 0, // Forzar ubicación fresca - NO usar caché
            }
        );
    }, [activeDemandIds]);

    const startTracking = useCallback(() => {
        if (isTracking) return;

        console.log(`🚀 Iniciando seguimiento de localización del operador cada ${intervalSeconds} segundo(s)`);
        setIsTracking(true);

        // Obtener demandas activas antes de iniciar el tracking
        fetchActiveDemands();

        // Activar WebSocket
        if (stompClientRef.current) {
            stompClientRef.current.activate();
        }

        // Obtener ubicación inmediatamente
        getLocation();

        // Configurar intervalo
        intervalRef.current = setInterval(() => {
            // Actualizar demandas activas y obtener ubicación
            fetchActiveDemands();
            getLocation();
        }, intervalSeconds * 1000); // Convertir segundos a milisegundos
    }, [isTracking, intervalSeconds, getLocation, fetchActiveDemands]);

    const stopTracking = useCallback(() => {
        if (!isTracking) return;

        console.log("⏹️ Deteniendo seguimiento de localización del operador");
        setIsTracking(false);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        // Desactivar WebSocket
        if (stompClientRef.current) {
            stompClientRef.current.deactivate();
        }
    }, [isTracking]);

    // Limpiar intervalo al desmontar el componente
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, []);

    return {
        location,
        error,
        isTracking,
        startTracking,
        stopTracking,
        getLocation
    };
}
