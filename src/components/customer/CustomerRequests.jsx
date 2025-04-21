import {useEffect, useState} from "react";

export default function CustomerRequests() {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stateFilter, setStateFilter] = useState("");
    const [page, setPage] = useState(0);
    const [size] = useState(3);

    useEffect(() => {
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

        fetchRequests();
    }, [page, size, stateFilter]);

    const handleFilterChange = (e) => {
        setStateFilter(e.target.value);
        setPage(0);
    };

    const cancelRequest = async (id) => {
        if (!window.confirm("¿Seguro que quieres cancelar esta solicitud?")) return;

        try {
            const response = await fetch(`${apiDomain}/v1/crane-demands/${id}/cancel`, {
                method: "PATCH", // ajusta si usas PUT u otro
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) throw new Error("No se pudo cancelar");

            setRequests((prev) => prev.map((r) => r.id === id ? {...r, state: "INACTIVE"} : r));
        } catch (err) {
            alert("❌ Error cancelando la solicitud.");
        }
    };

    const viewDetails = (req) => {
        alert(`
📝 Detalles de la solicitud:
• Estado: ${req.state}
• Origen: ${req.origin}
• Tipo de vehículo: ${req.carType}
• Descripción: ${req.description || "N/A"}
• Fecha: ${new Date(req.createdAt).toLocaleString()}
`);
    };

    return (
        <div className="bg-white rounded shadow p-4 mt-6">
            <h2 className="text-xl font-semibold mb-4">Tus solicitudes de grúa</h2>

            <div className="mb-4">
                <label className="font-medium mr-2">Filtrar por estado:</label>
                <select
                    value={stateFilter}
                    onChange={handleFilterChange}
                    className="border rounded p-1"
                >
                    <option value="">-- Todos --</option>
                    <option value="ACTIVE">Activas</option>
                    <option value="INACTIVE">Inactivas</option>
                    <option value="TAKEN">Tomadas</option>
                    <option value="COMPLETED">Completadas</option>
                </select>
            </div>

            {loading && <p>Cargando...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {!loading && !error && requests.length === 0 && (
                <p>No tienes solicitudes registradas.</p>
            )}

            {!loading && requests.length > 0 && (
                <ul className="divide-y divide-gray-200">
                    {requests.map((req) => (
                        <li key={req.id} className="py-2 border-b">
                            <p><strong>Estado:</strong> {req.state}</p>
                            <p><strong>Origen:</strong> {req.origin}</p>
                            <p><strong>Tipo de vehículo:</strong> {req.carType}</p>
                            <p><strong>Fecha:</strong> {new Date(req.createdAt).toLocaleString()}</p>

                            <div className="mt-2 flex gap-2">
                                <button
                                    onClick={() => viewDetails(req)}
                                    className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                                >
                                    Ver detalles
                                </button>

                                {req.state === "ACTIVE" && (
                                    <button
                                        onClick={() => cancelRequest(req.id)}
                                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Navegación */}
            <div className="flex justify-between mt-4">
                <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    disabled={page === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded disabled:opacity-50"
                >
                    Página anterior
                </button>
                <span className="self-center">Página {page + 1}</span>
                <button
                    onClick={() => setPage((prev) => prev + 1)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
                >
                    Siguiente página
                </button>
            </div>
        </div>
    );
}
