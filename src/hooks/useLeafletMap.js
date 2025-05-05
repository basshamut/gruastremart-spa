import { useEffect } from "react";
import L from "leaflet";

export function useLeafletMap(mapRef, location, searchLocation, operatorLocation, takenState, userIcon, destinationIcon, operatorIcon) {
    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map("map").setView([10.4806, -66.9036], 12);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors"
            }).addTo(mapRef.current);
        }
    }, [mapRef]);

    useEffect(() => {
        if (mapRef.current) {
            const map = mapRef.current;
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            if (location) {
                L.marker([location.latitude, location.longitude], {icon: userIcon}).addTo(map)
                    .bindPopup(location.name ? `Tu ubicación actual: ${location.name}` : "Tu ubicación actual")
                    .openPopup();
            }

            if (searchLocation) {
                L.marker([searchLocation.latitude, searchLocation.longitude], {icon: destinationIcon}).addTo(map)
                    .bindPopup(searchLocation.name ? `Destino: ${searchLocation.name}` : "Destino")
                    .openPopup();
            }

            if (takenState === "TAKEN" && operatorLocation) {
                L.marker([operatorLocation.lat, operatorLocation.lng], {icon: operatorIcon}).addTo(map)
                    .bindPopup("Ubicación actual del operador");
            }

            // Ajustar el mapa para mostrar todos los puntos
            const bounds = [];
            if (location) bounds.push([location.latitude, location.longitude]);
            if (searchLocation) bounds.push([searchLocation.latitude, searchLocation.longitude]);
            if (takenState === "TAKEN" && operatorLocation) bounds.push([operatorLocation.lat, operatorLocation.lng]);
            if (bounds.length > 1) {
                map.fitBounds(bounds);
            }
        }
    }, [location, searchLocation, operatorLocation, takenState, userIcon, destinationIcon, operatorIcon, mapRef]);
} 