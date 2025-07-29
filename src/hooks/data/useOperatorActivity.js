import { useEffect, useState } from 'react';
import { useOperatorLocationInterval } from '../location/useOperatorLocationInterval';

export const useOperatorActivity = (
    locationInterval = 30,
    errorCountdown = 30,
    demandsRefreshInterval = 30 // Nueva opción para el intervalo de actualización de solicitudes
) => {
    // Estados para notificaciones
    const [pendingNotificationsForActiveDemands, setPendingNotificationsForActiveDemands] = useState([]);
    const [hasNewNotifications, setHasNewNotifications] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    // Estados para contador regresivo
    const [countdown, setCountdown] = useState(errorCountdown);

    // Hook para seguimiento de ubicación del operador
    const { 
        location: operatorLocation,
        error: locationError,
        isTracking,
        startTracking, 
        stopTracking 
    } = useOperatorLocationInterval(locationInterval);

    /**
     * Inicia el seguimiento de localización cuando se monta el componente
     * y lo detiene cuando se desmonta
     */
    useEffect(() => {
        startTracking();

        // Cleanup: detener el seguimiento cuando se desmonta el componente
        return () => {
            stopTracking();
        };
    }, [startTracking, stopTracking]);

    /**
     * Maneja el contador regresivo para reintentos de localización
     */
    useEffect(() => {
        if (locationError) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        // Reiniciar contador y intentar obtener ubicación nuevamente
                        setCountdown(errorCountdown);
                        startTracking();
                        return errorCountdown;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        } else {
            setCountdown(errorCountdown);
        }
    }, [locationError, errorCountdown, startTracking]);

    /**
     * Actualización automática de solicitudes cada 30 segundos
     */
    useEffect(() => {
        const interval = setInterval(() => {
            setRefreshTrigger(prev => prev + 1);
        }, demandsRefreshInterval * 1000); // Convertir segundos a milisegundos

        return () => clearInterval(interval);
    }, [demandsRefreshInterval]);

    /**
     * Función para refrescar datos manualmente
     */
    const refreshData = () => {
        setRefreshTrigger(prev => prev + 1);
        setPendingNotificationsForActiveDemands([]);
        setHasNewNotifications(false);
    };

    return {
        operatorLocation,
        locationError,
        isTracking,
        countdown,
        pendingNotificationsForActiveDemands,
        hasNewNotifications,
        refreshTrigger,
        refreshData
    };
}; 