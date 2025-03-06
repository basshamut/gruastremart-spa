import {useState} from "react";

export default function GeoLocation() {
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
            (err) => {
                setError("Error obteniendo ubicación: " + err.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    return (
        <div className="flex flex-col items-center p-6">
            <h1 className="text-2xl font-bold mb-4">Mini App de Geolocalización</h1>

            <button
                onClick={getLocation}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
                Obtener Ubicación
            </button>

            {error && <p className="text-red-500 mt-4">{error}</p>}

            {location && (
                <div className="mt-4 text-center space-y-2">
                    <p>
                        <strong>Latitud:</strong> {location.latitud}
                    </p>
                    <p>
                        <strong>Longitud:</strong> {location.longitud}
                    </p>
                    <p>
                        <strong>Precisión:</strong> {location.precision} metros
                    </p>
                    <a
                        href={`https://www.google.com/maps?q=${location.latitud},${location.longitud}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 underline hover:text-blue-500"
                    >
                        Ver en Google Maps
                    </a>
                </div>
            )}
        </div>
    );
}