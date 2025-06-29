import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useEffect } from 'react';

export function useOperatorLocation(craneDemandId, onLocationUpdate) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    const stompClient = new Client({
        webSocketFactory: () => new SockJS(`${apiDomain}/ws`),
        connectHeaders: {
            Authorization: `Bearer ${token}`,
        },
        onConnect: () => {
            // Suscribirse al broadcast general de ubicación del operador
            const broadcastTopic = `/topic/operator-location/broadcast`;
            stompClient.subscribe(broadcastTopic, (message) => {
                const location = JSON.parse(message.body);
                console.log("📍 Ubicación del operador recibida (broadcast):", location);
                onLocationUpdate(location);
            });

            // Si hay un craneDemandId específico, también suscribirse a ese topic
            if (craneDemandId) {
                const specificTopic = `/topic/operator-location/${craneDemandId}`;
                stompClient.subscribe(specificTopic, (message) => {
                    const location = JSON.parse(message.body);
                    console.log("📍 Ubicación del operador recibida (específica):", location);
                    onLocationUpdate(location);
                });
            }
        },
        reconnectDelay: 5000,
    });

    useEffect(() => {
        stompClient.activate();
        return () => stompClient.deactivate();
    }, [craneDemandId]);
} 