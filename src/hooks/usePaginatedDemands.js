import { useEffect, useState } from "react";

export function usePaginatedDemands(apiDomain, token, initialPageSize = 10) {
    const [demands, setDemands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);

    console.log("size: " + pageSize);

    useEffect(() => {
        const fetchDemands = async (pageNumber, size) => {
            setLoading(true);
            const url = apiDomain + "/crane-demands?page=" + pageNumber + "&size=" + size
            try {
                const response = await fetch(url, {
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
                setTotalPages(data.totalPages);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDemands(page, pageSize);
    }, [page, pageSize, token, apiDomain]);

    const handlePageChange = (newPage) => {
        setPage(Math.max(0, Math.min(newPage, totalPages - 1)));
    };

    const handlePageSizeChange = (newSize) => {
        setPageSize(Number(newSize));
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
