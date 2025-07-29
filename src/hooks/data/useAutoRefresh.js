import { useEffect, useState } from 'react';

/**
 * Hook genérico para auto-refresh de datos
 * @param {number} intervalSeconds - Intervalo en segundos para la actualización automática
 * @returns {object} - Objeto con refreshTrigger y función refreshData
 */
export const useAutoRefresh = (intervalSeconds = 30) => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    /**
     * Actualización automática cada X segundos
     */
    useEffect(() => {
        const interval = setInterval(() => {
            setRefreshTrigger(prev => prev + 1);
        }, intervalSeconds * 1000); // Convertir segundos a milisegundos

        return () => clearInterval(interval);
    }, [intervalSeconds]);

    /**
     * Función para refrescar datos manualmente
     */
    const refreshData = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return {
        refreshTrigger,
        refreshData
    };
};
