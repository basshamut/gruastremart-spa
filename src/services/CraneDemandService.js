export async function assignCraneDemandToOperator(selectedDemand, weightCategory, operatorLocation, userId) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    if (!weightCategory) {
        throw new Error("La categoría de peso es requerida para asignar la demanda");
    }

    if (!userId) {
        throw new Error("El userId es requerido para asignar la demanda");
    }

    if (!operatorLocation || !operatorLocation.lat || !operatorLocation.lng) {
        throw new Error("La ubicación del operador es requerida para asignar la demanda");
    }

    const url = `${apiDomain}/v1/crane-demands/${selectedDemand.id}/assign`;

    const requestBody = {
        userId: userId,
        weightCategory: weightCategory,
        latitude: operatorLocation.lat,
        longitude: operatorLocation.lng
    };

    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al asignar la grúa no especificado");
    }

    return await response.json();
}

export async function cancelCraneDemandByOperator(demandId) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    if (!demandId) {
        throw new Error("El ID de la solicitud es requerido para cancelar");
    }

    const url = `${apiDomain}/v1/crane-demands/${demandId}/cancel`;

    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        let errorMessage = "Error al cancelar la solicitud";
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch {
            // Si no se puede parsear el JSON del error, usar mensaje por defecto
            errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }

    // Verificar si la respuesta tiene contenido JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return await response.json();
    } else {
        // Si no hay contenido JSON, retornar un objeto de éxito
        return { success: true, message: "Solicitud cancelada exitosamente" };
    }
}