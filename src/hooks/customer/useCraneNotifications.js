import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import {useEffect} from "react";

export function useCraneNotifications(onNewDemand) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    const stompClient = new Client({
        webSocketFactory: () => new SockJS(`${apiDomain}/ws`),
        connectHeaders: {
            Authorization: `Bearer ${token}`,
        },
        onConnect: () => {
            stompClient.subscribe("/topic/new-demand", (message) => {
                const nuevaSolicitud = JSON.parse(message.body);
                onNewDemand(nuevaSolicitud);
            });
        },
        reconnectDelay: 5000,
    });

    useEffect(() => {
        stompClient.activate();
        return () => {
            stompClient.deactivate();
        };
    }, []);
} 