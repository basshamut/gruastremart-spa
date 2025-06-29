import { useState, useEffect, useCallback } from 'react';
import { getOperatorLocation, getOperatorLocationStatus } from '../../services/OperatorLocationService';
import { OPERATOR_STATUS_POLL_INTERVAL } from '../../config/constants.js';

/**
 * Hook para obtener la ubicación de un operador basado en una demanda
 * @param {string} demandId - ID de la demanda
 * @param {number} pollInterval - Intervalo en segundos para hacer polling (default: OPERATOR_STATUS_POLL_INTERVAL)
 * @param {boolean} autoPoll - Si debe hacer polling automático (default: true)
 * @returns {Object} - Estado y funciones para manejar la ubicación del operador
 */
export function useOperatorLocationForDemand(demandId, pollInterval = OPERATOR_STATUS_POLL_INTERVAL, autoPoll = true) {
    const [operatorLocation, setOperatorLocation] = useState(null);
    const [operatorStatus, setOperatorStatus] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [operatorId, setOperatorId] = useState(null);

    /**
     * Obtiene el ID del operador asignado a la demanda
     */
    const fetchOperatorId = useCallback(async () => {
        if (!demandId) return null;

        try {
            const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
            const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

            console.log("🔍 Debug - Obteniendo assignedOperatorId de la demanda:", demandId);

            const response = await fetch(`${apiDomain}/v1/crane-demands/${demandId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Error al obtener información de la demanda");
            }

            const demandData = await response.json();
            console.log("🔍 Debug - Datos de la demanda:", demandData);
            console.log("🔍 Debug - assignedOperatorId:", demandData.assignedOperatorId);
            
            return demandData.assignedOperatorId || null;
        } catch (err) {
            console.error("❌ Error obteniendo ID del operador:", err);
            return null;
        }
    }, [demandId]);

    /**
     * Obtiene la ubicación del operador
     */
    const fetchOperatorLocation = useCallback(async () => {
        if (!operatorId) return;

        setIsLoading(true);
        setError(null);

        try {
            const locationData = await getOperatorLocation(operatorId);
            
            // Verificar si la respuesta contiene coordenadas reales
            if (locationData && (locationData.latitude || locationData.longitude)) {
                // Convertir de latitude/longitude a lat/lng para compatibilidad
                const convertedLocation = {
                    lat: locationData.latitude,
                    lng: locationData.longitude,
                    accuracy: locationData.accuracy,
                    timestamp: locationData.timestamp,
                    status: locationData.status,
                    operatorId: locationData.operatorId
                };
                setOperatorLocation(convertedLocation);
            } else if (locationData && locationData.status) {
                // Si solo tenemos estado, crear un objeto de ubicación con estado
                setOperatorLocation({
                    status: locationData.status,
                    timestamp: locationData.timestamp,
                    operatorId: locationData.operatorId,
                    // No hay coordenadas reales disponibles
                    hasLocation: false
                });
            } else {
                // No hay información de ubicación disponible
                setOperatorLocation(null);
            }
        } catch (err) {
            setError(err.message);
            console.error("❌ Error obteniendo ubicación del operador:", err);
        } finally {
            setIsLoading(false);
        }
    }, [operatorId]);

    /**
     * Obtiene el estado del operador
     */
    const fetchOperatorStatus = useCallback(async () => {
        if (!operatorId) return;

        try {
            const statusData = await getOperatorLocationStatus(operatorId);
            setOperatorStatus(statusData);
        } catch (err) {
            console.error("❌ Error obteniendo estado del operador:", err);
        }
    }, [operatorId]);

    /**
     * Actualiza toda la información del operador
     */
    const refreshOperatorInfo = useCallback(async () => {
        if (!demandId) return;

        // Obtener ID del operador si no lo tenemos
        if (!operatorId) {
            const newOperatorId = await fetchOperatorId();
            setOperatorId(newOperatorId);
            
            if (!newOperatorId) {
                setError("No hay operador asignado a esta demanda");
                return;
            }
        }

        // Obtener ubicación y estado
        await Promise.all([
            fetchOperatorLocation(),
            fetchOperatorStatus()
        ]);
    }, [demandId, operatorId, fetchOperatorId, fetchOperatorLocation, fetchOperatorStatus]);

    /**
     * Efecto para obtener información inicial del operador
     */
    useEffect(() => {
        if (demandId) {
            refreshOperatorInfo();
        }
    }, [demandId, refreshOperatorInfo]);

    /**
     * Efecto para polling automático
     */
    useEffect(() => {
        if (!autoPoll || !operatorId) return;

        const interval = setInterval(() => {
            refreshOperatorInfo();
        }, pollInterval * 1000);

        return () => clearInterval(interval);
    }, [autoPoll, operatorId, pollInterval, refreshOperatorInfo]);

    return {
        // Estados
        operatorLocation,
        operatorStatus,
        operatorId,
        error,
        isLoading,
        
        // Funciones
        refreshOperatorInfo,
        fetchOperatorLocation,
        fetchOperatorStatus
    };
} 