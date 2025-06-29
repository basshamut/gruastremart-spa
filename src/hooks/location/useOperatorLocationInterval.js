import {useState, useEffect, useRef, useCallback} from "react";
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export function useOperatorLocationInterval(intervalSeconds = 30) {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const intervalRef = useRef(null);
    const stompClientRef = useRef(null);
    
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

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

                    // Enviar ubicación al servidor vía WebSocket
                    if (stompClientRef.current && stompClientRef.current.connected) {
                        const locationData = {
                            lat: lat,
                            lng: lon,
                            timestamp: timestamp,
                            accuracy: position.coords.accuracy
                        };
                        
                        // Enviar a todos los clientes suscritos (broadcast general)
                        stompClientRef.current.publish({
                            destination: `/app/operator-location/broadcast`,
                            body: JSON.stringify(locationData)
                        });
                        
                        console.log("📡 Ubicación enviada al servidor:", locationData);
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
                    if (stompClientRef.current && stompClientRef.current.connected) {
                        const locationData = {
                            lat: lat,
                            lng: lon,
                            timestamp: timestamp,
                            accuracy: position.coords.accuracy
                        };
                        
                        stompClientRef.current.publish({
                            destination: `/app/operator-location/broadcast`,
                            body: JSON.stringify(locationData)
                        });
                        
                        console.log("📡 Ubicación enviada al servidor (sin nombre):", locationData);
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
    }, []);

    const startTracking = useCallback(() => {
        if (isTracking) return;

        console.log(`🚀 Iniciando seguimiento de localización del operador cada ${intervalSeconds} segundo(s)`);
        setIsTracking(true);

        // Activar WebSocket
        if (stompClientRef.current) {
            stompClientRef.current.activate();
        }

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
