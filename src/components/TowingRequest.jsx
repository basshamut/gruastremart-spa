import React, { useState } from "react";
import GeoLocation from "./GeoLocation";
import TowingRequestForm from "./TowingRequestForm";

export default function TowingRequest() {
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
        <div className="p-4 max-w-4xl mx-auto">
            <div className="mt-10">
                <GeoLocation onLocationChange={handleLocationChange} onDestinationChange={handleDestinationChange} />
                <TowingRequestForm formData={formData} setFormData={setFormData} />
            </div>
        </div>
    );
}
