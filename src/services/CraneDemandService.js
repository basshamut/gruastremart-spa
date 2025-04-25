export async function assignCraneDemand(selectedDemand) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    const response = await fetch(`${apiDomain}/v1/crane-demands/${selectedDemand.id}/assign`, {
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