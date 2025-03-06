import React from "react";
import GeoLocation from "../components/GeoLocation.jsx";

export default function Header() {
    return (
        <header className="bg-background p-4">
            <GeoLocation />
        </header>
    );
}
