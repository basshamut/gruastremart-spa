import React, {useEffect, useState} from "react";
import CustomerGeoLocation from "../components/customer/CustomerGeoLocation";
import CustomerForm from "../components/customer/CustormerForm";
import CustomerRequests from "../components/customer/CustomerRequests.jsx";

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

    const [createdDemandId, setCreatedDemandId] = useState(null);
    const [requests, setRequests] = useState([]);

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
                setRequests([]);
            }
        };
        fetchRequests();
    }, []);

    return (
        <>
            <h1 className="text-2xl font-bold text-foreground">Bienvenido de nuevo {userName} !</h1>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                <CustomerRequests/>
            </div>

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
        </>
    );
}
