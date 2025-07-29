/**
 * Servicio para manejar las operaciones relacionadas con el pricing de grúas
 */

/**
 * Obtiene todas las categorías de precio activas para mostrar en dropdown
 * @returns {Promise<Array>} Lista de categorías de precio
 */
export async function getCranePricingDropdown() {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    try {
        const response = await fetch(`${apiDomain}/v1/crane-pricing?page=0&size=100&active=true`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al obtener las categorías de precio");
        }

        const data = await response.json();
        
        // Transformar los datos para el dropdown basado en la estructura real del backend
        return data.content.map(pricing => ({
            id: pricing.id,
            weightCategory: pricing.weightCategory.name,
            displayName: `${pricing.weightCategory.name} (${pricing.weightCategory.minWeightKg}-${pricing.weightCategory.maxWeightKg} kg)`,
            shortDisplayName: `${pricing.weightCategory.name} - Urbano: $${pricing.pricing.urban.fixedPriceUsd}`,
            fullDisplayName: `${pricing.weightCategory.name} (${pricing.weightCategory.minWeightKg}-${pricing.weightCategory.maxWeightKg} kg) - Urbano: $${pricing.pricing.urban.fixedPriceUsd} | Extra: $${pricing.pricing.extraUrban.basePriceUsd} + $${pricing.pricing.extraUrban.pricePerKmUsd}/km`,
            minWeightKg: pricing.weightCategory.minWeightKg,
            maxWeightKg: pricing.weightCategory.maxWeightKg,
            urbanPrice: pricing.pricing.urban.fixedPriceUsd,
            extraUrbanBasePrice: pricing.pricing.extraUrban.basePriceUsd,
            extraUrbanPricePerKm: pricing.pricing.extraUrban.pricePerKmUsd,
            maxDistanceKm: pricing.pricing.urban.maxDistanceKm,
            description: pricing.weightCategory.description,
            urbanDescription: pricing.pricing.urban.description,
            extraUrbanDescription: pricing.pricing.extraUrban.description,
            active: pricing.active,
            createdAt: pricing.createdAt,
            updatedAt: pricing.updatedAt
        }));
    } catch (error) {
        console.error("Error fetching crane pricing dropdown:", error);
        throw error;
    }
}

/**
 * Obtiene las categorías de precio con filtros y paginación
 * @param {Object} filters - Filtros para la búsqueda
 * @param {number} page - Número de página
 * @param {number} size - Tamaño de página
 * @returns {Promise<Object>} Resultado paginado de categorías de precio
 */
export async function getCranePricingWithFilters(filters = {}, page = 0, size = 10) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    try {
        // Construir parámetros de consulta
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
        });

        // Agregar filtros opcionales
        Object.keys(filters).forEach(key => {
            if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                params.append(key, filters[key]);
            }
        });

        const response = await fetch(`${apiDomain}/v1/crane-pricing?${params.toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al obtener las categorías de precio");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching crane pricing with filters:", error);
        throw error;
    }
}

/**
 * Obtiene una categoría de precio específica por ID
 * @param {string} pricingId - ID de la categoría de precio
 * @returns {Promise<Object>} Datos de la categoría de precio
 */
export async function getCranePricingById(pricingId) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    try {
        const response = await fetch(`${apiDomain}/v1/crane-pricing/${pricingId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al obtener la categoría de precio");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching crane pricing by ID:", error);
        throw error;
    }
}

/**
 * Busca la categoría de precio apropiada basada en el peso del vehículo
 * @param {number} weight - Peso del vehículo en kg
 * @returns {Promise<Object>} Categoría de precio apropiada
 */
export async function findPricingByWeight(weight) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    try {
        const response = await fetch(`${apiDomain}/v1/crane-pricing?weight=${weight}&active=true&page=0&size=1`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al buscar categoría de precio por peso");
        }

        const data = await response.json();
        return data.content.length > 0 ? data.content[0] : null;
    } catch (error) {
        console.error("Error finding pricing by weight:", error);
        throw error;
    }
}

/**
 * Calcula el precio total del servicio basado en la categoría y distancia
 * @param {Object} pricing - Categoría de precio
 * @param {number} distance - Distancia en kilómetros
 * @param {string} serviceType - Tipo de servicio ('urbano' o 'extra_urbano')
 * @returns {Object} Cálculo detallado del precio
 */
export function calculateServicePrice(pricing, distance, serviceType = null) {
    if (!pricing) {
        throw new Error("Categoría de precio requerida para el cálculo");
    }

    const urbanMaxDistance = pricing.maxDistanceKm || 8; // km - usar el valor del backend o 8 como fallback
    const isUrban = serviceType === 'urbano' || (serviceType === null && distance <= urbanMaxDistance);

    let calculation = {
        weightCategory: pricing.weightCategory,
        distance: distance,
        serviceType: isUrban ? 'urbano' : 'extra_urbano',
        breakdown: {}
    };

    if (isUrban) {
        calculation.totalPrice = pricing.urbanPrice;
        calculation.breakdown = {
            urbanPrice: pricing.urbanPrice,
            total: pricing.urbanPrice
        };
    } else {
        const extraDistance = Math.max(0, distance - urbanMaxDistance);
        const extraCost = extraDistance * pricing.extraUrbanPricePerKm;
        calculation.totalPrice = pricing.extraUrbanBasePrice + extraCost;
        calculation.breakdown = {
            basePrice: pricing.extraUrbanBasePrice,
            extraDistance: extraDistance,
            pricePerKm: pricing.extraUrbanPricePerKm,
            extraCost: extraCost,
            total: calculation.totalPrice
        };
    }

    return calculation;
}
