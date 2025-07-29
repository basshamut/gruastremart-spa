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