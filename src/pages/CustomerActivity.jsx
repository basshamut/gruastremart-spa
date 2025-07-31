import React, {useEffect, useState} from "react";
import CustomerGeoLocation from "../components/customer/CustomerGeoLocation";
import CustomerForm from "../components/customer/CustormerForm";
import CustomerRequests from "../components/customer/CustomerRequests.jsx";
import { useAutoRefresh } from "../hooks/data/useAutoRefresh";

export default function CustomerActivity() {
    const [formData, setFormData] = useState({
        description: "",
        origin: "",
        carType: "",
        breakdown: "",
        referenceSource: "",
        recommendedBy: "",
        vehicleBrand: "",
        vehicleModel: "",
        vehicleYear: 0,
        vehiclePlate: "",
        vehicleColor: "",
        currentLocation: null,
        destinationLocation: null,
    });

    const [, setCreatedDemandId] = useState(null);
    const [, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState("solicitudes");

    // Hook para auto-refresh cada 30 segundos
    const { refreshTrigger } = useAutoRefresh(30);

    const userName = JSON.parse(localStorage.getItem("userDetail")).name

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
                if (!response.ok) {
                    throw new Error("Error al obtener las solicitudes");
                }
                const data = await response.json();
                setRequests(data.content || []);
            } catch (err) {
                console.error(err);
                setRequests([]);
            }
        };
        fetchRequests();
    }, []);

    return (
        <>
            <h1 className="text-2xl font-bold text-foreground">Bienvenido de nuevo {userName} !</h1>

            {/* Panel de tabs */}
            <div className="mt-6 mb-4 flex border-b border-gray-200">
                <button
                    className={`px-4 py-2 font-semibold focus:outline-none transition-colors duration-200 border-b-2 ${activeTab === "solicitudes" ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-green-600"}`}
                    onClick={() => setActiveTab("solicitudes")}
                >
                    Solicitudes
                </button>
                <button
                    className={`ml-4 px-4 py-2 font-semibold focus:outline-none transition-colors duration-200 border-b-2 ${activeTab === "formulario" ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-green-600"}`}
                    onClick={() => setActiveTab("formulario")}
                >
                    Nueva solicitud
                </button>
            </div>

            {/* Contenido de los tabs */}
            {activeTab === "solicitudes" && (
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                    <CustomerRequests refreshTrigger={refreshTrigger} />
                </div>
            )}
            {activeTab === "formulario" && (
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                    <div className="bg-card p-4 rounded-lg shadow-md">
                        <CustomerGeoLocation
                            onLocationChange={handleLocationChange}
                            onDestinationChange={handleDestinationChange}
                        />
                        <CustomerForm
                            formData={formData}
                            setFormData={setFormData}
                            onDemandCreated={handleCreatedDemand}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
