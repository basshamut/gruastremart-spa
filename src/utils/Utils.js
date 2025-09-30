import dayjs from "dayjs";

export function clearLocalStorage() {
    localStorage.clear();
}

export function formatDate(dateString) {
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
}

// Función para parsear JSON de localStorage de forma segura
export function safeParseJSON(key) {
    try {
        const item = localStorage.getItem(key);
        if (item === null || item === undefined || item === '') {
            return null;
        }
        return JSON.parse(item);
    } catch (error) {
        console.error(`Error parsing JSON from localStorage key '${key}':`, error);
        return null;
    }
}

// Función para calcular la distancia entre dos coordenadas usando la fórmula de Haversine
export function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) {
        console.warn('calculateDistance: Coordenadas incompletas', { lat1, lon1, lat2, lon2 });
        return null;
    }

    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Redondear a 2 decimales
}

// Función para calcular la distancia entre dos ubicaciones con estructura de objeto
export function calculateDistanceFromLocations(currentLocation, destinationLocation) {
    if (!currentLocation || !destinationLocation) {
        console.warn('calculateDistanceFromLocations: Ubicaciones faltantes', { currentLocation, destinationLocation });
        return null;
    }

    const { latitude: lat1, longitude: lon1 } = currentLocation;
    const { latitude: lat2, longitude: lon2 } = destinationLocation;

    return calculateDistance(lat1, lon1, lat2, lon2);
}
