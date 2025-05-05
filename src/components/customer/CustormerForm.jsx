import { useState } from "react";

export default function CustomerForm({ formData, setFormData, onDemandCreated }) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;
    const [message, setMessage] = useState(null);
    const [sending, setSending] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        setMessage(null);

        try {
            const response = await fetch(`${apiDomain}/v1/crane-demands`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();

                setMessage("✅ Solicitud enviada correctamente.");

                // Informar al componente padre del ID de la solicitud creada
                if (onDemandCreated && data?.id) {
                    onDemandCreated(data.id);
                }

                setFormData({
                    description: "",
                    origin: "",
                    carType: "",
                    breakdown: "",
                    referenceSource: "",
                    recommendedBy: "",
                    currentLocation: null,
                    destinationLocation: null,
                });
            } else {
                const errorData = await response.json();
                if(errorData?.message && errorData?.message === "User already has an active or taken crane demand") {
                    setMessage("❌ Ya tienes una solicitud activa o asignada a un operador.");
                }
                else {
                    setMessage("❌ Error al enviar la solicitud.");
                }
            }
        } catch (error) {
            console.error(error);
            setMessage("❌ Error de conexión con el servidor.");
        } finally {
            setSending(false);
        }
    };

    const isFormValid = () => {
        return (
            formData.origin?.trim() &&
            formData.carType?.trim() &&
            formData.breakdown?.trim() &&
            formData.referenceSource?.trim() &&
            formData.recommendedBy?.trim() &&
            formData.description?.trim() &&
            formData.currentLocation !== null &&
            formData.destinationLocation !== null
        );
    };

    return (
        <>
            <h2 className="text-2xl font-bold mb-4 text-center">Datos Generales</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: "¿Desde dónde hace la solicitud?", name: "origin" },
                    { label: "Tipo de vehículo:", name: "carType" },
                    { label: "Avería:", name: "breakdown" },
                    { label: "¿Dónde nos ha conocido?", name: "referenceSource" },
                    { label: "¿Quién lo recomienda?", name: "recommendedBy" },
                ].map((field) => (
                    <div key={field.name} className="flex flex-col items-center">
                        <label className="block font-medium mb-1 w-4/5">{field.label}</label>
                        <input
                            type="text"
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            className="w-4/5 border rounded p-2"
                        />
                    </div>
                ))}

                <div className="flex flex-col items-center col-span-1 md:col-span-1">
                    <label className="block font-medium mb-1 w-4/5">Descripción del evento:</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-4/5 border rounded p-2"
                        rows={3}
                    />
                </div>

                <div className="md:col-span-3 flex justify-center mt-4">
                    <div className="flex flex-col items-center w-4/5 max-w-[900px]">
                        <div className="flex gap-4 justify-center">
                            <button
                                type="submit"
                                disabled={sending || !isFormValid()}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
                                title={
                                    !isFormValid()
                                        ? "Rellena todos los campos y asegúrate de tener ubicaciones seleccionadas"
                                        : ""
                                }
                            >
                                {sending ? "Enviando..." : "Solicitar Grúa"}
                            </button>

                            <button
                                type="button"
                                onClick={() => document.location.reload()}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded"
                            >
                                Reiniciar
                            </button>
                        </div>

                        {!isFormValid() && !sending && (
                            <p className="text-sm text-red-500 text-center mt-2">
                                Rellena todos los campos y asegúrate de haber seleccionado tu ubicación actual y el destino.
                            </p>
                        )}
                    </div>
                </div>
            </form>

            {message && (
                <p className="text-center mt-4 font-semibold">{message}</p>
            )}
        </>
    );
}