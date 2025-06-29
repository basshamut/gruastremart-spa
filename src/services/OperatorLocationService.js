/**
 * Servicio para manejar la ubicación del operador
 */

/**
 * Obtiene la ubicación actual del operador
 * @param {string} assignedOperatorId - ID del operador asignado
 * @returns {Promise<Object>} - Ubicación del operador
 */
export async function getOperatorLocation(assignedOperatorId) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    // Debug: verificar qué ID se está usando para consultar
    console.log("🔍 Debug - Consultando ubicación del operador:");
    console.log("  - Endpoint:", `${apiDomain}/v1/operators/${assignedOperatorId}/location`);
    console.log("  - AssignedOperatorId:", assignedOperatorId);

    const response = await fetch(`${apiDomain}/v1/operators/${assignedOperatorId}/location`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error consultando ubicación:", errorData);
        throw new Error(errorData.message || "Error al obtener la ubicación del operador");
    }

    const responseData = await response.json();
    console.log("✅ Ubicación obtenida exitosamente:", responseData);
    return responseData;
}

/**
 * Actualiza la ubicación del operador
 * @param {string} assignedOperatorId - ID del operador asignado
 * @param {Object} location - Objeto con la ubicación (lat, lng, accuracy, timestamp)
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export async function updateOperatorLocation(assignedOperatorId, location) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    // Debug: verificar qué ID se está enviando
    console.log("🔍 Debug - Enviando ubicación al backend:");
    console.log("  - Endpoint:", `${apiDomain}/v1/operators/${assignedOperatorId}/location`);
    console.log("  - AssignedOperatorId:", assignedOperatorId);
    console.log("  - Location:", location);

    // Convertir de lat/lng a latitude/longitude según la API
    const requestBody = {
        latitude: location.lat,
        longitude: location.lng,
        status: location.status || "ONLINE"
    };

    console.log("  - RequestBody:", requestBody);

    const response = await fetch(`${apiDomain}/v1/operators/${assignedOperatorId}/location`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error en respuesta del backend:", errorData);
        throw new Error(errorData.message || "Error al actualizar la ubicación del operador");
    }

    const responseData = await response.json();
    console.log("✅ Respuesta exitosa del backend:", responseData);
    return responseData;
}

/**
 * Obtiene el estado de la ubicación del operador
 * @param {string} assignedOperatorId - ID del operador asignado
 * @returns {Promise<Object>} - Estado de la ubicación
 */
export async function getOperatorLocationStatus(assignedOperatorId) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    // Debug: verificar qué ID se está usando para consultar estado
    console.log("🔍 Debug - Consultando estado del operador:");
    console.log("  - Endpoint:", `${apiDomain}/v1/operators/${assignedOperatorId}/location/status`);
    console.log("  - AssignedOperatorId:", assignedOperatorId);

    const response = await fetch(`${apiDomain}/v1/operators/${assignedOperatorId}/location/status`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error consultando estado:", errorData);
        throw new Error(errorData.message || "Error al obtener el estado de ubicación del operador");
    }

    const responseData = await response.json();
    console.log("✅ Estado obtenido exitosamente:", responseData);
    return responseData;
} 