// src/hooks/useRegisterUserInDb.js
export default async function registerUserInDb(userData) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = localStorage.getItem('jwt');

    try {
        const response = await fetch(`${apiDomain}/users`, {
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
