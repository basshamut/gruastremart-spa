import { useState, useCallback, useMemo } from 'react';
import { useCranePricingDropdown } from './useCranePricing';
import { calculateServicePrice } from '../../services/CranePricingService';
import { calculateDistanceFromLocations } from '../../utils/Utils';

/**
 * Hook centralizado para cálculos de precios de servicios de grúa
 * Proporciona funcionalidad consistente para calcular precios automáticamente
 * basado en assignedWeightCategoryId o vehicleWeight
 */
export function usePriceCalculation() {
    const { pricingOptions, loading: pricingLoading, error: pricingError } = useCranePricingDropdown();
    const [calculationCache, setCalculationCache] = useState(new Map());

    /**
     * Calcula el precio automático para una demanda/solicitud
     * @param {Object} request - La solicitud con datos de peso y ubicaciones
     * @param {number} request.assignedWeightCategoryId - ID de categoría de peso asignada (prioridad)
     * @param {number} request.vehicleWeight - Peso del vehículo (fallback)
     * @param {Object} request.currentLocation - Ubicación actual
     * @param {Object} request.destinationLocation - Ubicación de destino
     * @param {number} request.distance - Distancia precalculada (opcional)
     * @returns {Object|null} Objeto con precio calculado y metadatos
     */
    const calculateAutomaticPrice = useCallback((request) => {
        if (!request || pricingLoading || pricingError || !pricingOptions.length) {
            return null;
        }

        try {
            // Crear clave única para cache
            const cacheKey = `${request.assignedWeightCategoryId || 'null'}-${request.vehicleWeight || 'null'}-${request.distance || 'calc'}-${JSON.stringify(request.currentLocation)}-${JSON.stringify(request.destinationLocation)}`;
            
            // Verificar cache
            if (calculationCache.has(cacheKey)) {
                return calculationCache.get(cacheKey);
            }

            // Calcular distancia si no está disponible
            let distance = request.distance;
            if (!distance && request.currentLocation && request.destinationLocation) {
                distance = calculateDistanceFromLocations(
                    request.currentLocation,
                    request.destinationLocation
                );
            }

            if (!distance || distance <= 0) {
                return null;
            }

            // Buscar pricing por assignedWeightCategoryId (prioridad)
            let selectedPricing = null;
            let priceSource = 'assigned'; // 'assigned' o 'vehicle'

            if (request.assignedWeightCategoryId) {
                selectedPricing = pricingOptions.find(
                    pricing => pricing.id === request.assignedWeightCategoryId
                );
            }

            // Fallback: buscar por vehicleWeight
            if (!selectedPricing && request.vehicleWeight) {
                selectedPricing = pricingOptions.find(pricing => 
                    request.vehicleWeight >= pricing.minWeightKg && 
                    request.vehicleWeight <= pricing.maxWeightKg
                );
                priceSource = 'vehicle';
            }

            if (!selectedPricing) {
                return null;
            }

            // Calcular precio del servicio
            const calculation = calculateServicePrice(selectedPricing, distance);
            
            if (!calculation || typeof calculation.totalPrice !== 'number') {
                return null;
            }

            const result = {
                totalPrice: calculation.totalPrice,
                distance: distance,
                weightCategory: selectedPricing.weightCategory,
                serviceType: calculation.serviceType,
                breakdown: calculation.breakdown,
                priceSource: priceSource,
                selectedPricing: selectedPricing,
                isValid: true
            };

            // Guardar en cache
            setCalculationCache(prev => new Map(prev.set(cacheKey, result)));

            return result;

        } catch (error) {
            console.error('Error calculating automatic price:', error);
            return null;
        }
    }, [pricingOptions, pricingLoading, pricingError, calculationCache]);

    /**
     * Formatea el precio para mostrar en la UI
     * @param {number} price - Precio a formatear
     * @param {string} currency - Moneda (por defecto 'COP')
     * @returns {string} Precio formateado
     */
    const formatPrice = useCallback((price, currency = 'COP') => {
        if (typeof price !== 'number' || isNaN(price)) {
            return 'N/A';
        }
        
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }, []);

    /**
     * Obtiene el texto descriptivo del origen del precio
     * @param {string} priceSource - 'assigned' o 'vehicle'
     * @returns {string} Texto descriptivo
     */
    const getPriceSourceText = useCallback((priceSource) => {
        switch (priceSource) {
            case 'assigned':
                return 'Basado en categoría asignada';
            case 'vehicle':
                return 'Basado en peso del vehículo';
            default:
                return 'Precio estimado';
        }
    }, []);

    /**
     * Limpia el cache de cálculos
     */
    const clearCalculationCache = useCallback(() => {
        setCalculationCache(new Map());
    }, []);

    /**
     * Calcula múltiples precios de manera eficiente
     * @param {Array} requests - Array de solicitudes
     * @returns {Map} Mapa con ID de solicitud como clave y cálculo como valor
     */
    const calculateMultiplePrices = useCallback((requests) => {
        if (!Array.isArray(requests)) {
            return new Map();
        }

        const results = new Map();
        
        requests.forEach(request => {
            if (request && request.id) {
                const calculation = calculateAutomaticPrice(request);
                if (calculation) {
                    results.set(request.id, calculation);
                }
            }
        });

        return results;
    }, [calculateAutomaticPrice]);

    // Estado derivado
    const isReady = useMemo(() => {
        return !pricingLoading && !pricingError && pricingOptions.length > 0;
    }, [pricingLoading, pricingError, pricingOptions.length]);

    return {
        // Funciones principales
        calculateAutomaticPrice,
        calculateMultiplePrices,
        formatPrice,
        getPriceSourceText,
        clearCalculationCache,
        
        // Estado
        pricingOptions,
        isReady,
        loading: pricingLoading,
        error: pricingError,
        
        // Cache info
        cacheSize: calculationCache.size
    };
}

export default usePriceCalculation;