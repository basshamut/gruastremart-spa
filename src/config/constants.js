/**
 * Configuración de intervalos de actualización (en segundos)
 * 
 * Para modificar los intervalos, simplemente cambia estos valores:
 * - LOCATION_UPDATE_INTERVAL: Intervalo para actualizar ubicación del operador
 * - OPERATOR_STATUS_POLL_INTERVAL: Intervalo para consultar estado del operador
 * - DEMAND_POLL_INTERVAL: Intervalo para consultar demandas
 */

// Intervalo de actualización de ubicación del operador (en segundos)
export const LOCATION_UPDATE_INTERVAL = 10;

// Intervalo para consultar estado del operador (en segundos)
export const OPERATOR_STATUS_POLL_INTERVAL = 10;

// Intervalo para consultar demandas (en segundos)
export const DEMAND_POLL_INTERVAL = 10;

// Configuración de geolocalización
export const GEOLOCATION_CONFIG = {
    enableHighAccuracy: true,
    timeout: 15000, // 15 segundos
    maximumAge: 0 // Forzar ubicación fresca
};

// Configuración de reintentos
export const RETRY_CONFIG = {
    maxRetries: 3,
    retryDelay: 5000 // 5 segundos
}; 