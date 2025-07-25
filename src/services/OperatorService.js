export async function fetchAssignedOperatorId(userId) {
    try {
        const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
        const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

        // Buscar demandas tomadas por este operador
        const response = await fetch(`${apiDomain}/v1/operators?userId=${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.content && data.content.length > 0) {
                return data.id;
            }
        }
        return userId;
    } catch (err) {
        console.error("❌ Error obteniendo assignedOperatorId:", err);
        return userId;
    }
}