import React, {useEffect, useState} from "react";

import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import {usePaginatedDemands} from "../hooks/customer/usePaginatedDemands";
import {useCraneNotifications} from "../hooks/customer/useCraneNotifications";
import {assignCraneDemand} from "../services/CraneDemandService";
import {formatDate} from "../utils/Utils";

export default function OperatorActivity() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [pendingNotificationsForActiveDemands, setPendingNotificationsForActiveDemands] = useState([]);
    const [hasNewNotifications, setHasNewNotifications] = useState(false);
    const [selectedDemand, setSelectedDemand] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [showConfirmButton, setShowConfirmButton] = useState(true);

    const activeDemands = usePaginatedDemands("ACTIVE", refreshTrigger, 50);
    const takenDemands = usePaginatedDemands("TAKEN", refreshTrigger, 50);

    const handleNewDemand = (newCraneDemand) => {
        setPendingNotificationsForActiveDemands(prev => [...prev, newCraneDemand]);
        setHasNewNotifications(true);
    };

    useCraneNotifications(handleNewDemand);

    useEffect(() => {
        if (hasNewNotifications) {
            const timer = setTimeout(() => {
                refreshData();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [hasNewNotifications]);

    const refreshData = () => {
        setRefreshTrigger(prev => prev + 1);
        setPendingNotificationsForActiveDemands([]);
        setHasNewNotifications(false);
    };

    const openModal = (demand, modalType) => {
        setSelectedDemand(demand);
        setIsModalOpen(true);
        if (modalType === "SHOW") {
            setShowConfirmButton(false);
        }

        if (modalType === "ASSIGN") {
            setShowConfirmButton(true);
        }
    };

    const closeModal = () => {
        setSelectedDemand(null);
        setIsModalOpen(false);
        setModalError(null);
    };

    const takeDemand = async () => {
        console.log("Taking demand:", selectedDemand);
        try {
            await assignCraneDemand(selectedDemand)
            setModalError(null);
            closeModal();
            document.location.reload();
        } catch (error) {
            console.error(error);
            setModalError(`${error}`);
        }
    };

    return (
        <>
            <h1 className="text-2xl font-bold text-foreground">Bienvenido de nuevo!</h1>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                <div className="bg-card p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-primary-foreground">Solicitudes Activas</h2>
                        {pendingNotificationsForActiveDemands.length > 0 && (
                            <button
                                onClick={refreshData}
                                className="bg-primary text-white text-xs px-3 py-1 rounded-full flex items-center"
                            >
                                {pendingNotificationsForActiveDemands.length} nueva{pendingNotificationsForActiveDemands.length > 1 ? 's' : ''} • Ver
                            </button>
                        )}
                    </div>

                    {activeDemands.loading ? (
                        <p className="text-sm text-muted-foreground">Cargando...</p>
                    ) : activeDemands.error ? (
                        <p className="text-sm text-red-500">{activeDemands.error}</p>
                    ) : activeDemands.demands.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay solicitudes activas.</p>
                    ) : (
                        <>
                            <div className="mt-4 space-y-4">
                                {activeDemands.demands.map((demand) => (
                                    <div key={demand.id} className="border p-4 rounded">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold">{demand.origin}</h3>
                                                <p className="text-sm text-gray-600">
                                                    Tipo de vehículo: {demand.carType}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Fecha: {formatDate(demand.createdAt)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => openModal(demand, "ASSIGN")}
                                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            >
                                                Tomar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Pagination
                                page={activeDemands.page}
                                totalPages={activeDemands.totalPages}
                                pageSize={activeDemands.pageSize}
                                onPageChange={activeDemands.handlePageChange}
                                onPageSizeChange={activeDemands.handlePageSizeChange}
                            />
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                <div className="bg-card p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-primary-foreground">Solicitudes Asignadas</h2>
                    </div>

                    {takenDemands.loading ? (
                        <p className="text-sm text-muted-foreground">Cargando...</p>
                    ) : takenDemands.error ? (
                        <p className="text-sm text-red-500">{takenDemands.error}</p>
                    ) : takenDemands.demands.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay solicitudes asignadas.</p>
                    ) : (
                        <>
                            <div className="mt-4 space-y-4">
                                {takenDemands.demands.map((demand) => (
                                    <div key={demand.id} className="border p-4 rounded">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold">{demand.origin}</h3>
                                                <p className="text-sm text-gray-600">
                                                    Tipo de vehículo: {demand.carType}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Fecha: {formatDate(demand.createdAt)}
                                                </p>
                                            </div>
                                            <div className="space-x-2">
                                                <button
                                                    onClick={() => openModal(demand, "SHOW")}
                                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                >
                                                    Ver
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Pagination
                                page={takenDemands.page}
                                totalPages={takenDemands.totalPages}
                                pageSize={takenDemands.pageSize}
                                onPageChange={takenDemands.handlePageChange}
                                onPageSizeChange={takenDemands.handlePageSizeChange}
                            />
                        </>
                    )}
                </div>
            </div>

            {isModalOpen && selectedDemand && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={showConfirmButton ? "Tomar solicitud" : "Detalles de la solicitud"}
                >
                    <div className="space-y-4">
                        <p><strong>Origen:</strong> {selectedDemand.origin}</p>
                        <p><strong>Tipo de vehículo:</strong> {selectedDemand.carType}</p>
                        <p><strong>Descripción:</strong> {selectedDemand.description || "N/A"}</p>
                        <p><strong>Fecha:</strong> {formatDate(selectedDemand.createdAt)}</p>

                        {modalError && (
                            <p className="text-red-500">{modalError}</p>
                        )}

                        {showConfirmButton && (
                            <button
                                onClick={takeDemand}
                                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                            >
                                Confirmar
                            </button>
                        )}
                    </div>
                </Modal>
            )}
        </>
    );
}