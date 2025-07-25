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

        console.log("Datos obtenidos:", data);

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