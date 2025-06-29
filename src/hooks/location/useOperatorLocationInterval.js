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
        // HARDCODE: ubicación fija para pruebas
        const lat = 41.4036299; // Ejemplo: Sagrada Familia, Barcelona
        const lon = 2.1743558;
        const timestamp = new Date().toISOString();

        const currentLocation = {
            latitude: lat,
            longitude: lon,
            accuracy: 5,
            timestamp: timestamp,
            name: "Ubicación Hardcodeada",
        };

        setLocation(currentLocation);
        setError(null);

        // Enviar ubicación al servidor vía WebSocket
        if (stompClientRef.current && stompClientRef.current.connected) {
            const locationData = {
                lat: lat,
                lng: lon,
                timestamp: timestamp,
                accuracy: 5
            };
            stompClientRef.current.publish({
                destination: `/app/operator-location/broadcast`,
                body: JSON.stringify(locationData)
            });
            console.log("📡 Ubicación HARDCODEADA enviada al servidor:", locationData);
        }

        console.log("📍 Localización del Operador (HARDCODEADA):", {
            Coordenadas: `${lat}, ${lon}`,
            Precisión: `5m`,
            Hora: new Date(timestamp).toLocaleString()
        });
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
