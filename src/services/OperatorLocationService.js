export async function getOperatorLocation(assignedOperatorId) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;
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

    return await response.json();
}

export async function updateOperatorLocation(assignedOperatorId, location) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    // Convertir de lat/lng a latitude/longitude según la API
    const requestBody = {
        latitude: location.lat,
        longitude: location.lng,
        status: location.status || "ONLINE"
    };
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

    return await response.json();
}

export async function getOperatorLocationStatus(assignedOperatorId) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

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

    return await response.json();
} 