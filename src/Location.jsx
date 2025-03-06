import { useState } from "react";

function Location() {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError("La geolocalización no es compatible con este navegador.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitud: position.coords.latitude,
                    longitud: position.coords.longitude,
                    precision: position.coords.accuracy,
                });
                setError(null);
            },
            (error) => {
                setError("Error obteniendo ubicación: " + error.message);
            },
            {
                enableHighAccuracy: true, // Intentar obtener GPS preciso
                timeout: 10000, // Tiempo máximo de espera
                maximumAge: 0, // No usar caché
            }
        );
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>Mini App de Geolocalización</h1>
            <button onClick={getLocation}>Obtener Ubicación</button>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {location && (
                <div>
                    <p><strong>Latitud:</strong> {location.latitud}</p>
                    <p><strong>Longitud:</strong> {location.longitud}</p>
                    <p><strong>Precisión:</strong> {location.precision} metros</p>
                    <a
                        href={`https://www.google.com/maps?q=${location.latitud},${location.longitud}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Ver en Google Maps
                    </a>
                </div>
            )}
        </div>
    );
}

export default Location;
