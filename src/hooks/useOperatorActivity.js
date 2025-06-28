import { useEffect, useState } from 'react';
import { useOperatorLocationInterval } from './useOperatorLocationInterval';
import { useCraneNotifications } from './useCraneNotifications';

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
     * Maneja nuevas notificaciones de grúas
     * Se ejecuta cuando llega una nueva solicitud de grúa
     */
    const handleNewDemand = (newCraneDemand) => {
        setPendingNotificationsForActiveDemands(prev => [...prev, newCraneDemand]);
        setHasNewNotifications(true);
    };

    // Suscribirse a notificaciones de grúas
    useCraneNotifications(handleNewDemand);

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
     * Maneja el contador regresivo para errores de ubicación
     * - Reinicia el contador cuando hay error y no hay ubicación
     * - Resetea el contador cuando no hay error
     * - El contador se reinicia automáticamente cada 30 segundos
     */
    useEffect(() => {
        let interval;
        
        if (locationError && !operatorLocation) {
            // Reiniciar contador cuando hay error
            setCountdown(errorCountdown);
            
            interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        return errorCountdown; // Reiniciar al valor inicial
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            // Resetear contador cuando no hay error
            setCountdown(errorCountdown);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [locationError, operatorLocation, errorCountdown]);

    /**
     * Refresca automáticamente los datos cuando hay nuevas notificaciones
     * Se ejecuta después de un delay configurable para evitar refrescos excesivos
     */
    useEffect(() => {
        if (hasNewNotifications) {
            const timer = setTimeout(() => {
                refreshData();
            }, notificationDelay);
            return () => clearTimeout(timer);
        }
    }, [hasNewNotifications, notificationDelay]);

    /**
     * Función para refrescar manualmente los datos
     * Limpia las notificaciones pendientes y incrementa el trigger de refresh
     */
    const refreshData = () => {
        setRefreshTrigger(prev => prev + 1);
        setPendingNotificationsForActiveDemands([]);
        setHasNewNotifications(false);
    };

    return {
        // Estados de ubicación
        operatorLocation,
        locationError,
        isTracking,
        countdown,
        
        // Estados de notificaciones
        pendingNotificationsForActiveDemands,
        hasNewNotifications,
        refreshTrigger,
        
        // Funciones
        refreshData,
        startTracking,
        stopTracking
    };
}; 