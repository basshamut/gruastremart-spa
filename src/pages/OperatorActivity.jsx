import React, {useEffect, useState} from "react";

import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import {usePaginatedDemands} from "../hooks/usePaginatedDemands";
import {useCraneNotifications} from "../hooks/useCraneNotifications";
import {assignCraneDemand} from "../services/CraneDemandService.js";
import {formatDate} from "../utils/Utils.js";

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
                        <h2 className="text-lg font-bold text-primary-foreground">Solicitudes Abiertas</h2>
                        {pendingNotificationsForActiveDemands.length > 0 && (
                            <button
                                onClick={refreshData}
                                className="bg-primary text-white text-xs px-3 py-1 rounded-full flex items-center"
                            >
                                {pendingNotificationsForActiveDemands.length} nueva{pendingNotificationsForActiveDemands.length > 1 ? 's' : ''} • Ver
                            </button>
                        )}
                    </div>
                    <div className="mt-4">
                        {activeDemands.loading ? (
                            <p className="text-sm text-muted-foreground">Cargando...</p>
                        ) : activeDemands.error ? (
                            <p className="text-sm text-red-500">{error}</p>
                        ) : activeDemands.demands.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No hay actividad reciente.</p>
                        ) : (
                            <>
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left border-collapse mt-2">
                                        <thead>
                                        <tr className="border-b">
                                            <th className="p-2">Falla</th>
                                            <th className="p-2">Origen</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {activeDemands.demands.map((demand) => (
                                            <tr
                                                key={demand.id}
                                                className="border-b cursor-pointer hover:bg-gray-100"
                                                onClick={() => openModal(demand, "ASSIGN")}
                                            >
                                                <td className="p-2">{demand.breakdown}</td>
                                                <td className="p-2">{demand.origin}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="md:hidden space-y-2 mt-2">
                                    {activeDemands.demands.map((demand) => (
                                        <div
                                            key={demand.id}
                                            className="border rounded p-3 cursor-pointer hover:bg-gray-100"
                                            onClick={() => openModal(demand, "ASSIGN")}
                                        >
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <span
                                                        className="font-medium text-xs block text-muted-foreground">Falla</span>
                                                    <span className="line-clamp-1">{demand.breakdown}</span>
                                                </div>
                                                <div>
                                                    <span
                                                        className="font-medium text-xs block text-muted-foreground">Origen</span>
                                                    <span className="line-clamp-1">{demand.origin}</span>
                                                </div>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                <div className="bg-card p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-primary-foreground">Solicitudes Asignadas</h2>
                        {pendingNotificationsForActiveDemands.length > 0 && (
                            <button
                                onClick={refreshData}
                                className="bg-primary text-white text-xs px-3 py-1 rounded-full flex items-center"
                            >
                                {pendingNotificationsForActiveDemands.length} nueva{pendingNotificationsForActiveDemands.length > 1 ? 's' : ''} • Ver
                            </button>
                        )}
                    </div>
                    <div className="mt-4">
                        {takenDemands.loading ? (
                            <p className="text-sm text-muted-foreground">Cargando...</p>
                        ) : takenDemands.error ? (
                            <p className="text-sm text-red-500">{error}</p>
                        ) : takenDemands.demands.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No hay actividad reciente.</p>
                        ) : (
                            <>
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left border-collapse mt-2">
                                        <thead>
                                        <tr className="border-b">
                                            <th className="p-2">Falla</th>
                                            <th className="p-2">Origen</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {takenDemands.demands.map((demand) => (
                                            <tr
                                                key={demand.id}
                                                className="border-b cursor-pointer hover:bg-gray-100"
                                                onClick={() => openModal(demand, "SHOW")}
                                            >
                                                <td className="p-2">{demand.breakdown}</td>
                                                <td className="p-2">{demand.origin}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="md:hidden space-y-2 mt-2">
                                    {takenDemands.demands.map((demand) => (
                                        <div
                                            key={demand.id}
                                            className="border rounded p-3 cursor-pointer hover:bg-gray-100"
                                            onClick={() => openModal(demand, "SHOW")}
                                        >
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <span
                                                        className="font-medium text-xs block text-muted-foreground">Falla</span>
                                                    <span className="line-clamp-1">{demand.breakdown}</span>
                                                </div>
                                                <div>
                                                    <span
                                                        className="font-medium text-xs block text-muted-foreground">Origen</span>
                                                    <span className="line-clamp-1">{demand.origin}</span>
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
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                onConfirm={takeDemand}
                title="Detalles de la Solicitud"
                confirmText="Tomar Solicitud"
                showConfirmButton={showConfirmButton}
                cancelText="Cerrar"
            >
                <p><strong>Falla:</strong> {selectedDemand?.breakdown}</p>
                <p><strong>Descripción:</strong> {selectedDemand?.description}</p>
                <p><strong>Tipo de coche:</strong> {selectedDemand?.carType}</p>
                <p><strong>Ubicación actual:</strong> {selectedDemand?.currentLocation?.name}</p>
                <p><strong>Destino:</strong> {selectedDemand?.destinationLocation?.name}</p>
                <p>
                    <strong>Fecha:</strong> {selectedDemand?.createdAt && formatDate(selectedDemand.createdAt)}
                </p>

                {modalError && (
                    <p className="text-red-500 mt-2">{modalError}</p>
                )}
            </Modal>


        </>
    );
}