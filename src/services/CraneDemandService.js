/**
 * Asigna una demanda de grúa al usuario actual con una categoría de peso específica
 * @param {Object} selectedDemand - Demanda seleccionada
 * @param {string} weightCategory - Categoría de peso (PESO_1, PESO_2, PESO_3, PESO_4)
 * @returns {Promise<Object>} Datos de la demanda asignada
 */
export async function assignCraneDemand(selectedDemand, weightCategory) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    if (!weightCategory) {
        throw new Error("La categoría de peso es requerida para asignar la demanda");
    }

    // Construir la URL con el parámetro weightCategory
    const url = `${apiDomain}/v1/crane-demands/${selectedDemand.id}/assign?weightCategory=${weightCategory}`;

    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al asignar la grúa no especificado");
    }

    return await response.json(); // por si necesitas datos de vuelta
}