export async function getRoleByEmail(email) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = localStorage.getItem('jwt');

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

        return data.content?.[0]?.role || null;
    } catch (err) {
        console.error("Error al obtener el rol:", err);
        throw err;
    }
}

export async function registerUserInDb(userData) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = localStorage.getItem('jwt');

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