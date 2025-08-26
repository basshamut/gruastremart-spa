import dayjs from "dayjs";

export function clearLocalStorage() {
    localStorage.clear();
}

export function formatDate(dateString) {
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
}

// Función para parsear JSON de localStorage de forma segura
export function safeParseJSON(key) {
    try {
        const item = localStorage.getItem(key);
        if (item === null || item === undefined || item === '') {
            return null;
        }
        return JSON.parse(item);
    } catch (error) {
        console.error(`Error parsing JSON from localStorage key '${key}':`, error);
        return null;
    }
}
