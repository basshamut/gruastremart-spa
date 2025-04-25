import {useEffect, useState} from "react";
import {formatDate} from "../../utils/Utils.js";

export default function CustomerRequests() {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stateFilter, setStateFilter] = useState("");
    const [page, setPage] = useState(0);
    const [size] = useState(5);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);

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
        setModalContent({
            title: "Cancelar solicitud",
            message: "¿Seguro que quieres cancelar esta solicitud?",
            onConfirm: async () => {
                try {
                    const response = await fetch(`${apiDomain}/v1/crane-demands/${id}/cancel`, {
                        method: "PATCH",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });

                    if (!response.ok) throw new Error("No se pudo cancelar");

                    setRequests((prev) =>
                        prev.map((r) => (r.id === id ? {...r, state: "INACTIVE"} : r))
                    );
                    setModalOpen(false);
                } catch (err) {
                    setModalContent({
                        title: "Error",
                        message: "❌ Error cancelando la solicitud.",
                        onlyClose: true,
                    });
                }
            },
        });
        setModalOpen(true);
    };

    const viewDetails = (req) => {
        setModalContent({
            title: "Detalles de la solicitud",
            message: `
📝 Estado: ${req.state}
• Origen: ${req.origin}
• Tipo de vehículo: ${req.carType}
• Descripción: ${req.description || "N/A"}
• Fecha: ${formatDate(req.createdAt)}
            `,
            onlyClose: true,
        });
        setModalOpen(true);
    };

    return (
        <div className="bg-white rounded shadow p-4 mt-6">
            <h2 className="text-2xl font-bold mb-4 text-center">Mis Solicitudes</h2>

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
                            <p><strong>Fecha:</strong> {formatDate(req.createdAt)}</p>

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

            {modalOpen && modalContent && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">{modalContent.title}</h3>
                        <pre className="whitespace-pre-wrap text-gray-800 mb-4">{modalContent.message}</pre>
                        <div className="flex justify-end gap-2">
                            {!modalContent.onlyClose && (
                                <>
                                    <button
                                        onClick={() => setModalOpen(false)}
                                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={modalContent.onConfirm}
                                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
                                    >
                                        Confirmar
                                    </button>
                                </>
                            )}
                            {modalContent.onlyClose && (
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
                                >
                                    Cerrar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
