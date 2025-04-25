import dayjs from "dayjs";

export function clearLocalStorage() {
    localStorage.clear();
}

export function formatDate(dateString) {
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
}
