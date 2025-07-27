export async function getUserDetailByEmail(email) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    try {
        const response = await fetch(`${apiDomain}/v1/users?page=0&size=1&email=${email}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("No se pudo obtener el rol del usuario");
        }

        const data = await response.json();

        if (data.content?.length > 0) {
            return {
                id: data.content[0].id,
                operatorId: data.content[0].operatorId,
                name: data.content[0].name,
                email: data.content[0].email,
                role: data.content[0].role
            };
        }

        return null;
    } catch (err) {
        console.error("Error al obtener el rol:", err);
        throw err;
    }
}

export async function registerUserInDb(userData) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    try {
        const response = await fetch(`${apiDomain}/v1/users/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al registrar en la base de datos");
        }

        return await response.json(); // por si necesitas datos de vuelta
    } catch (err) {
        console.error("Error registrando el usuario en la DB:", err);
        throw err;
    }
}

export async function getUsersWithFilters(filters = {}) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    // Construir los parámetros de la URL
    const params = new URLSearchParams();
    
    // Parámetros obligatorios
    params.append('page', filters.page || 0);
    params.append('size', filters.size || 10);
    
    // Parámetros opcionales
    if (filters.email) {
        params.append('email', filters.email);
    }
    if (filters.supabaseId) {
        params.append('supabaseId', filters.supabaseId);
    }
    if (filters.role) {
        params.append('role', filters.role);
    }
    if (filters.active !== undefined) {
        params.append('active', filters.active);
    }

    const finalUrl = `${apiDomain}/v1/users?${params.toString()}`;

    try {
        const response = await fetch(finalUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (err) {
        console.error("Error al obtener usuarios:", err);
        throw err;
    }
}

export async function updateUser(userId, userData) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    try {
        const response = await fetch(`${apiDomain}/v1/users/${userId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (err) {
        console.error("Error al actualizar usuario:", err);
        throw err;
    }
}

export async function deleteUser(userId) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    try {
        const response = await fetch(`${apiDomain}/v1/users/${userId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        return response.ok;
    } catch (err) {
        console.error("Error al eliminar usuario:", err);
        throw err;
    }
}