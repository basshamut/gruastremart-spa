import { useState, useEffect, useCallback, useRef } from 'react';
import { 
    getOperatorLocation, 
    updateOperatorLocation, 
    getOperatorLocationStatus 
} from '../../services/OperatorLocationService';

/**
 * Hook para manejar la ubicación del operador usando endpoints REST
 * @param {string} operatorUserId - ID del operador asignado (operatorUserId de la demanda)
 * @param {number} updateInterval - Intervalo en segundos para actualizar ubicación (default: 30)
 * @param {boolean} autoUpdate - Si debe actualizar automáticamente (default: true)
 * @returns {Object} - Estado y funciones para manejar la ubicación
 */
export function useOperatorLocationService(operatorUserId, updateInterval = 30, autoUpdate = true) {
    const [location, setLocation] = useState(null);
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const intervalRef = useRef(null);

    /**
     * Obtiene la ubicación actual del operador
     */
    const fetchLocation = useCallback(async () => {
        if (!operatorUserId) return;

        setIsLoading(true);
        setError(null);

        try {
            const locationData = await getOperatorLocation(operatorUserId);
            
            // Convertir de latitude/longitude a lat/lng para compatibilidad con el frontend
            if (locationData && (locationData.latitude || locationData.longitude)) {
                const convertedLocation = {
                    lat: locationData.latitude,
                    lng: locationData.longitude,
                    accuracy: locationData.accuracy,
                    timestamp: locationData.timestamp,
                    status: locationData.status,
                    operatorId: locationData.operatorId
                };
                setLocation(convertedLocation);
            }
        } catch (err) {
            setError(err.message);
            console.error("❌ Error obteniendo ubicación del operador:", err);
        } finally {
            setIsLoading(false);
        }
    }, [operatorUserId]);

    /**
     * Actualiza la ubicación del operador
     */
    const updateLocation = useCallback(async (newLocation) => {
        if (!operatorUserId) return;

        setIsUpdating(true);
        setError(null);

        try {
            const response = await updateOperatorLocation(operatorUserId, newLocation);
            
            // Convertir la respuesta del backend si contiene latitude/longitude
            let locationWithCoords = newLocation;
            if (response && (response.latitude || response.longitude)) {
                locationWithCoords = {
                    lat: response.latitude || newLocation.lat,
                    lng: response.longitude || newLocation.lng,
                    accuracy: response.accuracy || newLocation.accuracy,
                    timestamp: response.timestamp || newLocation.timestamp,
                    status: response.status || newLocation.status,
                    operatorId: response.operatorId
                };
            }
            
            setLocation(locationWithCoords);
            return response;
        } catch (err) {
            setError(err.message);
            console.error("❌ Error actualizando ubicación del operador:", err);
            throw err;
        } finally {
            setIsUpdating(false);
        }
    }, [operatorUserId]);

    /**
     * Obtiene el estado de la ubicación del operador
     */
    const fetchStatus = useCallback(async () => {
        if (!operatorUserId) return;

        try {
            const statusData = await getOperatorLocationStatus(operatorUserId);
            setStatus(statusData);
            return statusData;
        } catch (err) {
            console.error("❌ Error obteniendo estado de ubicación:", err);
            throw err;
        }
    }, [operatorUserId]);

    /**
     * Actualiza la ubicación usando GPS del navegador
     */
    const updateLocationFromGPS = useCallback(async () => {
        if (!navigator.geolocation) {
            const errorMsg = "La geolocalización no es compatible con este navegador.";
            setError(errorMsg);
            throw new Error(errorMsg);
        }

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const locationData = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date().toISOString()
                    };

                    try {
                        await updateLocation(locationData);
                        resolve(locationData);
                    } catch (err) {
                        reject(err);
                    }
                },
                (err) => {
                    let errorMsg = "Error obteniendo ubicación GPS";
                    switch(err.code) {
                        case err.PERMISSION_DENIED:
                            errorMsg = "Permiso de ubicación denegado";
                            break;
                        case err.POSITION_UNAVAILABLE:
                            errorMsg = "Información de ubicación no disponible";
                            break;
                        case err.TIMEOUT:
                            errorMsg = "Tiempo de espera agotado";
                            break;
                        default:
                            errorMsg = `Error desconocido: ${err.message}`;
                    }
                    setError(errorMsg);
                    reject(new Error(errorMsg));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                }
            );
        });
    }, [updateLocation]);

    /**
     * Inicia la actualización automática de ubicación
     */
    const startAutoUpdate = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Actualizar inmediatamente
        updateLocationFromGPS();

        // Configurar intervalo
        intervalRef.current = setInterval(() => {
            updateLocationFromGPS();
        }, updateInterval * 1000);

    }, [updateLocationFromGPS, updateInterval]);

    /**
     * Detiene la actualización automática
     */
    const stopAutoUpdate = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    /**
     * Efecto para actualización automática
     */
    useEffect(() => {
        if (autoUpdate && operatorUserId) {
            startAutoUpdate();
        }

        return () => {
            stopAutoUpdate();
        };
    }, [autoUpdate, operatorUserId, startAutoUpdate, stopAutoUpdate]);

    /**
     * Efecto para obtener ubicación inicial y estado
     */
    useEffect(() => {
        if (operatorUserId) {
            fetchLocation();
            fetchStatus();
        }
    }, [operatorUserId, fetchLocation, fetchStatus]);

    return {
        // Estados
        location,
        status,
        error,
        isLoading,
        isUpdating,
        
        // Funciones
        fetchLocation,
        updateLocation,
        updateLocationFromGPS,
        fetchStatus,
        startAutoUpdate,
        stopAutoUpdate
    };
} 