import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useEffect } from 'react';

export function useTakenDemandNotification(craneDemandId, onTakenDemand) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    const stompClient = new Client({
        webSocketFactory: () => new SockJS(`${apiDomain}/ws`),
        connectHeaders: {
            Authorization: `Bearer ${token}`,
        },
        onConnect: () => {
            if (!craneDemandId) return;
            const topic = `/topic/demand-taken/${craneDemandId}`;
            stompClient.subscribe(topic, (message) => {
                const data = JSON.parse(message.body);
                onTakenDemand(data);
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
