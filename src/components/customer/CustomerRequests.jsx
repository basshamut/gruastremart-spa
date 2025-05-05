import { useEffect, useState } from "react";
import { formatDate } from "../../utils/Utils.js";
import LocationTracker from "../common/LocationTracker";
import { useCustomerRequests } from "../../hooks/customer/useCustomerRequests";
import { useTakenDemandsWebSocket } from "../../hooks/customer/useTakenDemandsWebSocket";
import { useBodyScrollLock } from "../../hooks/customer/useBodyScrollLock";

export default function CustomerRequests() {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [takenMessage, setTakenMessage] = useState(null);

    useBodyScrollLock(modalOpen);
    const {
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
    } = useCustomerRequests(apiDomain, token);

    useTakenDemandsWebSocket(requests, apiDomain, token, () => {
        setTakenMessage("🎉 Tu solicitud ha sido tomada por un operador.");
        fetchRequests();
        setTimeout(() => setTakenMessage(null), 10000);
    });

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
                        prev.map((r) => (r.id === id ? { ...r, state: "INACTIVE" } : r))
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
        const updatedReq = requests.find(r => r.id === req.id) || req;
        setSelectedRequest(updatedReq);
        setModalContent({
            title: "Detalles de la solicitud",
            message: `\n📝 Estado: ${updatedReq.state}\n• Origen: ${updatedReq.origin}\n• Tipo de vehículo: ${updatedReq.carType}\n• Descripción: ${updatedReq.description || "N/A"}\n• Fecha: ${formatDate(updatedReq.createdAt)}\n            `,
            onlyClose: true,
        });
        setModalOpen(true);
    };

    if (modalOpen && selectedRequest) {
        console.log('selectedRequest:', selectedRequest);
    }

    return (
        <div className="bg-white rounded shadow p-4 mt-6">
            <h2 className="text-2xl font-bold mb-4 text-center">Mis Solicitudes</h2>
            {takenMessage && (
                <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-center">
                    {takenMessage}
                </div>
            )}
            {/* Filtro de estado */}
            <div className="mb-4">
                <select
                    value={stateFilter}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                >
                    <option value="">Todos los estados</option>
                    <option value="ACTIVE">Activas</option>
                    <option value="TAKEN">Tomadas</option>
                    <option value="INACTIVE">Inactivas</option>
                </select>
            </div>
            {/* Lista de solicitudes */}
            {loading ? (
                <p className="text-center">Cargando...</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : requests.length === 0 ? (
                <p className="text-center">No hay solicitudes.</p>
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => (
                        <div key={req.id} className="border p-4 rounded">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold">{req.origin}</h3>
                                    <p className="text-sm text-gray-600">
                                        Estado: {req.state}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Fecha: {formatDate(req.createdAt)}
                                    </p>
                                </div>
                                <div className="space-x-2">
                                    <button
                                        onClick={() => viewDetails(req)}
                                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Ver
                                    </button>
                                    {req.state === "ACTIVE" && (
                                        <button
                                            onClick={() => cancelRequest(req.id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Modal */}
            {modalOpen && modalContent && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">{modalContent.title}</h3>
                        <pre className="whitespace-pre-wrap text-gray-800 mb-4">{modalContent.message}</pre>
                        {/* Sección de seguimiento para solicitudes tomadas */}
                        {selectedRequest && selectedRequest.state === "TAKEN" &&
                          selectedRequest.currentLocation &&
                          selectedRequest.currentLocation.latitude !== undefined &&
                          selectedRequest.currentLocation.longitude !== undefined && (
                            <LocationTracker
                              craneDemandId={selectedRequest.id}
                              initialLocation={{
                                lat: selectedRequest.currentLocation.latitude,
                                lng: selectedRequest.currentLocation.longitude
                              }}
                              origin={{
                                lat: selectedRequest.currentLocation.latitude,
                                lng: selectedRequest.currentLocation.longitude
                              }}
                              destination={selectedRequest.destinationLocation ? {
                                lat: selectedRequest.destinationLocation.latitude,
                                lng: selectedRequest.destinationLocation.longitude
                              } : undefined}
                              onOperatorLocationUpdate={loc => console.log('Ubicación operador (cliente):', loc)}
                            />
                        )}
                        <div className="flex justify-end gap-2 mt-4">
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
