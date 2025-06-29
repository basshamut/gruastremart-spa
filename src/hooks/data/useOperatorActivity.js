import { useEffect, useState } from 'react';
import { useOperatorLocationInterval } from '../location/useOperatorLocationInterval';

/**
 * Hook personalizado que maneja toda la lógica de actividad del operador
 * 
 * @param {number} locationInterval - Intervalo en segundos para actualizar la ubicación (default: 30)
 * @param {number} errorCountdown - Tiempo en segundos para el contador regresivo de errores (default: 30)
 * @param {number} notificationDelay - Delay en ms antes de refrescar datos tras nuevas notificaciones (default: 5000)
 * @returns {Object} Objeto con toda la información y funciones necesarias para el operador
 * 
 * @example
 * const {
 *   operatorLocation,
 *   locationError,
 *   isTracking,
 *   countdown,
 *   pendingNotifications,
 *   hasNewNotifications,
 *   refreshData,
 *   startTracking,
 *   stopTracking
 * } = useOperatorActivity();
 */
export const useOperatorActivity = (
    locationInterval = 30,
    errorCountdown = 30,
    notificationDelay = 5000
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
        refreshData,
        startTracking,
        stopTracking
    };
}; 