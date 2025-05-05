import { useEffect } from "react";
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export function useTakenDemandsWebSocket(requests, apiDomain, token, onTaken) {
    useEffect(() => {
        const clients = [];
        const activeOrTakenIds = requests
            .filter(r => r.state === "ACTIVE" || r.state === "TAKEN")
            .map(r => r.id);

        activeOrTakenIds.forEach(craneDemandId => {
            const stompClient = new Client({
                webSocketFactory: () => new SockJS(`${apiDomain}/ws`),
                connectHeaders: {
                    Authorization: `Bearer ${token}`,
                },
                onConnect: () => {
                    const topic = `/topic/demand-taken/${craneDemandId}`;
                    stompClient.subscribe(topic, (msg) => {
                        if (onTaken) onTaken(craneDemandId, msg);
                    });
                },
                reconnectDelay: 5000,
            });
            stompClient.activate();
            clients.push(stompClient);
        });
        return () => {
            clients.forEach(client => client.deactivate());
        };
    }, [requests, apiDomain, token, onTaken]);
} 