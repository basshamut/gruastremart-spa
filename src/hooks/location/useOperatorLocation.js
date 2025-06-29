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
            if (!craneDemandId) return;
            const topic = `/topic/operator-location/${craneDemandId}`;
            stompClient.subscribe(topic, (message) => {
                const location = JSON.parse(message.body);
                console.log("📍 Ubicación del operador recibida:", location);
                onLocationUpdate(location);
            });
        },
        reconnectDelay: 5000,
    });

    useEffect(() => {
        if (!craneDemandId) return;
        stompClient.activate();
        return () => stompClient.deactivate();
    }, [craneDemandId]);
} 