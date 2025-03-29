import { useEffect, useState } from "react";

export function usePaginatedDemands(apiDomain, token, initialPageSize = 10) {
    const [demands, setDemands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);

    useEffect(() => {
        const fetchDemands = async (pageNumber, size) => {
            setLoading(true);
            const safePage = isNaN(pageNumber) ? 0 : Math.max(0, pageNumber);
            const safeSize = isNaN(size) || size <= 0 ? initialPageSize : size;

            try {
                const response = await fetch(`${apiDomain}/crane-demands?page=${safePage}&size=${safeSize}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Error al obtener datos");
                }

                const data = await response.json();
                setDemands(data.content);
                setTotalPages(data.page.totalPages);

                if (safePage >= data.page.totalPages && data.page.totalPages > 0) {
                    setPage(data.page.totalPages - 1);
                }

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDemands(page, pageSize);
    }, [page, pageSize, token, apiDomain]);

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
