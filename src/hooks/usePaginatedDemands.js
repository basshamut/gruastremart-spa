import {useEffect, useState} from "react";

export function usePaginatedDemands(state, refreshTrigger = 0, initialPageSize = 10, lat = null, lng = null) {
    const [demands, setDemands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);

    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;    useEffect(() => {
        const fetchDemands = async (pageNumber, size) => {
            setLoading(true);
            const safePage = isNaN(pageNumber) ? 0 : Math.max(0, pageNumber);
            const safeSize = isNaN(size) || size <= 0 ? initialPageSize : size;

            let urlForAll = `${apiDomain}/v1/crane-demands?page=${safePage}&size=${safeSize}`;
            let urlForState = `${apiDomain}/v1/crane-demands?state=${state}&page=${safePage}&size=${safeSize}`;
            
            // Agregar coordenadas a la URL si están disponibles
            if (lat !== null && lng !== null) {
                const coords = `&lat=${lat}&lng=${lng}`;
                urlForAll += coords;
                urlForState += coords;
            }
            
            const apiUrl = !state ? urlForAll : urlForState;

            try {
                const response = await fetch(
                    apiUrl,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Error al obtener datos");
                }

                const data = await response.json();
                setDemands(data.content);
                setTotalPages(data.page?.totalPages ?? 1);

                if (safePage >= data.page?.totalPages && data.page.totalPages > 0) {
                    setPage(data.page.totalPages - 1);
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        // Solo hacer la petición si las coordenadas están disponibles O si no las necesitamos
        // Para el caso del operador, esperamos a tener coordenadas antes de hacer la petición
        if (lat !== null && lng !== null) {
            console.log("🚀 Fetching demands with coordinates:", { lat, lng, state });
            fetchDemands(page, pageSize);
        } else {
            // Si no tenemos coordenadas aún, mostrar loading pero no hacer petición
            console.log("⏳ Waiting for coordinates before fetching demands...");
            setLoading(true);
        }
    }, [page, pageSize, token, apiDomain, refreshTrigger, initialPageSize, state, lat, lng]);

    const handlePageChange = (newPage) => {
        if (!isNaN(newPage)) {
            setPage(Math.max(0, Math.min(newPage, totalPages - 1)));
        }
    };

    const handlePageSizeChange = (newSize) => {
        const size = Number(newSize);
        setPageSize(isNaN(size) || size <= 0 ? initialPageSize : size);
        setPage(0); // reset
    };

    return {
        demands,
        loading,
        error,
        page,
        totalPages,
        pageSize,
        handlePageChange,
        handlePageSizeChange,
    };
}
