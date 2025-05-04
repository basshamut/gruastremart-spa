import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export function useLocationTracking(craneDemandId) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState(null);

    const stompClient = new Client({
        webSocketFactory: () => new SockJS(`${apiDomain}/ws`),
        connectHeaders: {
            Authorization: `Bearer ${token}`,
        },
        onConnect: () => {
            console.log('Conectado al WebSocket');
        },
        onStompError: (frame) => {
            console.error('Error en STOMP:', frame);
            setError('Error de conexión con el servidor');
        },
        reconnectDelay: 5000,
    });

    useEffect(() => {
        if (!craneDemandId) return;

        let watchId = null;

        const startTracking = () => {
            if (!navigator.geolocation) {
                setError('La geolocalización no está disponible en tu navegador');
                return;
            }

            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        timestamp: new Date().toISOString()
                    };

                    // Enviar la ubicación al servidor
                    stompClient.publish({
                        destination: `/app/operator-location/${craneDemandId}`,
                        body: JSON.stringify(location)
                    });
                },
                (error) => {
                    console.error('Error de geolocalización:', error);
                    setError('Error al obtener la ubicación');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        };

        const stopTracking = () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
            }
        };

        if (isTracking) {
            stompClient.activate();
            startTracking();
        } else {
            stopTracking();
            stompClient.deactivate();
        }

        return () => {
            stopTracking();
            stompClient.deactivate();
        };
    }, [craneDemandId, isTracking]);

    return {
        isTracking,
        setIsTracking,
        error
    };
} 