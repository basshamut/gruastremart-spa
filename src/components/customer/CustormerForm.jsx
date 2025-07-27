import { useState } from "react";

export default function CustomerForm({ formData, setFormData, onDemandCreated }) {
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;
    const [message, setMessage] = useState(null);
    const [sending, setSending] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ 
            ...prev, 
            [name]: name === 'vehicleYear' ? parseInt(value) || 0 : value 
        }));
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
                    vehicleBrand: "",
                    vehicleModel: "",
                    vehicleYear: 0,
                    vehiclePlate: "",
                    vehicleColor: "",
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
            formData.vehicleBrand?.trim() &&
            formData.vehicleModel?.trim() &&
            formData.vehicleYear > 0 &&
            formData.vehiclePlate?.trim() &&
            formData.vehicleColor?.trim() &&
            formData.currentLocation !== null &&
            formData.destinationLocation !== null
        );
    };

    return (
        <>
            <h2 className="text-2xl font-bold mb-6 text-center">Solicitud de Grúa</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Datos Generales */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Datos Generales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                            <label className="block font-medium mb-1 text-gray-700">¿Desde dónde hace la solicitud? *</label>
                            <input
                                type="text"
                                name="origin"
                                value={formData.origin}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block font-medium mb-1 text-gray-700">Tipo de vehículo *</label>
                            <input
                                type="text"
                                name="carType"
                                value={formData.carType}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block font-medium mb-1 text-gray-700">Avería *</label>
                            <input
                                type="text"
                                name="breakdown"
                                value={formData.breakdown}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block font-medium mb-1 text-gray-700">¿Dónde nos ha conocido? *</label>
                            <input
                                type="text"
                                name="referenceSource"
                                value={formData.referenceSource}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block font-medium mb-1 text-gray-700">¿Quién lo recomienda? *</label>
                            <input
                                type="text"
                                name="recommendedBy"
                                value={formData.recommendedBy}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="flex flex-col md:col-span-2 lg:col-span-1">
                            <label className="block font-medium mb-1 text-gray-700">Descripción del evento *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Datos del Vehículo */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Datos del Vehículo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                            <label className="block font-medium mb-1 text-gray-700">Marca *</label>
                            <input
                                type="text"
                                name="vehicleBrand"
                                value={formData.vehicleBrand}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ej: Toyota, Ford, Chevrolet"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block font-medium mb-1 text-gray-700">Modelo *</label>
                            <input
                                type="text"
                                name="vehicleModel"
                                value={formData.vehicleModel}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ej: Corolla, Fiesta, Aveo"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block font-medium mb-1 text-gray-700">Año *</label>
                            <input
                                type="number"
                                name="vehicleYear"
                                value={formData.vehicleYear}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ej: 2020"
                                min="1980"
                                max={new Date().getFullYear() + 1}
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block font-medium mb-1 text-gray-700">Placa *</label>
                            <input
                                type="text"
                                name="vehiclePlate"
                                value={formData.vehiclePlate}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ej: ABC-123"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block font-medium mb-1 text-gray-700">Color *</label>
                            <input
                                type="text"
                                name="vehicleColor"
                                value={formData.vehicleColor}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ej: Blanco, Azul, Rojo"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex justify-center gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={sending || !isFormValid()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-md transition-colors"
                    >
                        Reiniciar
                    </button>
                </div>

                {!isFormValid() && !sending && (
                    <p className="text-sm text-red-500 text-center mt-2">
                        Rellena todos los campos obligatorios (*) y asegúrate de haber seleccionado tu ubicación actual y el destino.
                    </p>
                )}
            </form>

            {message && (
                <div className={`text-center mt-4 p-3 rounded-md font-semibold ${
                    message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {message}
                </div>
            )}
        </>
    );
}