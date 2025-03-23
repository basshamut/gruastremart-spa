import { useState } from "react";

export default function CustomerForm({ formData, setFormData }) {

    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = localStorage.getItem('jwt');
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
            const response = await fetch(`${apiDomain}/crane-demands`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setMessage("✅ Solicitud enviada correctamente.");
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
                setMessage("❌ Error al enviar la solicitud.");
            }
        } catch (error) {
            console.error(error);
            setMessage("❌ Error de conexión con el servidor.");
        } finally {
            setSending(false);
        }
    };

    return <>
        <h2 className="text-2xl font-bold mb-4 text-center">Datos Generales</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block font-medium mb-1">Descripción del evento:</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                    rows={3}
                />
            </div>

            <div>
                <label className="block font-medium mb-1">¿Desde dónde hace la solicitud?</label>
                <input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                />
            </div>

            <div>
                <label className="block font-medium mb-1">Tipo de vehículo:</label>
                <input
                    type="text"
                    name="carType"
                    value={formData.carType}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                />
            </div>

            <div>
                <label className="block font-medium mb-1">Avería:</label>
                <input
                    type="text"
                    name="breakdown"
                    value={formData.breakdown}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                />
            </div>

            <div>
                <label className="block font-medium mb-1">¿Dónde nos ha conocido?</label>
                <input
                    type="text"
                    name="referenceSource"
                    value={formData.referenceSource}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                />
            </div>

            <div>
                <label className="block font-medium mb-1">¿Quién lo recomienda?</label>
                <input
                    type="text"
                    name="recommendedBy"
                    value={formData.recommendedBy}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                />
            </div>

            <div className="md:col-span-3 flex justify-center mt-4">
                <button
                    type="submit"
                    disabled={sending}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
                >
                    {sending ? "Enviando..." : "Solicitar Grúa"}
                </button>
                <button
                type="button"
                onClick={() => document.location.reload()}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
                >
                    Reiniciar Solicitud
                </button>
            </div>
        </form>

        {message && (
            <p className="text-center mt-4 font-semibold">{message}</p>
        )}

    </>
}