import React, {useEffect, useState} from "react";
import CustomerGeoLocation from "../components/customer/CustomerGeoLocation";
import CustomerForm from "../components/customer/CustormerForm";
import {useTakenDemandNotification} from "../hooks/customer/useCraneTakenNotifications.js";
import CustomerRequests from "../components/customer/CustomerRequests.jsx";

//TODO Verificar antes enviar el formulario si el cliente tiene solicitudes abiertas. No puede tener ni en estado ACTIVE ni en TAKEN

export default function CustomerActivity({view}) {
    const [formData, setFormData] = useState({
        description: "",
        origin: "",
        carType: "",
        breakdown: "",
        referenceSource: "",
        recommendedBy: "",
        currentLocation: null,
        destinationLocation: null,
    });

    const [takenMessage, setTakenMessage] = useState(null);
    const [createdDemandId, setCreatedDemandId] = useState(null);
    const [requests, setRequests] = useState([]);

    useTakenDemandNotification(
        createdDemandId,
        () => {
            console.log("🚨 Tu solicitud ha sido tomada por un operador.");
            setTakenMessage("🎉 Tu solicitud ha sido tomada por un operador.");
            localStorage.removeItem("lastCreatedDemandId");
            setCreatedDemandId(null);
        },
        (status) => {
            console.log("📡 Estado del WebSocket:", status);
        }
    );

    const handleLocationChange = (location) => {
        setFormData((prev) => ({...prev, currentLocation: location}));
    };

    const handleDestinationChange = (location) => {
        setFormData((prev) => ({...prev, destinationLocation: location}));
    };

    const handleCreatedDemand = (newDemandId) => {
        setCreatedDemandId(newDemandId);
        localStorage.setItem("lastCreatedDemandId", newDemandId);
    };

    useEffect(() => {
        const storedId = localStorage.getItem("lastCreatedDemandId");
        if (storedId) {
            setCreatedDemandId(storedId);
        }
    }, []);

    // Obtener solicitudes del usuario para saber si hay alguna en estado TAKEN
    useEffect(() => {
        const fetchRequests = async () => {
            const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
            const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;
            try {
                const createdByUserId = JSON.parse(localStorage.getItem("userDetail")).id;
                const params = new URLSearchParams({
                    page: 0,
                    size: 10,
                    createdByUserId
                });
                const response = await fetch(`${apiDomain}/v1/crane-demands?${params.toString()}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) throw new Error("Error al obtener las solicitudes");
                const data = await response.json();
                setRequests(data.content || []);
            } catch (err) {
                setRequests([]);
            }
        };
        fetchRequests();
    }, []);

    // Buscar la solicitud en estado TAKEN
    const takenRequest = requests.find(r => r.state === "TAKEN");
    const takenDemandId = takenRequest?.id || null;
    const takenState = takenRequest?.state || null;

    return (
        <>
            <h1 className="text-2xl font-bold text-foreground">Bienvenido de nuevo!</h1>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                {takenMessage && (
                    <div className="bg-green-100 text-green-700 p-2 rounded mb-4">
                        {takenMessage}
                    </div>
                )}
                <CustomerRequests/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                <div className="bg-card p-4 rounded-lg shadow-md">
                    <CustomerGeoLocation
                        onLocationChange={handleLocationChange}
                        onDestinationChange={handleDestinationChange}
                        craneDemandId={takenDemandId}
                        takenState={takenState}
                    />
                    <CustomerForm
                        formData={formData}
                        setFormData={setFormData}
                        onDemandCreated={handleCreatedDemand}
                    />
                </div>
            </div>
        </>
    );
}
