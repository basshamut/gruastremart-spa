import { useState } from "react";

export function useCustomerRequests(apiDomain, token) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stateFilter, setStateFilter] = useState("");
    const [page, setPage] = useState(0);
    const [size] = useState(5);

    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const createdByUserId = JSON.parse(localStorage.getItem("userDetail")).id;
            const params = new URLSearchParams({
                page,
                size,
                createdByUserId
            });
            if (stateFilter) {
                params.append("state", stateFilter);
            }

            const response = await fetch(`${apiDomain}/v1/crane-demands?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Error al obtener las solicitudes");

            const data = await response.json();
            setRequests(data.content || []);
        } catch (err) {
            console.error(err);
            setError("Error cargando solicitudes.");
        } finally {
            setLoading(false);
        }
    };

    return {
        requests,
        loading,
        error,
        fetchRequests,
        setPage,
        page,
        stateFilter,
        setStateFilter,
        size,
        setRequests
    };
} 