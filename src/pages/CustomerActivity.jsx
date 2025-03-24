import React, { useState } from "react";
import CustomerGeoLocation from "../components/customer/CustomerGeoLocation";
import CustomerForm from "../components/customer/CustormerForm";

export default function CustomerActivity() {
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

    const handleLocationChange = (location) => {
        setFormData((prev) => ({ ...prev, currentLocation: location }));
    };

    const handleDestinationChange = (location) => {
        setFormData((prev) => ({ ...prev, destinationLocation: location }));
    };

    return (
        <>
            <h1 className="text-2xl font-bold text-foreground">Bienvenido de nuevo!</h1>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                <div className="bg-card p-4 rounded-lg shadow-md">
                    <CustomerGeoLocation onLocationChange={handleLocationChange} onDestinationChange={handleDestinationChange} />
                    <CustomerForm formData={formData} setFormData={setFormData} />
                </div>
            </div>
        </>
    );
}
