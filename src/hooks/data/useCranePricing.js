import { useState, useEffect, useCallback } from 'react';
import { getCranePricingDropdown, getCranePricingWithFilters, findPricingByWeight, calculateServicePrice } from '../../services/CranePricingService';

/**
 * Hook para manejar el dropdown de categorías de precio
 * @returns {Object} Estado y funciones para el dropdown de pricing
 */
export function useCranePricingDropdown() {
    const [pricingOptions, setPricingOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadPricingOptions = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const options = await getCranePricingDropdown();
            setPricingOptions(options);
        } catch (err) {
            setError(err.message);
            console.error('Error loading pricing options:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPricingOptions();
    }, [loadPricingOptions]);

    return {
        pricingOptions,
        loading,
        error,
        reload: loadPricingOptions
    };
}

/**
 * Hook para manejar el pricing de grúas con filtros y paginación
 * @param {Object} initialFilters - Filtros iniciales
 * @param {number} initialPageSize - Tamaño inicial de página
 * @returns {Object} Estado y funciones para manejar el pricing
 */
export function useCranePricing(initialFilters = {}, initialPageSize = 10) {
    const [pricingData, setPricingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState(initialFilters);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(initialPageSize);

    const loadPricing = useCallback(async (page = currentPage, size = pageSize, appliedFilters = filters) => {
        setLoading(true);
        setError(null);
        
        try {
            const data = await getCranePricingWithFilters(appliedFilters, page, size);
            setPricingData(data);
        } catch (err) {
            setError(err.message);
            console.error('Error loading pricing data:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filters]);

    useEffect(() => {
        loadPricing();
    }, [loadPricing]);

    const updateFilters = useCallback((newFilters) => {
        setFilters(newFilters);
        setCurrentPage(0); // Reset to first page when filters change
    }, []);

    const goToPage = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const changePageSize = useCallback((size) => {
        setPageSize(size);
        setCurrentPage(0); // Reset to first page when page size changes
    }, []);

    return {
        pricingData,
        loading,
        error,
        filters,
        currentPage,
        pageSize,
        updateFilters,
        goToPage,
        changePageSize,
        reload: () => loadPricing(currentPage, pageSize, filters)
    };
}

/**
 * Hook para buscar pricing por peso y calcular precios
 * @returns {Object} Funciones para buscar pricing y calcular precios
 */
export function usePricingCalculator() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const findByWeight = useCallback(async (weight) => {
        setLoading(true);
        setError(null);
        
        try {
            const pricing = await findPricingByWeight(weight);
            return pricing;
        } catch (err) {
            setError(err.message);
            console.error('Error finding pricing by weight:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const calculatePrice = useCallback((pricing, distance, serviceType = null) => {
        try {
            return calculateServicePrice(pricing, distance, serviceType);
        } catch (err) {
            setError(err.message);
            console.error('Error calculating price:', err);
            throw err;
        }
    }, []);

    return {
        loading,
        error,
        findByWeight,
        calculatePrice
    };
}

/**
 * Hook para manejar la selección de categoría de peso en el proceso de asignación
 * @param {Object} demand - Demanda actual
 * @returns {Object} Estado y funciones para la selección de peso
 */
export function useWeightCategorySelection(demand = null) {
    const [selectedWeightCategory, setSelectedWeightCategory] = useState(null);
    const [suggestedPricing, setSuggestedPricing] = useState(null);
    const [priceCalculation, setPriceCalculation] = useState(null);
    const { pricingOptions, loading: loadingOptions } = useCranePricingDropdown();
    const { calculatePrice } = usePricingCalculator();

    // Sugerir categoría basada en el peso del vehículo (si está disponible)
    useEffect(() => {
        if (demand && demand.vehicleWeight && pricingOptions.length > 0) {
            const suggested = pricingOptions.find(option => 
                demand.vehicleWeight >= option.minWeightKg && 
                demand.vehicleWeight <= option.maxWeightKg
            );
            
            if (suggested) {
                setSuggestedPricing(suggested);
                setSelectedWeightCategory(suggested.weightCategory);
            }
        }
    }, [demand, pricingOptions]);

    // Calcular precio cuando se selecciona una categoría y hay distancia disponible
    useEffect(() => {
        if (selectedWeightCategory && demand && demand.distance) {
            const selectedPricing = pricingOptions.find(option => 
                option.weightCategory === selectedWeightCategory
            );
            
            if (selectedPricing) {
                try {
                    const calculation = calculatePrice(selectedPricing, demand.distance);
                    setPriceCalculation(calculation);
                } catch (error) {
                    console.error('Error calculating price:', error);
                    setPriceCalculation(null);
                }
            }
        }
    }, [selectedWeightCategory, demand, pricingOptions, calculatePrice]);

    const getWeightCategoryEnum = (weightCategory) => {
        const enumMap = {
            'Peso 1': 'PESO_1',
            'Peso 2': 'PESO_2', 
            'Peso 3': 'PESO_3',
            'Peso 4': 'PESO_4'
        };
        return enumMap[weightCategory] || weightCategory;
    };

    return {
        pricingOptions,
        selectedWeightCategory,
        setSelectedWeightCategory,
        suggestedPricing,
        priceCalculation,
        loadingOptions,
        getWeightCategoryEnum
    };
}
