import React, {useEffect, useState} from "react";
import CustomerGeoLocation from "../components/customer/CustomerGeoLocation";
import CustomerForm from "../components/customer/CustormerForm";
import CustomerRequests from "../components/customer/CustomerRequests.jsx";
import PaymentStep from "../components/customer/PaymentStep";
import PaymentWaitingScreen from "../components/customer/PaymentWaitingScreen";
import { useAutoRefresh } from "../hooks/data/useAutoRefresh";
import PreServicePaymentService from "../services/PreServicePaymentService";

export default function CustomerActivity() {
    const [formData, setFormData] = useState({
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
        customerName: "",
        customerPhone: "",
        currentLocation: null,
        destinationLocation: null,
    });

    const [, setCreatedDemandId] = useState(null);
    const [, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState("solicitudes");

    // Estados para el flujo multi-paso de pago pre-servicio
    const [formStep, setFormStep] = useState('form'); // 'form' | 'payment' | 'waiting'
    const [pendingFormData, setPendingFormData] = useState(null);
    const [pendingPaymentId, setPendingPaymentId] = useState(null);
    const [submittingPayment, setSubmittingPayment] = useState(false);

    // Hook para auto-refresh cada 30 segundos
    const { refreshTrigger } = useAutoRefresh(30);

    const userName = JSON.parse(localStorage.getItem("userDetail")).name;
    const userId = JSON.parse(localStorage.getItem("userDetail")).id;

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

    // Manejador para cuando el usuario llena el formulario y pasa al pago
    const handleFormSubmit = (data) => {
        // Guardar los datos del formulario y pasar al paso de pago
        setPendingFormData(data);
        setFormStep('payment');
    };

    // Manejador para cuando el usuario envía el pago
    const handlePaymentSubmit = async (paymentData) => {
        setSubmittingPayment(true);

        try {
            // Enviar pago pre-servicio con los datos del formulario
            const response = await PreServicePaymentService.submitPreServicePayment(
                userId,
                paymentData,
                pendingFormData
            );

            // Guardar el ID del pago
            setPendingPaymentId(response.data.id);

            // Cambiar al paso de espera
            setFormStep('waiting');
        } catch (error) {
            console.error('Error al enviar pago:', error);
            alert('Error al procesar el pago: ' + error.message + '\nPor favor intenta de nuevo.');
        } finally {
            setSubmittingPayment(false);
        }
    };

    // Manejador para cuando el pago es verificado
    const handlePaymentVerified = (payment) => {
        alert('¡Pago verificado! Tu solicitud ha sido activada y está disponible para los operadores.');

        // Resetear el flujo
        setFormStep('form');
        setPendingFormData(null);
        setPendingPaymentId(null);

        // Cambiar a pestaña de solicitudes para ver la solicitud activa
        setActiveTab('solicitudes');
    };

    // Manejador para cuando el pago es rechazado
    const handlePaymentRejected = (payment) => {
        const reason = payment.verificationComments || 'Verifica los datos e intenta nuevamente';
        alert(`Pago rechazado: ${reason}\n\nPuedes volver a intentar desde el paso de pago.`);

        // Volver al paso de pago para que pueda reintentar
        setFormStep('payment');
        setPendingPaymentId(null);
    };

    // Manejador para volver del paso de pago al formulario
    const handleBackToForm = () => {
        setFormStep('form');
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
                console.error(err);
                setRequests([]);
            }
        };
        fetchRequests();
    }, []);

    return (
        <>
            <h1 className="text-2xl font-bold text-foreground">Bienvenido de nuevo {userName} !</h1>

            {/* Panel de tabs */}
            <div className="mt-6 mb-4 flex border-b border-gray-200">
                <button
                    className={`px-4 py-2 font-semibold focus:outline-none transition-colors duration-200 border-b-2 ${activeTab === "solicitudes" ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-green-600"}`}
                    onClick={() => setActiveTab("solicitudes")}
                >
                    Solicitudes
                </button>
                <button
                    className={`ml-4 px-4 py-2 font-semibold focus:outline-none transition-colors duration-200 border-b-2 ${activeTab === "formulario" ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-green-600"}`}
                    onClick={() => setActiveTab("formulario")}
                >
                    Nueva solicitud
                </button>
            </div>

            {/* Contenido de los tabs */}
            {activeTab === "solicitudes" && (
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                    <CustomerRequests refreshTrigger={refreshTrigger} />
                </div>
            )}
            {activeTab === "formulario" && (
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                    <div className="bg-card p-4 rounded-lg shadow-md">
                        {/* Paso 1: Formulario */}
                        {formStep === 'form' && (
                            <>
                                <CustomerGeoLocation
                                    onLocationChange={handleLocationChange}
                                    onDestinationChange={handleDestinationChange}
                                />
                                <CustomerForm
                                    formData={formData}
                                    setFormData={setFormData}
                                    onCustomSubmit={handleFormSubmit}
                                    submitButtonText="Continuar al Pago"
                                />
                            </>
                        )}

                        {/* Paso 2: Pago */}
                        {formStep === 'payment' && (
                            <PaymentStep
                                formData={pendingFormData}
                                onBack={handleBackToForm}
                                onPaymentSubmit={handlePaymentSubmit}
                            />
                        )}

                        {/* Paso 3: Esperando verificación */}
                        {formStep === 'waiting' && pendingPaymentId && (
                            <PaymentWaitingScreen
                                paymentId={pendingPaymentId}
                                onVerified={handlePaymentVerified}
                                onRejected={handlePaymentRejected}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
